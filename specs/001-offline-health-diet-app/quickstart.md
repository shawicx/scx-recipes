# Quickstart Guide: Offline Health Diet Recommendation App

**Date**: Sunday, October 19, 2025
**Feature**: Offline Health Diet Recommendation App
**Branch**: 001-offline-health-diet-app

## Overview

This guide provides step-by-step instructions to get the offline health diet recommendation application up and running. The application is built with Tauri (Rust backend + React frontend) and runs completely offline on desktop platforms.

## Prerequisites

Before starting, ensure you have the following installed:

- **Rust**: Version 1.75 or higher
  - Install via [rustup.rs](https://rustup.rs/)
  - Verify with `rustc --version`

- **Node.js**: Version 18 or higher
  - Install via [nodejs.org](https://nodejs.org/)
  - Verify with `node --version`

- **Tauri CLI**: Version 1.0 or higher
  ```bash
  cargo install tauri-cli
  ```

- **Platform-specific requirements**:
  - **Windows**: Visual Studio build tools with C++ support
  - **macOS**: Xcode command line tools (`xcode-select --install`)
  - **Linux**:
    - `webkit2gtk` development libraries
    - `cmake`, `g++`, `libssl-dev`

## Setup Instructions

### 1. Clone and Initialize the Project

```bash
# Create project directory
mkdir health-diet-app
cd health-diet-app

# Initialize git repository
git init

# Set up the basic Tauri project structure (or copy from template)
# This assumes you've already created the project structure
```

### 2. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install Rust dependencies (if Cargo.lock exists, otherwise it will be created)
cargo check
```

### 3. Configure Tauri

The Tauri configuration is in `src-tauri/tauri.conf.json`. Ensure it matches your platform requirements:

```json
{
  "build": {
    "distDir": "../dist",
    "devPath": "http://localhost:1420",
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build"
  },
  "tauri": {
    "bundle": {
      "active": true,
      "targets": "all",
      "identifier": "com.example.healthdiet",
      "icon": [
        "icons/32x32.png",
        "icons/128x128.png",
        "icons/192x192.png"
      ]
    }
  }
}
```

### 4. Set Up the Database Schema

Create the SQLite database with the required tables:

```bash
# Run from the project root
cargo run --bin setup-db
```

Alternatively, if you have the database setup as a Rust script:

```bash
# Initialize the database structure
cargo run --bin db-migrate
```

## Development

### Running in Development Mode

```bash
# Terminal 1: Start the frontend dev server
npm run dev

# Terminal 2: Start the Tauri application
cargo tauri dev
```

### Building for Production

```bash
# Build the application bundle for your platform
cargo tauri build

# For specific platforms (if needed):
# Windows: cargo tauri build --target x86_64-pc-windows-msvc
# macOS:   cargo tauri build --target aarch64-apple-darwin
# Linux:   cargo tauri build --target x86_64-unknown-linux-gnu
```

The built application will be in `src-tauri/target/release/bundle/`.

## Key Features Walkthrough

### 1. Health Profile Setup

1. Launch the application
2. Navigate to the profile setup screen
3. Enter your age, weight, height, dietary preferences, allergies, and health goals
4. Save your profile - this data is stored locally on your device

### 2. Getting Diet Recommendations

1. After setting up your profile, go to the recommendations page
2. The app will generate personalized meal suggestions based on your profile data
3. Browse through recommendations and mark them as "tried" when you prepare them
4. All processing happens locally using Rust algorithms

### 3. Tracking Your Diet History

1. As you try meals, log them in the history section
2. Rate the meals and add notes about your experience
3. View your history to see patterns and successful meals

## Architecture Overview

```
┌─────────────────┐    invoke()     ┌──────────────────┐
│   React UI      │◄────────────────►│  Tauri Commands  │
│   (Frontend)    │                 │   (Rust Bridge)  │
└─────────────────┘                 └──────────────────┘
                                               │
                                               │ tauri::command
                                               │
                                       ┌──────────────────┐
                                       │   Rust Modules   │
                                       │  (Business Logic)│
                                       ├──────────────────┤
                                       │• Recommendation  │
                                       │• Storage         │
                                       │• Configuration   │
                                       └──────────────────┘
                                               │
                                               │ SQLite/JSON
                                               │
                                       ┌──────────────────┐
                                       │   Local Storage  │
                                       │  (User Data)     │
                                       └──────────────────┘
```

## Testing

### Running Tests

```bash
# Run Rust backend tests
cargo test

# Run frontend tests
npm run test

# Run end-to-end tests
npx playwright test
```

### Debugging

1. **Frontend**: Use browser developer tools when running in development mode
2. **Rust backend**: Check console logs and use `dbg!` macro for debugging
3. **Tauri communication**: Use `log` crate for logging Tauri command calls

## Data Storage Location

The application stores data in the appropriate system directory:
- **macOS**: `~/Library/Application Support/SmartDiet/`
- **Windows**: `%APPDATA%/SmartDiet/`
- **Linux**: `~/.local/share/SmartDiet/`

This includes:
- `data.db`: SQLite database with all user data
- `config.json`: Application settings
- `cache/`: Temporary files and optional ML models

## Troubleshooting

### Common Issues

1. **Tauri build fails**: Ensure platform-specific build tools are installed
2. **Database connection errors**: Check that the application has permission to write to its storage directory
3. **Frontend not updating**: Make sure both `npm run dev` and `cargo tauri dev` are running

### Getting Help

- Check the detailed documentation in the `/docs` directory
- Look for detailed error logs in the storage directory
- For Rust-specific issues, consult the [Tauri documentation](https://tauri.app/)
