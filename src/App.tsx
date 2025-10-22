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
            <h1>Smart Diet Assistant</h1>
            <ThemeToggle />
          </header>

          <main className="app-main">
            <div className="app-section">
              <h2>Health Profile</h2>
              <ProfileSetup />
            </div>

            <div className="app-section">
              <h2>Diet Recommendations</h2>
              <Recommendations />
            </div>

            <div className="app-section">
              <h2>Diet History</h2>
              <History />
            </div>
          </main>
        </div>
      </ErrorProvider>
    </ThemeProvider>
  );
}

export default App;
