# Changelog

All notable changes to the TaskMind Backend project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-03-24

### Added
- **v0.2.0** AI Services Model: Extracted AI logic from views into `services.py` for goal/task generation, incorporating file parsing (PDF, DOCX, images) and prompt building.
- **v0.2.0** Standalone Task Endpoints: Separated task endpoints to `/v1/tasks/` to improve API structure.
- **v0.2.0** Comprehensive Testing Suite: Added extensive unit and E2E tests, including database interaction mocking and real AI generation flow testing.

### Changed
- **v0.2.0** Code Architecture: Improved logic separation by ensuring views remain thin, moving complex routines into dedicated service layers.

### Fixed
- **v0.2.0** AI Service Resilience: Improved fault tolerance and error handling for AI generation services against API failures.

## [0.1.0] - 2026-03-01

### Added
- **v0.1.0** UUID Migration: Refactored API by migrating primary keys from integers to UUIDs across all models (Goals, Tasks) and endpoints.

### Changed
- **v0.1.0** URL Routing Consistency: Refactored URL patterns, strictly addressing and normalizing trailing slashes to prevent 404s and redirect loops.

### Fixed
- **v0.1.0** Production Authentication: Resolved persistent authentication redirect loops in the production environment related to cookie domain misconfigurations and backend 500 errors.
- **v0.1.0** Login Error Handling: Improved robustness of error handling for login attempts.

### Security
- **v0.1.0** Token Management: Implemented JWT (SimpleJWT) with secure login, logout (token blacklisting), and refresh token flows.
