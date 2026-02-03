import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api';
import { useStore } from '@/store';
import { Team, Match } from '@/types';

export default function Record() {
  const navigate = useNavigate();
  const teamInfo = useStore((state) => state.teamInfo);
  const logout = useStore((state) => state.logout);

  const [teams, setTeams] = useState<Team[]>([]);
  const [rounds] = useState(['第一轮', '第二轮', '第三轮']);
  const [roundIndex, setRoundIndex] = useState(0);
  const [opponentName, setOpponentName] = useState('');
  const [levels] = useState([
    { label: '2', value: 2 },
    { label: '3', value: 3 },
    { label: '4', value: 4 },
    { label: '5', value: 5 },
    { label: '6', value: 6 },
    { label: '7', value: 7 },
    { label: '8', value: 8 },
    { label: '9', value: 9 },
    { label: '10', value: 10 },
    { label: 'J', value: 11 },
    { label: 'Q', value: 12 },
    { label: 'K', value: 13 },
    { label: 'A', value: 14 },
  ]);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [matchHistory, setMatchHistory] = useState<Match[]>([]);
  const [isEditingTeam, setIsEditingTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');

  useEffect(() => {
    if (!teamInfo) {
      navigate('/home');
      return;
    }
    fetchData();
  }, [teamInfo]);

  const fetchData = async () => {
    try {
      const [teamsData, historyData] = await Promise.all([
        api.getTeams(),
        api.getTeamMatches(teamInfo!.teamId)
      ]);
      // Filter out self
      setTeams(teamsData.filter((t: Team) => t.teamId !== teamInfo!.teamId));
      setMatchHistory(historyData.matches);
    } catch (error) {
      console.error('Fetch data error', error);
    }
  };

  const handleSubmit = async () => {
    if (!teamInfo) return;
    if (!opponentName) {
      alert('请选择或输入对手队伍');
      return;
    }
    if (!selectedLevel) {
      alert('请选择本局打到的级别');
      return;
    }

    try {
      await api.recordMatch({
        teamId: teamInfo.teamId,
        round: roundIndex + 1,
        opponentName,
        level: selectedLevel
      });
      alert('提交成功');
      // Reset form
      setOpponentName('');
      setSelectedLevel(null);
      // Refresh history
      const historyData = await api.getTeamMatches(teamInfo.teamId);
      setMatchHistory(historyData.matches);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      <div className="flex justify-between items-center py-4 mb-4">
        <div className="flex items-center">
          <span className="text-green-900 font-bold text-lg">当前队伍: {teamInfo?.teamName}</span>
          {/* Web version might not need name edit for simplicity, or add later */}
        </div>
        <button onClick={handleLogout} className="text-gray-500 text-sm">退出</button>
      </div>

      <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
        <h3 className="text-gray-800 font-medium mb-3">选择轮次</h3>
        <select
          className="w-full h-10 bg-gray-50 border-none rounded px-3"
          value={roundIndex}
          onChange={(e) => setRoundIndex(Number(e.target.value))}
        >
          {rounds.map((r, idx) => (
            <option key={idx} value={idx}>{r}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
        <h3 className="text-gray-800 font-medium mb-3">对手队伍</h3>
        <select
          className="w-full h-10 bg-gray-50 border-none rounded px-3 mb-3"
          value={opponentName}
          onChange={(e) => setOpponentName(e.target.value)}
        >
          <option value="">选择已有对手 ▼</option>
          {teams.map((t) => (
            <option key={t.teamId} value={t.teamName}>{t.teamName}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="或输入对手队伍名称"
          className="w-full h-10 bg-gray-50 border-none rounded px-3"
          value={opponentName}
          onChange={(e) => setOpponentName(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
        <h3 className="text-gray-800 font-medium mb-3">本局打到级别（得分）</h3>
        <div className="grid grid-cols-5 gap-2">
          {levels.map((item) => (
            <button
              key={item.value}
              onClick={() => setSelectedLevel(item.value)}
              className={`h-10 rounded text-sm font-medium transition-colors ${
                selectedLevel === item.value
                  ? 'bg-green-800 text-white'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full h-12 bg-green-800 text-white rounded-lg text-lg font-medium active:bg-green-900 mb-8"
      >
        提交成绩
      </button>

      {matchHistory.length > 0 && (
        <div className="mt-4">
          <h3 className="text-gray-800 font-medium mb-3 pl-2 border-l-4 border-green-800">已提交成绩</h3>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {matchHistory.map((match) => (
              <div key={match.matchId} className="flex justify-between items-center p-4 border-b border-gray-100 last:border-0">
                <span className="font-bold text-gray-800 w-16">第{match.round}轮</span>
                <span className="flex-1 text-green-800 font-medium text-right">
                  {teamInfo?.teamName}({match.score}分) VS {match.opponentName}
                  {match.opponentScore ? `(${match.opponentScore}分)` : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 text-center">
        <button 
          onClick={() => navigate('/leaderboard')}
          className="text-green-800 underline"
        >
          查看排行榜
        </button>
      </div>
    </div>
  );
}
