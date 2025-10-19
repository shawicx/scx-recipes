# Implementation Plan: Offline Health Diet Recommendation App

**Branch**: `001-offline-health-diet-app` | **Date**: Sunday, October 19, 2025 | **Spec**: [link to spec.md](file:///Users/scx/Documents/code/scx-recipes/specs/001-offline-health-diet-app/spec.md)
**Input**: Feature specification from `/specs/001-offline-health-diet-app/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

The offline health diet recommendation application will be built using a Tauri-based architecture with Rust backend logic and a React frontend. Research has validated that this approach meets all constitutional requirements: privacy-first design (all data stored locally), local processing priority (Rust algorithms), transparent recommendations (rule-based with optional ONNX ML), cross-platform accessibility (Tauri framework), and performance-driven architecture (target <200ms response).

The system provides personalized diet recommendations using local processing algorithms, with all user data stored locally on the device. The architecture includes: Storage module (SQLite/JSON) for data persistence, Recommendation module (rule-based with optional ML) for generating suggestions, UI layer (React components) for user interaction, and Command bridge (Tauri commands) for secure frontend-backend communication. The application adheres to the core values priority: Privacy > Performance > Interpretability > Visual Aesthetics > Extensibility.

## Technical Context

**Language/Version**: Rust 1.75+ (backend/core logic), TypeScript 5.0+ (frontend), Tauri 1.0+  
**Primary Dependencies**: Tauri (framework), rusqlite (SQLite), serde (serialization), chrono (date/time), tauri-plugin-store (persistent storage), onnxruntime (optional ML inference)  
**Storage**: SQLite database with local JSON files for configuration and cache  
**Testing**: cargo test (Rust unit/integration tests), React testing library (UI tests), Playwright (end-to-end tests)  
**Target Platform**: Windows, macOS, Linux desktop applications  
**Project Type**: Desktop application with cross-platform compatibility  
**Performance Goals**: <200ms response time for recommendation generation, <2 seconds app startup time, offline operation  
**Constraints**: Must operate completely offline, data privacy (no network transmission), total package size <150MB, <100MB local data storage  
**Scale/Scope**: Single-user local application with personal health data, no concurrent users

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Compliance Verification

- ✅ **Privacy-First Design**: All user data is stored locally using SQLite and JSON files with no network transmission required. The application functions completely offline without any cloud dependencies.
- ✅ **Local Processing Priority**: All computation and recommendations are performed locally using Rust-based algorithms with optional ONNX runtime for ML inference.
- ✅ **Transparent Algorithmic Recommendations**: The recommendation logic is explainable to users, with clear reasoning for dietary suggestions based on their health profile.
- ✅ **Cross-Platform Desktop Accessibility**: Built using Tauri framework to ensure consistent experience across Windows, macOS, and Linux.
- ✅ **Performance-Driven Architecture**: Targeting <200ms response time for recommendations and <2 seconds app startup time as specified.

### Core Values Alignment

- Privacy > Performance > Interpretability > Visual Aesthetics > Extensibility - Architecture prioritizes data privacy above all other considerations, with performance as secondary priority.

### Post-Design Validation

All architectural decisions validated during design phase continue to comply with constitutional principles. No violations identified after detailed design work.

## Project Structure

### Documentation (this feature)

```
specs/001-offline-health-diet-app/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
src-tauri/
├── src/
│   ├── main.rs          # Tauri application entry point
│   ├── commands.rs      # Tauri command definitions (bridge between frontend and Rust)
│   ├── storage/         # Data storage module (SQLite operations)
│   │   ├── mod.rs
│   │   ├── models.rs    # Data models for storage
│   │   └── database.rs  # Database connection and operations
│   ├── recommendation/  # Recommendation algorithm module
│   │   ├── mod.rs
│   │   ├── rules.rs     # Rule-based recommendation logic
│   │   └── engine.rs    # Main recommendation engine
│   ├── config/          # Configuration management
│   │   └── mod.rs
│   └── utils/           # Utility functions
│       └── mod.rs
├── build.rs             # Build script
├── Cargo.toml           # Rust dependencies
└── tauri.conf.json      # Tauri configuration

src/
├── main.tsx             # React application entry point
├── App.tsx              # Main application component
├── components/          # React components
│   ├── ProfileSetup/    # Health profile setup UI
│   ├── Recommendations/ # Recommendation display UI
│   ├── History/         # Diet history tracking UI
│   └── common/          # Shared UI components
├── lib/                 # Client-side utilities and API wrappers
│   ├── api.ts           # Tauri command API wrapper
│   └── types.ts         # TypeScript type definitions
├── styles/              # Styling (CSS/Tailwind)
│   └── globals.css
└── assets/              # Static assets

public/
└── index.html           # HTML entry point

tests/
├── rust/                # Rust unit and integration tests
│   ├── storage_tests.rs
│   └── recommendation_tests.rs
├── e2e/                 # End-to-end tests with Playwright
│   └── main.test.ts
└── ui/                  # React component tests
    └── components.test.tsx

package.json             # Node.js dependencies and scripts
tsconfig.json            # TypeScript configuration
tailwind.config.js       # Tailwind CSS configuration
```

**Structure Decision**: Tauri application structure with Rust backend and React frontend, following Tauri's recommended project layout. The Rust code handles all business logic and data storage, while React provides the user interface. Tauri commands serve as the API bridge between the two layers.

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Tauri + React + Rust complexity | Provides secure cross-platform desktop app with local processing | Simple web app would not meet offline requirement |
| SQLite + JSON hybrid storage | SQLite for structured data, JSON for config/cache | Pure file storage would limit query capabilities needed for recommendations |

