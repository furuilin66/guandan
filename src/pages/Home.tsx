import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api';
import { useStore } from '@/store';
import { Team } from '@/types';

export default function Home() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamName, setTeamName] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  
  const navigate = useNavigate();
  const setTeamInfo = useStore((state) => state.setTeamInfo);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const data = await api.getTeams();
      setTeams(data);
    } catch (error) {
      console.error('Failed to fetch teams', error);
    }
  };

  const handleLogin = async () => {
    if (!teamName.trim()) {
      alert('请输入队伍名称');
      return;
    }

    try {
      const data = await api.loginTeam(teamName);
      setTeamInfo({ teamId: data.teamId, teamName: data.teamName });
      navigate('/record');
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleReset = async () => {
    if (!resetPassword) return;
    try {
      await api.resetData(resetPassword);
      alert('重置成功');
      setShowResetModal(false);
      setResetPassword('');
      setTeamName('');
      fetchTeams();
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-10 px-4">
      <div className="mb-10 text-center">
        <h1 className="text-2xl font-bold text-green-900">掼蛋大赛计分</h1>
      </div>

      <div className="w-full max-w-sm mx-auto space-y-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">选择已有队伍</label>
          <select
            className="w-full h-10 border border-gray-300 rounded-md px-2 bg-white"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
          >
            <option value="">选择队伍...</option>
            {teams.map((team) => (
              <option key={team.teamId} value={team.teamName}>
                {team.teamName}
              </option>
            ))}
          </select>
        </div>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">或</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <input
          type="text"
          placeholder="输入新队伍名称"
          className="w-full h-12 px-4 border border-gray-300 rounded-lg"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
        />
        
        <button
          onClick={handleLogin}
          className="w-full h-12 bg-green-800 text-white rounded-lg text-lg font-medium active:bg-green-900"
        >
          进入比赛
        </button>
      </div>

      <div className="mt-auto mb-8 flex flex-col items-center space-y-4">
        <button 
          onClick={() => navigate('/leaderboard')}
          className="text-green-800 underline font-medium"
        >
          查看排行榜 &gt;
        </button>
        <button 
          onClick={() => setShowResetModal(true)}
          className="text-gray-400 text-sm underline"
        >
          重置数据
        </button>
      </div>

      {showResetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-xs">
            <h3 className="text-lg font-bold text-red-600 mb-2">警告</h3>
            <p className="text-sm text-gray-600 mb-4">此操作将永久删除所有队伍和比赛记录！</p>
            <input
              type="password"
              placeholder="请输入管理员密码"
              className="w-full h-10 border border-gray-300 rounded px-3 mb-4"
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
            />
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowResetModal(false)}
                className="flex-1 h-10 border border-gray-300 rounded text-gray-600"
              >
                取消
              </button>
              <button 
                onClick={handleReset}
                className="flex-1 h-10 bg-red-600 text-white rounded"
              >
                确定清空
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
