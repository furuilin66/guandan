import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api';
import { LeaderboardItem } from '@/types';
import { ChevronLeft } from 'lucide-react';

export default function Leaderboard() {
  const navigate = useNavigate();
  const [rankings, setRankings] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const data = await api.getLeaderboard();
      setRankings(data.rankings);
    } catch (error) {
      console.error('Fetch leaderboard error', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const url = api.getExportUrl();
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `排行榜-${new Date().getTime()}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white p-4 shadow-sm mb-4 sticky top-0 z-10 flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 -ml-2 text-green-900 active:opacity-50 transition-opacity relative z-20 flex items-center"
          title="返回"
        >
          <ChevronLeft size={24} />
          <span className="text-sm font-medium ml-1">返回</span>
        </button>
        <h1 className="absolute left-0 right-0 text-xl font-bold text-center text-green-900 pointer-events-none">排行榜</h1>
        <div className="w-16"></div> {/* 占位符，保持平衡 */}
      </div>

      <div className="px-2">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex bg-gray-100 p-2 text-sm font-bold text-gray-600">
            <div className="w-10 text-center flex-shrink-0">排名</div>
            <div className="w-24 px-1 flex-shrink-0">队伍</div>
            <div className="flex-1 px-1">参赛记录</div>
            <div className="w-12 text-center flex-shrink-0">总分</div>
          </div>

          {/* List */}
          {loading ? (
            <div className="p-8 text-center text-gray-500">加载中...</div>
          ) : (
            rankings.map((item) => (
              <div key={item.teamId} className="flex border-b border-gray-100 last:border-0 text-sm">
                <div className="w-10 flex items-center justify-center font-bold text-green-900 flex-shrink-0 py-2">
                  {item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : item.rank}
                </div>
                <div className="w-24 px-1 flex items-center text-gray-800 flex-shrink-0 py-2 break-words">
                  {item.teamName}
                  {item.members && <span className="text-xs text-gray-500 block">({item.members})</span>}
                </div>
                <div className="flex-1 px-1 py-2 text-xs text-gray-600">
                  {item.rounds.length > 0 ? (
                    item.rounds.map((round) => (
                      <div key={round.round} className="mb-1 last:mb-0">
                        R{round.round}: {item.teamName}({round.score}) VS {round.opponent}
                        {round.opponentScore ? `(${round.opponentScore})` : ''}
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </div>
                <div className="w-12 flex items-center justify-center font-bold text-yellow-600 flex-shrink-0 py-2">
                  {item.totalScore}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="fixed bottom-8 left-0 right-0 px-8">
        <button
          onClick={handleExport}
          className="w-full h-12 bg-green-800 text-white rounded-full text-lg font-medium shadow-lg active:bg-green-900 active:shadow-md transition-all"
        >
          导出 Excel
        </button>
      </div>
    </div>
  );
}
