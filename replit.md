# Toastmasters XR Practice Room

## Overview
A browser-based 3D game simulating a Toastmasters meeting where users can practice different meeting roles interactively in a virtual environment. Built with React Three Fiber for 3D rendering.

## Recent Changes
- 2026-02-24: Initial build of the complete game with all 6 roles, 3D meeting room, gamification system

## Project Architecture
- **Frontend**: React + React Three Fiber + Zustand for state management
- **Backend**: Express server (serves static files, minimal API)
- **Styling**: Inline styles for game UI, Tailwind CSS available for additional components
- **State**: Zustand store (`useToastmasters`) manages all game state including roles, timers, gamification
- **Persistence**: LocalStorage for points, badges, and completed roles

## Key Files
- `client/src/App.tsx` - Main app component with phase routing
- `client/src/lib/stores/useToastmasters.tsx` - Central game state store
- `client/src/components/game/` - All game components:
  - `MainMenu.tsx` - Landing screen with stats
  - `RoleSelection.tsx` - Role picker UI
  - `GameScene.tsx` - 3D Canvas with camera controls
  - `MeetingRoom.tsx` - 3D environment (podium, chairs, walls, lights)
  - `AudienceAvatars.tsx` - Animated audience members
  - `SpeakerMode.tsx` - Speaker role with countdown timer
  - `TableTopicsMode.tsx` - Impromptu speaking with random prompts
  - `EvaluatorMode.tsx` - Watch & evaluate with checklist
  - `TimerRole.tsx` - Color-coded timer management
  - `GrammarianMode.tsx` - Grammar tracking with word of the day
  - `AhCounterMode.tsx` - Filler word counter
  - `FeedbackScreen.tsx` - Post-session feedback & badges

## Game Phases
1. `menu` - Main menu with stats display
2. `role_selection` - Choose from 6 roles
3. `playing` - Active role with 3D scene
4. `feedback` - Session complete screen with points/badges

## Gamification
- Points per role: Speaker(50), Evaluator(40), Table Topics(30), Grammarian(25), Timer(20), Ah Counter(20)
- Levels: Beginner(0-199) → Confident Speaker(200-499) → Master Communicator(500+)
- 9 achievement badges

## User Preferences
- None specified yet
