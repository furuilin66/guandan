import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store';

export default function Login() {
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const setHasAccess = useStore((state) => state.setHasAccess);

  const handleLogin = () => {
    if (password === '123456') {
      setHasAccess(true);
      navigate('/home');
    } else {
      alert('密码错误');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-20 px-4">
      <div className="mb-12">
        <h1 className="text-2xl font-bold text-green-900">掼蛋大赛计分</h1>
      </div>

      <div className="w-full max-w-sm space-y-4">
        <input
          type="password"
          placeholder="请输入访问密码"
          className="w-full h-12 px-4 border border-gray-300 rounded-lg text-center text-lg focus:outline-none focus:ring-2 focus:ring-green-600"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        
        <button
          onClick={handleLogin}
          className="w-full h-12 bg-green-800 text-white rounded-lg text-lg font-medium active:bg-green-900 transition-colors"
        >
          进入系统
        </button>
      </div>
    </div>
  );
}
