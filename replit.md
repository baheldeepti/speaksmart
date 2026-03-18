# Toastmasters XR Practice Room

## Overview
A browser-based 3D game simulating a Toastmasters meeting where users can practice different meeting roles interactively in a virtual environment. Built with React Three Fiber for 3D rendering. Supports both solo practice and real-time multiplayer with 6+ players. Includes AI-powered speech evaluation, role-specific rubrics, progressive learning tracking, engagement analytics, a structured learning framework, and session replay with multiple camera angles.

## Recent Changes
- 2026-03-18: Added Learning Framework (5-stage public speaking improvement path with goals, role tips, and milestones), Session Replay (review past sessions in 3D from 6 camera angles with audio playback), interactive worksheets for Timer/Ah Counter/Grammarian (speaker tracking, per-speaker tallies, custom fillers, quick tags, notes areas)
- 2026-03-10: Enhanced all evaluations with detailed per-metric feedback, strengths/improvement areas sections, full expandable transcript for speakers, comprehensive multi-paragraph feedback for all 6 roles, IDOR security fixes on evaluation endpoints
- 2026-03-09: Added AI speech evaluation (OpenAI transcription + GPT analysis), role rubrics for all 6 roles, progress tracking, engagement dashboard, expanded Table Topics (100+ categorized prompts), optional Toastmasters Pathways project selection, multiplayer audience ratings
- 2026-02-24: Added user authentication (register/login), game session persistence, recording uploads, scoreboard, and game history
- 2026-02-24: Added audio recording to Speaker and Table Topics modes (record, playback, download)
- 2026-02-24: Switched from Capacitor to Expo for App Store builds, pushed code to GitHub
- 2026-02-24: Added multiplayer chat moderation, player blocking/reporting
- 2026-02-24: Added real-time multiplayer mode with WebSocket rooms, lobby system, role assignment, and synchronized gameplay
- 2026-02-24: Initial build of the complete game with all 6 roles, 3D meeting room, gamification system

## Project Architecture
- **Frontend**: React + React Three Fiber + Zustand for state management
- **Backend**: Express server (serves static files, WebSocket multiplayer, REST API)
- **Database**: PostgreSQL with Drizzle ORM (users, game_sessions, recordings, speech_evaluations, role_evaluations, engagement_events)
- **AI**: OpenAI integration (gpt-4o-mini-transcribe for STT, gpt-4o for analysis) via Replit AI Integrations
- **Auth**: Email/password with bcrypt hashing, express-session with PostgreSQL store
- **Multiplayer**: WebSocket server (`server/multiplayer.ts`) handles rooms, role assignment, real-time sync, audience ratings
- **Styling**: Inline styles for game UI
- **State**: 
  - `useToastmasters` - Solo game state (roles, timers, gamification, table topics, pathways)
  - `useMultiplayer` - Multiplayer state (rooms, WebSocket, sync, audience ratings)
  - `useAuth` - Authentication state (user, login/register/logout)
- **Persistence**: PostgreSQL for user accounts, game sessions, recordings, evaluations, engagement; LocalStorage for local points/badges

