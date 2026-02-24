import { useToastmasters } from "@/lib/stores/useToastmasters";

export default function FeedbackScreen() {
  const {
    selectedRole, speechFeedback, points, level,
    completedRoles, badges, goToMenu, goToRoleSelection,
  } = useToastmasters();

  const latestCompletion = completedRoles[completedRoles.length - 1];
  const newlyEarned = badges.filter(b => b.earned && b.earnedDate === latestCompletion?.completedAt);

  const roleNames: Record<string, string> = {
    speaker: "Speaker",
    table_topics: "Table Topics Speaker",
    timer: "Timer",
    evaluator: "Evaluator",
    grammarian: "Grammarian",
    ah_counter: "Ah Counter",
  };

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
      padding: "20px",
    }}>
      <div style={{
        maxWidth: 480,
        width: "100%",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>
          Session Complete!
        </h2>
        <div style={{ fontSize: 16, color: "#a0aec0", marginBottom: 24 }}>
          {selectedRole ? roleNames[selectedRole] : "Role"} completed
        </div>

        <div style={{
          background: "rgba(255,255,255,0.05)",
          borderRadius: 16,
          padding: "20px",
          marginBottom: 20,
          border: "1px solid rgba(255,255,255,0.1)",
        }}>
          <div style={{
            fontSize: 32,
            fontWeight: 800,
            color: "#f5a623",
            marginBottom: 4,
          }}>
            +{latestCompletion?.pointsEarned || 0} pts
          </div>
          <div style={{ fontSize: 14, color: "#a0aec0" }}>
            Total: {points} points
          </div>
          <div style={{
            display: "inline-block",
            background: "rgba(245, 166, 35, 0.15)",
            border: "1px solid rgba(245, 166, 35, 0.3)",
            borderRadius: 20,
            padding: "4px 16px",
            marginTop: 8,
            fontSize: 13,
            fontWeight: 600,
            color: "#f5a623",
          }}>
            {level}
          </div>
        </div>

        {speechFeedback && (
          <div style={{
            background: "rgba(255,255,255,0.05)",
            borderRadius: 16,
            padding: "20px",
            marginBottom: 20,
            border: "1px solid rgba(255,255,255,0.1)",
            textAlign: "left",
          }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, textAlign: "center" }}>
              Speech Feedback
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 12px",
                background: "rgba(255,255,255,0.05)",
                borderRadius: 8,
              }}>
                <span style={{ fontSize: 13, color: "#a0aec0" }}>Speech Length</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>
                  {Math.floor(speechFeedback.speechLength / 60)}m {speechFeedback.speechLength % 60}s
                </span>
              </div>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 12px",
                background: "rgba(255,255,255,0.05)",
                borderRadius: 8,
              }}>
                <span style={{ fontSize: 13, color: "#a0aec0" }}>Pacing</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#48bb78" }}>
                  {speechFeedback.pacing}
                </span>
              </div>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 12px",
                background: "rgba(255,255,255,0.05)",
                borderRadius: 8,
              }}>
                <span style={{ fontSize: 13, color: "#a0aec0" }}>Filler Words</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: speechFeedback.fillerWords > 3 ? "#f5a623" : "#48bb78" }}>
                  {speechFeedback.fillerWords} detected
                </span>
              </div>
            </div>
          </div>
        )}

        {newlyEarned.length > 0 && (
          <div style={{
            background: "rgba(245, 166, 35, 0.1)",
            borderRadius: 16,
            padding: "16px",
            marginBottom: 20,
            border: "1px solid rgba(245, 166, 35, 0.3)",
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: "#f5a623" }}>
              New Badges Earned!
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
              {newlyEarned.map(badge => (
                <div key={badge.id} style={{
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: 10,
                  padding: "8px 14px",
                  fontSize: 13,
                }}>
                  {badge.icon} {badge.name}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={goToRoleSelection}
            style={{
              background: "linear-gradient(135deg, #e94560, #c62a71)",
              color: "white",
              border: "none",
              padding: "14px 28px",
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(233, 69, 96, 0.4)",
            }}
          >
            Practice Another Role
          </button>
          <button
            onClick={goToMenu}
            style={{
              background: "rgba(255,255,255,0.1)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.2)",
              padding: "14px 28px",
              borderRadius: 12,
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}
