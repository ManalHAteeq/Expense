import React, { useState } from "react";
import { auth, db } from "../firebase"; // adjust path if needed
import { createUserWithEmailAndPassword } from "firebase/auth";
import "./Signup.css"
import { doc, setDoc } from "firebase/firestore"; //to save user data

const SignUp = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("Please fill all fields.");
      return;
    }

    try {
      // Firebase create user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log("User signed up:", user.email);
      setSuccess("Account created successfully!");

      // OPTIONAL: Save user in Firestore
      
      await setDoc(doc(db, "users", user.uid), {
        firstName: fname,
        lastName: lname,
        email: user.email,
        createdAt: new Date(),
      });

      setEmail("");
      setPassword("");
      setFname("");
      setLname("");
      onClose();

    } catch (firebaseError) {
      console.error("Sign up error:", firebaseError.code);

      let msg = "Failed to create account.";

      switch (firebaseError.code) {
        case "auth/email-already-in-use":
          msg = "Email is already in use.";
          break;
        case "auth/invalid-email":
          msg = "Invalid email address.";
          break;
        case "auth/weak-password":
          msg = "Password must be at least 6 characters.";
          break;
        default:
          msg = firebaseError.message;
      }

      setError(msg);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Create Account</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}

        <form onSubmit={handleSignUp}>
          
          <div className="name-row" >
            <input 
            type="text"
            placeholder="First Name"
            value={fname}
            onChange={(e) => setFname(e.target.value)}
            required
            /> 
            <input
            type="text"
            placeholder="Last Name"
            value={lname}
            onChange={(e) => setLname(e.target.value)}
            required
            /> 
          </div>
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

          <button type="submit">Sign Up</button>
        </form>

        <button className="close-btn" onClick={onClose}>
          x
        </button>
      </div>
    </div>
  );
};

export default SignUp;
