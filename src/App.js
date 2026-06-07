import React, { useState, useEffect } from "react";
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
import Expenses from "./components/Expenses";

import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setCheckingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  if (checkingAuth) return <div style={{ color: "white", padding: 40 }}>Loading...</div>;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage onSetUser={setUser} />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user}>
              <MainLayout user={user} />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard user={user} />} />
          <Route path="expenses" element={<Expenses user={user} />} />
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

function MainLayout({ user }) {
  return (
    <div className="app">
      <Sidebar user={user} />
      <Outlet />
    </div>
  );
}

function ProtectedRoute({ user, children }) {
  if (!user) return <Navigate to="/" replace />;
  return children;
}

export default App;
