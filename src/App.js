import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  Outlet,
} from "react-router-dom";

import Login from "./components/Login";
import SignUp from "./components/Signup";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Support from "./components/Support";

// import { auth } from "./firebase";
// FIXED: removed the signOut-on-load useEffect that was logging users out every page refresh.
// If you want sessions to persist, just remove that call entirely.
// If you explicitly want no auto-login, keep onAuthStateChanged but don't call signOut.

function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage onSetUser={setUser} />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user}>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard user={user} />} />
          <Route path="support" element={<Support />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

function LoginPage({ onSetUser }) {
  const navigate = useNavigate();
  const [showSignUp, setShowSignUp] = useState(false);

  return (
    <>
      <Login
        onLoginSuccess={(user) => {
          if (onSetUser) onSetUser(user);
          navigate("/dashboard");
        }}
        onShowSignUp={() => setShowSignUp(true)}
      />
      {showSignUp && <SignUp onClose={() => setShowSignUp(false)} />}
    </>
  );
}

function MainLayout() {
  return (
    <div className="app">
      <Sidebar />
      <Outlet />
    </div>
  );
}

function ProtectedRoute({ user, children }) {
  if (!user) return <Navigate to="/" replace />;
  return children;
}

export default App;
