import React, { useState, useEffect, useRef } from "react";
import "./Login.css";
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

const StarField = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Generate stars once
    const stars = Array.from({ length: 160 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.4 + 0.3,           // radius 0.3–1.7px
      baseAlpha: Math.random() * 0.5 + 0.1,   // dim: 0.1–0.6
      speed: Math.random() * 0.008 + 0.003,   // twinkle speed
      offset: Math.random() * Math.PI * 2,    // phase offset
    }));

    let animId;
    let t = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 1;

      stars.forEach(star => {
        // Gentle sine-wave twinkle
        const alpha = star.baseAlpha + Math.sin(t * star.speed + star.offset) * 0.15;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, alpha)})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="star-canvas" />;
};

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
      let errorMessage = "Failed to sign in. Please try again.";
      switch (firebaseError.code) {
        case 'auth/user-not-found':    errorMessage = 'No account found with this email.'; break;
        case 'auth/wrong-password':    errorMessage = 'Incorrect password.'; break;
        case 'auth/invalid-email':     errorMessage = 'Invalid email address.'; break;
        case 'auth/too-many-requests': errorMessage = 'Too many failed attempts. Please try again later.'; break;
        case 'auth/invalid-credential': errorMessage = 'Email or password is incorrect.'; break;
        default: errorMessage = "Failed to sign in. Please try again.";
      }
      setError(errorMessage);
    }
  };

  return (
    <div className="login-page">
      <StarField />
      <div className="slogan">
        <img src={`${process.env.PUBLIC_URL}/mainlogo.png`} alt="Expensio Logo" className="login-logo" />
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