## Key Files
- `client/src/App.tsx` - Main app with auth gating, solo/multiplayer routing, progress/engagement/framework/replay screens
- `client/src/lib/stores/useToastmasters.tsx` - Solo game state store (100+ categorized table topics, pathways selection)
- `client/src/lib/stores/useMultiplayer.tsx` - Multiplayer state store (WebSocket client, audience ratings)
- `client/src/lib/stores/useAuth.tsx` - Auth state store (login/register/logout, engagement logging)
- `shared/schema.ts` - Database schema (users, game_sessions, recordings, speech_evaluations, role_evaluations, engagement_events)
- `server/storage.ts` - Database storage layer with Drizzle queries
- `server/routes.ts` - API routes (auth, sessions, recordings, scoreboard, evaluations, progress, engagement)
- `server/speechAnalysis.ts` - AI speech transcription & analysis, role evaluation functions
- `server/multiplayer.ts` - WebSocket server for room management, game sync, audience ratings
- `client/src/data/pathways.ts` - Toastmasters Pathways data (10 paths, 5 levels each, projects)
- `client/src/components/game/` - All game components:
  - `MainMenu.tsx` - Landing screen with Solo/Multiplayer/Progress/Engagement/Learning Path/Replay buttons
  - `MultiplayerLobby.tsx` - Create/join rooms, waiting lobby, role assignment, chat
  - `MultiplayerGame.tsx` - Multiplayer gameplay with role-specific UIs, audience rating system
  - `RoleSelection.tsx` - Solo role picker UI
  - `GameScene.tsx` - 3D Canvas with camera controls
  - `MeetingRoom.tsx` - 3D environment (podium, chairs, walls, lights)
  - `AudienceAvatars.tsx` - Animated audience members
  - `SpeakerMode.tsx` - Speaker role with countdown timer, recording banner, optional Pathways project selection
  - `TableTopicsMode.tsx` - Impromptu speaking with categorized prompts, recording banner, difficulty levels
  - `EvaluatorMode.tsx` - Watch & evaluate with checklist, sends metrics for rubric evaluation
  - `TimerRole.tsx` - Timer worksheet with multi-speaker tracking, per-speaker time log, G/Y/R indicators, notes
  - `GrammarianMode.tsx` - Grammarian worksheet with Word of Day tracking, quick tags, per-speaker notes, summary
  - `AhCounterMode.tsx` - Ah Counter worksheet with per-speaker filler tallies, custom fillers, breakdown, notes
  - `FeedbackScreen.tsx` - Post-session feedback with AI rubric display and badges
  - `RoleRubric.tsx` - Universal role rubric component (adapts to all 6 roles)
  - `ProgressTracker.tsx` - Progressive learning tracking dashboard
  - `EngagementDashboard.tsx` - Player engagement analytics dashboard
  - `LearningFramework.tsx` - 5-stage public speaking improvement framework with goals, role tips, milestones, practice tips
  - `SessionReplay.tsx` - 3D session replay with 6 camera angles, audio playback, timeline scrubbing

## API Endpoints
- POST `/api/evaluate-speech` - Transcribe + AI analyze speech recording
- POST `/api/evaluate-role` - Evaluate non-speaking role metrics (timer, evaluator, grammarian, ah counter)
- GET `/api/evaluations/:sessionId` - Get speech/role evaluation for a session
- GET `/api/progress` - Get user's evaluation history for all roles over time
- POST `/api/engagement` - Log an engagement event
- GET `/api/engagement/stats` - Get user's engagement metrics

## Multiplayer Flow
1. Main Menu -> Click "Multiplayer"
2. Enter name -> Create or Join room (6-letter code)
3. Lobby: Wait for 6+ players -> Host starts role assignment
4. Role Assignment: Each player picks a unique role -> Mark ready
5. Meeting: All roles play simultaneously in same 3D room
6. Audience Rating: After speaker finishes, others rate clarity/storytelling/confidence (1-5 stars)
7. Feedback: Meeting ends -> Play again or leave

## Game Phases (Solo)
1. `menu` - Main menu with stats display
2. `role_selection` - Choose from 6 roles
3. `playing` - Active role with 3D scene
4. `feedback` - Session complete screen with points/badges/AI rubric

## Learning Framework
5 stages of public speaking improvement:
1. Foundation (Sessions 1-10) - Build confidence, basic speech structure, time management
2. Awareness (Sessions 10-25) - Identify habits, filler words, critical listening
3. Structure (Sessions 25-50) - Master speech organization, openings, conclusions
4. Delivery (Sessions 50-100) - Vocal variety, body language, eye contact
5. Mastery (Sessions 100+) - Audience adaptation, storytelling, mentoring

## Session Replay
- Select any past session from history
- View the 3D meeting room from 6 camera angles: Audience, Behind Podium, Left Side, Right Side, Overhead, Cinematic
- Play back audio recordings with timeline scrubbing
- Auto-rotate mode for cinematic viewing
- Speaker indicator light at podium for speaker/table topics sessions

## Gamification
- Points per role: Speaker(50), Evaluator(40), Table Topics(30), Grammarian(25), Timer(20), Ah Counter(20)
- Levels: Beginner(0-199) -> Confident Speaker(200-499) -> Master Communicator(500+)
- 9 achievement badges
- AI evaluation rubrics for all 6 roles
- Progressive learning tracking across sessions

## User Preferences
- Wants multiplayer with minimum 6 players where each player takes a different role
