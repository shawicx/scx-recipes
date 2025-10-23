import React from "react";
import { ErrorProvider } from "./lib/ErrorContext";
import { ThemeProvider } from "./lib/ThemeContext";
import { ThemeToggle } from "./components/common";
import ProfileSetup from "./components/ProfileSetup";
import Recommendations from "./components/Recommendations";
import History from "./components/History";
import "./styles/globals.css";

function App() {
  return (
    <ThemeProvider>
      <ErrorProvider>
        <div className="app-container">
          <header className="app-header">
            <h1>智能饮食助手</h1>
            <ThemeToggle />
          </header>

          <main className="app-main">
            <div className="app-section">
              <h2>健康档案</h2>
              <ProfileSetup />
            </div>

            <div className="app-section">
              <h2>饮食推荐</h2>
              <Recommendations />
            </div>

            <div className="app-section">
              <h2>饮食记录</h2>
              <History />
            </div>
          </main>
        </div>
      </ErrorProvider>
    </ThemeProvider>
  );
}

export default App;
