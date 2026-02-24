import { useToastmasters } from "@/lib/stores/useToastmasters";
import { useAudio } from "@/lib/stores/useAudio";
import { useMultiplayer } from "@/lib/stores/useMultiplayer";

export default function MainMenu() {
  const { goToRoleSelection, points, level, completedRoles, badges } = useToastmasters();
  const { toggleMute, isMuted } = useAudio();
  const { setMultiplayerMode } = useMultiplayer();
  
  const earnedBadges = badges.filter(b => b.earned);
  
  return (
    <div style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      color: "white",
      fontFamily: "'Inter', sans-serif",
      zIndex: 100,
      overflow: "auto",
    }}>
      <div style={{
        position: "absolute",
        top: 16,
        right: 16,
      }}>
        <button
          onClick={toggleMute}
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "white",
            padding: "8px 16px",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          {isMuted ? "🔇 Unmute" : "🔊 Mute"}
        </button>
      </div>

      <div style={{ textAlign: "center", maxWidth: 600, padding: "20px" }}>
        <h1 style={{
          fontSize: "clamp(28px, 5vw, 48px)",
          fontWeight: 800,
          marginBottom: 8,
          background: "linear-gradient(90deg, #e94560, #f5a623, #e94560)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundSize: "200% 100%",
        }}>
          Toastmasters XR
        </h1>
        <h2 style={{
          fontSize: "clamp(16px, 3vw, 24px)",
          fontWeight: 400,
          color: "#a0aec0",
          marginBottom: 32,
        }}>
          Practice Room
        </h2>

        <div style={{
          background: "rgba(255,255,255,0.05)",
          borderRadius: 16,
          padding: "20px",
          marginBottom: 24,
          border: "1px solid rgba(255,255,255,0.1)",
        }}>
          <div style={{ fontSize: 14, color: "#a0aec0", marginBottom: 4 }}>Your Level</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#f5a623", marginBottom: 8 }}>{level}</div>
          <div style={{ fontSize: 14, color: "#a0aec0" }}>
            {points} points · {completedRoles.length} sessions completed
          </div>
          
          <div style={{
            width: "100%",
            height: 6,
            background: "rgba(255,255,255,0.1)",
            borderRadius: 3,
            marginTop: 12,
            overflow: "hidden",
          }}>
            <div style={{
              height: "100%",
              width: `${Math.min((points / 500) * 100, 100)}%`,
              background: "linear-gradient(90deg, #e94560, #f5a623)",
              borderRadius: 3,
              transition: "width 0.5s ease",
            }} />
          </div>
          <div style={{ fontSize: 11, color: "#718096", marginTop: 4 }}>
            {points < 200 ? `${200 - points} pts to Confident Speaker` :
             points < 500 ? `${500 - points} pts to Master Communicator` :
             "Max level reached!"}
          </div>
        </div>

        {earnedBadges.length > 0 && (
          <div style={{
            display: "flex",
            gap: 8,
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: 24,
          }}>
            {earnedBadges.map(badge => (
              <div key={badge.id} title={badge.description} style={{
                background: "rgba(255,255,255,0.1)",
                borderRadius: 8,
                padding: "6px 10px",
                fontSize: 12,
              }}>
                {badge.icon} {badge.name}
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <button
            onClick={goToRoleSelection}
            style={{
              background: "linear-gradient(135deg, #e94560, #c62a71)",
              color: "white",
              border: "none",
              padding: "16px 36px",
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
              boxShadow: "0 4px 20px rgba(233, 69, 96, 0.4)",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow = "0 6px 30px rgba(233, 69, 96, 0.6)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(233, 69, 96, 0.4)";
            }}
          >
            Solo Practice
          </button>

          <button
            onClick={() => setMultiplayerMode(true)}
            style={{
              background: "linear-gradient(135deg, #4299e1, #3182ce)",
              color: "white",
              border: "none",
              padding: "16px 36px",
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
              boxShadow: "0 4px 20px rgba(66, 153, 225, 0.4)",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow = "0 6px 30px rgba(66, 153, 225, 0.6)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(66, 153, 225, 0.4)";
            }}
          >
            Multiplayer (6+ Players)
          </button>
        </div>

        <p style={{
          marginTop: 24,
          fontSize: 13,
          color: "#718096",
          lineHeight: 1.6,
        }}>
          Practice solo or join a live meeting with other players.
          <br />Each player takes a different Toastmasters role.
        </p>
      </div>
    </div>
  );
}
