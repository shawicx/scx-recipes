import React, { useState, useEffect } from 'react';
import './styles/globals.css';

function App() {
  const [greeting, setGreeting] = useState('');

  async function greet() {
    // Example of calling a Tauri command
    // In the future, you would call actual API functions here
    setGreeting('Hello, Tauri + React + TypeScript App!');
  }

  return (
    <div className="container">
      <h1>Smart Diet</h1>
      <div className="row">
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo vite" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src="/react.svg" className="logo react" alt="React logo" />
        </a>
      </div>

      <p>Click on the Tauri, Vite, and React logos to learn more.</p>

      <div className="row">
        <button type="button" onClick={() => greet()}>
          Greet
        </button>
      </div>

      <p>{greeting}</p>
    </div>
  );
}

export default App;