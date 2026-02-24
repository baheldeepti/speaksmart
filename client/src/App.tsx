import { useEffect } from "react";
import { useAudio } from "./lib/stores/useAudio";
import { useToastmasters } from "./lib/stores/useToastmasters";
import "@fontsource/inter";

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

function App() {
  const phase = useToastmasters(state => state.phase);
  const { setBackgroundMusic, setHitSound, setSuccessSound } = useAudio();

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

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative", overflow: "hidden" }}>
      {phase === "menu" && <MainMenu />}
      {phase === "role_selection" && <RoleSelection />}
      {phase === "playing" && (
        <>
          <GameScene />
          <RoleUI />
        </>
      )}
      {phase === "feedback" && <FeedbackScreen />}
    </div>
  );
}

export default App;
