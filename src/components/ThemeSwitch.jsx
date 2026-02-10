import { IoSunnyOutline, IoMoonOutline } from "react-icons/io5";
import { useState, useEffect } from "react";

const ThemeSwitch = () => {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.body.setAttribute("data-theme", savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.body.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
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