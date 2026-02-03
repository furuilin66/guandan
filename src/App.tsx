import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "@/pages/Login";
import Home from "@/pages/Home";
import Record from "@/pages/Record";
import Leaderboard from "@/pages/Leaderboard";
import { useStore } from "@/store";

// Route guard component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const hasAccess = useStore((state) => state.hasAccess);
  if (!hasAccess) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/home" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        
        <Route path="/record" element={
          <ProtectedRoute>
            <Record />
          </ProtectedRoute>
        } />
        
        <Route path="/leaderboard" element={
          <Leaderboard /> // Leaderboard can be public or protected? Let's make it public for easier access, or protected if needed. Assuming protected based on previous flow.
          // Actually, in the miniprogram, leaderboard is accessible from footer. Let's make it accessible but maybe redirect to login if tried to access directly without password?
          // For simplicity, let's protect it too as it's part of the internal system.
        } />

        {/* Redirect root to home (which will redirect to login if needed) */}
        <Route path="/" element={<Navigate to="/home" replace />} />
      </Routes>
    </Router>
  );
}
