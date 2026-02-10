import React, { useState} from "react";
import "./Login.css";
import { auth } from '../firebase'; // Ensure this path is correct for your project
import { signInWithEmailAndPassword } from 'firebase/auth'; // Import the Firebase sign-in function
import SignUp from "./Signup";

const Login = ({ onLoginSuccess , onShowSignUp }) => { 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // State to store and display errors
  const [showSignUp, setShowSignUp] = useState(false);

  const handleLogin = async (e) => { // Made the function async
    e.preventDefault();
    setError(""); // Clear any previous errors

    // Basic client-side validation
    if (!email || !password) {
      setError("Please fill in both fields.");
      return;
    }

    try {
      // Call Firebase signInWithEmailAndPassword
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Successfully signed in user:', user.email);

      // If login is successful, you can call onLoginSuccess
      // to inform a parent component, typically for navigation or state update.
      if (onLoginSuccess) {
        onLoginSuccess(user); // Pass the user object
      }

    } catch (firebaseError) {
      // Catch and display Firebase-specific errors
      console.error("Firebase Sign-in Error:", firebaseError.code, firebaseError.message);
      let errorMessage = "Failed to sign in. Please try again.";

      // You can add more specific error messages based on firebaseError.code
      // switch (firebaseError.code) {
      //   case 'auth/user-not-found':
      //     errorMessage = 'No user found with this email.';
      //     break;
      //   case 'auth/wrong-password':
      //     errorMessage = 'Incorrect password.';
      //     break;
      //   case 'auth/invalid-email':
      //     errorMessage = 'Invalid email address.';
      //     break;
      //   case 'auth/too-many-requests':
      //     errorMessage = 'Too many failed login attempts. Please try again later.';
      //     break;
      //   // default:
      //   //   errorMessage = firebaseError.message; // Use Firebase's message as a fallback
      // }
      setError(errorMessage);
    }
  };

  return (
    <div className="login-page">
      {/* <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="Logo" /> */}
      <div className="slogan">
        <h2> Expensio </h2>
        <h4> Track your spending. Master your money! </h4>
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
            required // HTML5 validation for good measure
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required // HTML5 validation for good measure
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
