import { useEffect, useState } from "react";
import { useAudio } from "./lib/stores/useAudio";
import { useToastmasters } from "./lib/stores/useToastmasters";
import { useMultiplayer } from "./lib/stores/useMultiplayer";
import { useAuth } from "./lib/stores/useAuth";
import ErrorBoundary from "./components/ErrorBoundary";
import PrivacyPolicy from "./components/PrivacyPolicy";
import "@fontsource/inter";

import AuthScreen from "./components/game/AuthScreen";
import MainMenu from "./components/game/MainMenu";
import RoleSelection from "./components/game/RoleSelection";
import GameScene from "./components/game/GameScene";
import SpeakerMode from "./components/game/SpeakerMode";
import TableTopicsMode from "./components/game/TableTopicsMode";
import EvaluatorMode from "./components/game/EvaluatorMode";
import TimerRole from "./components/game/TimerRole";
import GrammarianMode from "./components/game/GrammarianMode";
import AhCounterMode from "./components/game/AhCounterMode";
import FeedbackScreen from "./components/game/FeedbackScreen";
import MultiplayerLobby from "./components/game/MultiplayerLobby";
import MultiplayerGame from "./components/game/MultiplayerGame";
import GameHistory from "./components/game/GameHistory";
import Scoreboard from "./components/game/Scoreboard";

function RoleUI() {
  const selectedRole = useToastmasters(state => state.selectedRole);

  switch (selectedRole) {
    case "speaker":
      return <SpeakerMode />;
    case "table_topics":
      return <TableTopicsMode />;
    case "evaluator":
      return <EvaluatorMode />;
    case "timer":
      return <TimerRole />;
    case "grammarian":
      return <GrammarianMode />;
    case "ah_counter":
      return <AhCounterMode />;
    default:
      return null;
  }
}

function AppContent() {
  const phase = useToastmasters(state => state.phase);
  const { setBackgroundMusic, setHitSound, setSuccessSound } = useAudio();
  const { multiplayerMode, roomState } = useMultiplayer();
  const { user, loading, checkAuth } = useAuth();
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showScoreboard, setShowScoreboard] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const bgMusic = new Audio("/sounds/background.mp3");
    bgMusic.loop = true;
    bgMusic.volume = 0.15;
    setBackgroundMusic(bgMusic);

    const hit = new Audio("/sounds/hit.mp3");
    hit.volume = 0.3;
    setHitSound(hit);

    const success = new Audio("/sounds/success.mp3");
    success.volume = 0.4;
    setSuccessSound(success);
  }, [setBackgroundMusic, setHitSound, setSuccessSound]);

  if (loading) {
    return (
      <div style={{
        width: "100vw", height: "100vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        color: "#a0aec0", fontFamily: "'Inter', sans-serif",
      }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  if (showPrivacy) {
    return <PrivacyPolicy onClose={() => setShowPrivacy(false)} />;
  }

  if (showHistory) {
    return <GameHistory onBack={() => setShowHistory(false)} />;
  }

  if (showScoreboard) {
    return <Scoreboard onBack={() => setShowScoreboard(false)} />;
  }

  if (multiplayerMode) {
    if (!roomState || roomState.phase === "lobby" || roomState.phase === "role_assignment") {
      return (
        <div style={{ width: "100vw", height: "100vh", position: "relative", overflow: "hidden" }}>
          <MultiplayerLobby />
        </div>
      );
    }

    return <MultiplayerGame />;
  }

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative", overflow: "hidden" }}>
      {phase === "menu" && (
        <MainMenu
          onShowPrivacy={() => setShowPrivacy(true)}
          onShowHistory={() => setShowHistory(true)}
          onShowScoreboard={() => setShowScoreboard(true)}
        />
      )}
      {phase === "role_selection" && <RoleSelection />}
      {phase === "playing" && (
        <>
          <ErrorBoundary>
            <GameScene />
          </ErrorBoundary>
          <RoleUI />
        </>
      )}
      {phase === "feedback" && <FeedbackScreen />}
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;
