# Toastmasters XR Practice Room

## Overview
A browser-based 3D game simulating a Toastmasters meeting where users can practice different meeting roles interactively in a virtual environment. Built with React Three Fiber for 3D rendering. Supports both solo practice and real-time multiplayer with 6+ players.

## Recent Changes
- 2026-02-24: Added real-time multiplayer mode with WebSocket rooms, lobby system, role assignment, and synchronized gameplay
- 2026-02-24: Initial build of the complete game with all 6 roles, 3D meeting room, gamification system

## Project Architecture
- **Frontend**: React + React Three Fiber + Zustand for state management
- **Backend**: Express server (serves static files, WebSocket multiplayer)
- **Multiplayer**: WebSocket server (`server/multiplayer.ts`) handles rooms, role assignment, real-time sync
- **Styling**: Inline styles for game UI, Tailwind CSS available for additional components
- **State**: 
  - `useToastmasters` - Solo game state (roles, timers, gamification)
  - `useMultiplayer` - Multiplayer state (rooms, WebSocket, sync)
- **Persistence**: LocalStorage for points, badges, and completed roles

## Key Files
- `client/src/App.tsx` - Main app with solo/multiplayer routing
- `client/src/lib/stores/useToastmasters.tsx` - Solo game state store
- `client/src/lib/stores/useMultiplayer.tsx` - Multiplayer state store (WebSocket client)
- `server/multiplayer.ts` - WebSocket server for room management & game sync
- `client/src/components/game/` - All game components:
  - `MainMenu.tsx` - Landing screen with Solo/Multiplayer buttons
  - `MultiplayerLobby.tsx` - Create/join rooms, waiting lobby, role assignment, chat
  - `MultiplayerGame.tsx` - Multiplayer gameplay with role-specific UIs and HUD
  - `RoleSelection.tsx` - Solo role picker UI
  - `GameScene.tsx` - 3D Canvas with camera controls
  - `MeetingRoom.tsx` - 3D environment (podium, chairs, walls, lights)
  - `AudienceAvatars.tsx` - Animated audience members
  - `SpeakerMode.tsx` - Speaker role with countdown timer (solo)
  - `TableTopicsMode.tsx` - Impromptu speaking with random prompts (solo)
  - `EvaluatorMode.tsx` - Watch & evaluate with checklist (solo)
  - `TimerRole.tsx` - Color-coded timer management (solo)
  - `GrammarianMode.tsx` - Grammar tracking with word of the day (solo)
  - `AhCounterMode.tsx` - Filler word counter (solo)
  - `FeedbackScreen.tsx` - Post-session feedback & badges

## Multiplayer Flow
1. Main Menu → Click "Multiplayer"
2. Enter name → Create or Join room (6-letter code)
3. Lobby: Wait for 6+ players → Host starts role assignment
4. Role Assignment: Each player picks a unique role → Mark ready
5. Meeting: All roles play simultaneously in same 3D room
6. Feedback: Meeting ends → Play again or leave

## Game Phases (Solo)
1. `menu` - Main menu with stats display
2. `role_selection` - Choose from 6 roles
3. `playing` - Active role with 3D scene
4. `feedback` - Session complete screen with points/badges

## Gamification
- Points per role: Speaker(50), Evaluator(40), Table Topics(30), Grammarian(25), Timer(20), Ah Counter(20)
- Levels: Beginner(0-199) → Confident Speaker(200-499) → Master Communicator(500+)
- 9 achievement badges

## User Preferences
- Wants multiplayer with minimum 6 players where each player takes a different role
