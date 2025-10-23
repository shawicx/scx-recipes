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
        return "☀️"; // 浅色主题太阳图标
      case "dark":
        return "🌙"; // 深色主题月亮图标
      case "system":
      default:
        return "💻"; // 系统主题电脑图标
    }
  };

  const getThemeText = () => {
    switch (theme) {
      case "light":
        return "浅色";
      case "dark":
        return "深色";
      case "system":
      default:
        return "系统";
    }
  };

  return (
    <Button variant="secondary" size="small" onClick={toggleTheme}>
      {getThemeIcon()} {getThemeText()}
    </Button>
  );
};

export default ThemeToggle;
