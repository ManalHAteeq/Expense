import React, { useState } from "react";
import "./Login.css";
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

const Login = ({ onLoginSuccess, onShowSignUp }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in both fields.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      if (onLoginSuccess) onLoginSuccess(user);
    } catch (firebaseError) {
      console.error("Firebase Sign-in Error:", firebaseError.code, firebaseError.message);

      // FIXED: enabled specific error messages instead of always showing generic one
      let errorMessage = "Failed to sign in. Please try again.";
      switch (firebaseError.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Email or password is incorrect.';
          break;
        default:
          errorMessage = "Failed to sign in. Please try again.";
      }
      setError(errorMessage);
    }
  };

  return (
    <div className="login-page">
      <div className="slogan">
        <h2>Expensio</h2>
        <h4>Track your spending. Master your money!</h4>
      </div>
      <div className="login-card">
        <h2>Log in</h2>
        <form onSubmit={handleLogin}>
          {error && <p className="error-message" style={{ color: 'red', fontSize: '0.9em' }}>{error}</p>}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Sign In</button>
        </form>
        <p className="signup">Don't have an account?
          <span className="signup-btn" onClick={onShowSignUp}> Sign Up </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
