import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./components/Login";
import SignUp from "./components/Signup";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import { auth } from "./firebase"; // optional: if you want to persist auth state
import { onAuthStateChanged } from "firebase/auth";

function App() {
  // track auth state here (optional but useful for protected routes)
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(false); //Here when we type '/dashboard' without signning in it won't direct to the dashboard and when refreshed it will come back to the login page 

  useEffect(() => {
    // listen for firebase auth state changes (optional)
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setCheckingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  if (checkingAuth) return <div>Loading...</div>;

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<LoginPage onSetUser={setUser} />}
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user}>
              <MainLayout user={user} onSetUser={setUser} />
            </ProtectedRoute>
          }
        />
        {/* catch-all redirect to login */}
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
          // this runs when Login calls onLoginSuccess(user)
          console.log("Login successful:", user?.email);
          if (onSetUser) onSetUser(user); // set parent (App) auth state
          navigate("/dashboard"); // redirect to dashboard
        }}
        // optional: pass sign up toggler
        onShowSignUp={() => setShowSignUp(true)}
      />

      {showSignUp && <SignUp onClose={() => setShowSignUp(false)} />}
    </>
  );
}

function MainLayout({ user, onSetUser }) {
  return (
    <div className="app">
      <Sidebar />
      <Dashboard user={user} onLogout={() => onSetUser(null)} />
    </div>
  );
}

/* ProtectedRoute: redirects to login if not authenticated */
function ProtectedRoute({ user, children }) {
  if (!user) {
    // if user is not signed in, redirect to login
    return <Navigate to="/" replace />;
  }
  return children;
}

export default App;
