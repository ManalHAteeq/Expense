import {
  FaHome,
  FaWallet,
  FaUserCircle,
  FaCog,
  FaQuestionCircle,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";

import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ThemeSwitch from "./ThemeSwitch";

const Sidebar = () => {
  const [userName, setUserName] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
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

  const go = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Hamburger button — only visible on mobile when sidebar is closed */}
      <button
        className={`sidebar-toggle ${mobileOpen ? "sidebar-toggle--hidden" : ""}`}
        onClick={() => setMobileOpen(true)}
      >
        <FaBars size={20} />
      </button>

      {/* Overlay — closes sidebar when tapping outside */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`sidebar ${mobileOpen ? "sidebar--open" : ""}`}>

        {/* Close button inside sidebar on mobile */}
        <button className="sidebar-close" onClick={() => setMobileOpen(false)}>
          <FaTimes size={18} />
        </button>

        <div className="profile">
          <FaUserCircle size={100} />
          <span>{capitalizeWords(userName)}</span>
        </div>

        <nav>
          <ul>
            <li onClick={() => go("/dashboard")}><FaHome /> Home</li>
            <li onClick={() => go("/dashboard/expenses")}><FaWallet /> Expenses</li>
            <li><FaCog /> Settings</li>
            <li onClick={() => go("/dashboard/support")}><FaQuestionCircle /> Support</li>
          </ul>
        </nav>

        <div className="theme-btn">
          <ThemeSwitch />
        </div>

        <li className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </li>
      </div>
    </>
  );
};

export default Sidebar;
