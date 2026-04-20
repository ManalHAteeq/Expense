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

import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Firebase restores the session automatically — we just listen for it.
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setCheckingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // Wait until Firebase has resolved the session before rendering routes.
  // Without this, the app briefly sees user=null and redirects to login.
  if (checkingAuth) return <div style={{ color: "white", padding: 40 }}>Loading...</div>;

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
