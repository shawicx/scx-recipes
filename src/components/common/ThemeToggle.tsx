import React from "react";
import { useTheme } from "../../lib/ThemeContext";
import { Button } from "../common";

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return "☀️"; // Sun icon for light theme
      case "dark":
        return "🌙"; // Moon icon for dark theme
      case "system":
      default:
        return "💻"; // Computer screen for system theme
    }
  };

  return (
    <Button variant="secondary" size="small" onClick={toggleTheme}>
      {getThemeIcon()} {theme.charAt(0).toUpperCase() + theme.slice(1)}
    </Button>
  );
};

export default ThemeToggle;
