import { IoSunnyOutline, IoMoonOutline } from "react-icons/io5";
import { useState, useEffect } from "react";

const ThemeSwitch = () => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <div
      className={`theme-switch ${theme}`}
      onClick={toggleTheme}
      role="button"
      aria-label="Toggle theme"
    >
      <div className="icon sun">
        <IoSunnyOutline />
      </div>

      <div className="icon moon">
        <IoMoonOutline />
      </div>

      <div className="switch-knob" />
    </div>
  );
};

export default ThemeSwitch;
