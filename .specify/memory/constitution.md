<!--
Version change: N/A → 1.0.0
List of modified principles: None (new constitution)
Added sections: Core Principles, Core Values, Success Criteria, Governance
Removed sections: None (new constitution)
Templates requiring updates:
- .specify/templates/plan-template.md ✅ updated
- .specify/templates/spec-template.md ✅ updated
- .specify/templates/tasks-template.md ✅ updated
- .specify/commands/*.toml ⚠ pending
Follow-up TODOs: None
-->
# Health Diet Recommendation Desktop App Constitution

## Core Principles

### Privacy-First Design
All user data must be stored locally on the user's device with no network transmission required. The application must function completely offline without any cloud dependencies. Users must have complete control over their personal health information.

### Local Processing Priority
All computation and recommendations must be performed locally using Rust-based algorithms. The system must not rely on external services for core functionality, ensuring both privacy and reliability.

### Transparent Algorithmic Recommendations
The recommendation logic must be explainable to users, with clear reasoning for why specific dietary suggestions are made. Users must be able to understand how their health profile influences the recommendations.

### Cross-Platform Desktop Accessibility
The application must provide a consistent user experience across Windows, macOS, and Linux platforms using Tauri for the interface layer. The UI must be intuitive and accessible to non-technical users.

### Performance-Driven Architecture
The system must prioritize responsive performance with recommendations generated quickly (response time < 200ms). All operations should be optimized to provide a smooth user experience without perceptible delays.

## Core Values

Privacy > Performance > Interpretability > Visual Aesthetics > Extensibility

## Success Criteria

- Application startup time ≤ 2 seconds
- Recommendation algorithms execute in real-time on local CPU
- Users can complete all primary operations without network connectivity
- Total data storage remains under 100 MB
- User can export or delete all local data at any time
- No user authentication or registration required

## Governance

This constitution defines the fundamental constraints and priorities that supersede all other development practices. All feature specifications, implementation decisions, and architectural choices must comply with these principles. Amendments to this constitution require explicit documentation of the change, its impact on existing functionality, and approval from the project maintainers.

**Version**: 1.0.0 | **Ratified**: 2025-10-19 | **Last Amended**: 2025-10-19
