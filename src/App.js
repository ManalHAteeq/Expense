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
import { onAuthStateChanged, signOut } from "firebase/auth";

function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(false); // Only check when needed

  useEffect(() => {
    // Optional: log out any persisted session on initial load
    signOut(auth).catch(() => {}); // ensure no user is auto-logged in
  }, []);

  if (checkingAuth) return <div>Loading...</div>;

  return (
    <Router>
      <Routes>
        {/* Login Route */}
        <Route
          path="/"
          element={<LoginPage onSetUser={setUser} />}
        />

        {/* Protected Dashboard Layout */}
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

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

/* -------------------- */
/* Login Page Wrapper   */
/* -------------------- */
function LoginPage({ onSetUser }) {
  const navigate = useNavigate();
  const [showSignUp, setShowSignUp] = useState(false);

  useEffect(() => {
    // Listen for auth state only on login page
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      // Do NOT auto-set user here
      // Keeps old behavior: typing /dashboard won't auto-login
    });
    return () => unsubscribe();
  }, []);

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

/* -------------------- */
/* Layout with Sidebar  */
/* -------------------- */
function MainLayout() {
  return (
    <div className="app">
      <Sidebar />
      <Outlet />
    </div>
  );
}

/* -------------------- */
/* Protected Route      */
/* -------------------- */
function ProtectedRoute({ user, children }) {
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default App;
