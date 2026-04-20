import {
  FaHome,
  FaWallet,
  FaUserCircle,
  FaCog,
  FaQuestionCircle,
  FaSignOutAlt,
} from "react-icons/fa";

import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ThemeSwitch from "./ThemeSwitch";

const Sidebar = () => {
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserName(`${data.firstName} ${data.lastName}`);
      }
    };
    fetchUser();
  }, []);

  const capitalizeWords = (str) => {
    if (!str) return "";
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div className="sidebar">
      <div className="profile">
        <FaUserCircle size={100} />
        <span>{capitalizeWords(userName)}</span>
      </div>

      <nav>
        <ul>
          <li onClick={() => navigate("/dashboard")}>
            <FaHome /> Home
          </li>
          <li>
            <FaWallet /> Expenses
          </li>
          <li>
            <FaCog /> Settings
          </li>
          <li onClick={() => navigate("/dashboard/support")}>
            <FaQuestionCircle /> Support
          </li>
        </ul>
      </nav>

      <div className="theme-btn">
        <ThemeSwitch />
      </div>

      <li className="logout-btn" onClick={handleLogout}>
        <FaSignOutAlt /> Logout
      </li>
    </div>
  );
};

export default Sidebar;
