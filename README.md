# Smart Diet Assistant

A Tauri-based application for offline health diet recommendations.

## Features

- Personal health profile setup
- Personalized diet recommendations based on user profile
- Diet history tracking with ratings and notes
- Cross-platform desktop application (Windows, macOS, Linux)
- Completely offline operation for privacy

## Tech Stack

- **Frontend**: React + TypeScript
- **Backend**: Rust with Tauri
- **Database**: SQLite for local data storage
- **Architecture**: Tauri commands bridge between frontend and Rust backend

## Setup

1. Install Rust and Node.js
2. Run `npm install` to install Node.js dependencies
3. Run `cargo tauri build` to build the application

## Project Structure

```
src-tauri/
├── src/
│   ├── main.rs          # Tauri application entry point
│   ├── commands.rs      # Tauri command definitions
│   ├── storage/         # Data storage module
│   │   ├── models.rs    # Data models
│   │   └── database.rs  # Database operations
│   ├── recommendation/  # Recommendation algorithm module
│   │   ├── engine.rs    # Main recommendation engine
│   │   └── rules.rs     # Rule-based recommendation logic
│   └── utils/           # Utility functions

src/
├── main.tsx             # React application entry point
├── App.tsx              # Main application component
├── components/          # React components
│   ├── ProfileSetup/    # Health profile setup UI
│   ├── Recommendations/ # Recommendation display UI
│   ├── History/         # Diet history tracking UI
│   └── common/          # Shared UI components
├── lib/                 # Client-side utilities
│   ├── api.ts           # Tauri command API wrapper
│   ├── types.ts         # TypeScript type definitions
│   ├── ErrorContext.tsx # Error handling context
│   └── ThemeContext.tsx # Theme management context
└── styles/              # Styling
```

## Architecture

The application follows a clean architecture with:

- **React UI Layer**: Provides the user interface and user interactions
- **Tauri Command Bridge**: Secure API between frontend and backend
- **Rust Business Logic**: Handles all core functionality, algorithms, and data operations
- **SQLite Database**: Local data storage for user profiles, recommendations, and history

## Offline-First Design

All data is stored locally with no network dependencies. The recommendation algorithm processes data locally on the user's device.

## Developer Wiki

For a comprehensive, developer-focused Wiki (Chinese with English technical terms when appropriate), see:
- .qwen/project_wiki.md
