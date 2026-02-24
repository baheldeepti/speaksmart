import { useToastmasters, type Role } from "@/lib/stores/useToastmasters";

const ROLES: { role: Role; name: string; icon: string; description: string; color: string }[] = [
  {
    role: "speaker",
    name: "Speaker",
    icon: "🎤",
    description: "Deliver a prepared speech at the podium with a live countdown timer and audience reactions.",
    color: "#e94560",
  },
  {
    role: "table_topics",
    name: "Table Topics",
    icon: "💡",
    description: "Think on your feet! Respond to a random prompt with a 1-2 minute impromptu speech.",
    color: "#f5a623",
  },
  {
    role: "timer",
    name: "Timer",
    icon: "⏱️",
    description: "Manage the meeting timer with color-coded lights (green, yellow, red) and audio cues.",
    color: "#48bb78",
  },
  {
    role: "evaluator",
    name: "Evaluator",
    icon: "📝",
    description: "Watch a virtual speaker and provide structured evaluation feedback using a checklist.",
    color: "#4299e1",
  },
  {
    role: "grammarian",
    name: "Grammarian",
    icon: "📖",
    description: "Track grammar usage and note interesting word choices during the meeting.",
    color: "#9f7aea",
  },
  {
    role: "ah_counter",
    name: "Ah Counter",
    icon: "🔍",
    description: "Count filler words like 'um', 'ah', and 'you know' during speeches.",
    color: "#ed8936",
  },
];

export default function RoleSelection() {
  const { selectRole, startRole, selectedRole, goToMenu } = useToastmasters();

  const handleSelect = (role: Role) => {
    selectRole(role);
  };

  const handleStart = () => {
    if (selectedRole) {
      startRole();
    }
  };

  return (
    <div style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      color: "white",
      fontFamily: "'Inter', sans-serif",
      zIndex: 100,
      overflow: "auto",
      padding: "20px",
    }}>
      <button
        onClick={goToMenu}
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          background: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.2)",
          color: "white",
          padding: "8px 16px",
          borderRadius: 8,
          cursor: "pointer",
          fontSize: 14,
        }}
      >
        ← Back
      </button>

      <h2 style={{
        fontSize: "clamp(20px, 4vw, 32px)",
        fontWeight: 700,
        marginTop: 48,
        marginBottom: 8,
      }}>
        Choose Your Role
      </h2>
      <p style={{ color: "#a0aec0", fontSize: 14, marginBottom: 24 }}>
        Select a meeting role to practice
      </p>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: 16,
        maxWidth: 900,
        width: "100%",
        marginBottom: 24,
      }}>
        {ROLES.map(({ role, name, icon, description, color }) => (
          <button
            key={role}
            onClick={() => handleSelect(role)}
            style={{
              background: selectedRole === role
                ? `linear-gradient(135deg, ${color}33, ${color}22)`
                : "rgba(255,255,255,0.05)",
              border: selectedRole === role
                ? `2px solid ${color}`
                : "2px solid rgba(255,255,255,0.1)",
              borderRadius: 16,
              padding: "20px",
              cursor: "pointer",
              textAlign: "left",
              color: "white",
              transition: "all 0.2s",
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6, color }}>{name}</div>
            <div style={{ fontSize: 13, color: "#a0aec0", lineHeight: 1.5 }}>{description}</div>
          </button>
        ))}
      </div>

      <button
        onClick={handleStart}
        disabled={!selectedRole}
        style={{
          background: selectedRole
            ? "linear-gradient(135deg, #e94560, #c62a71)"
            : "rgba(255,255,255,0.1)",
          color: selectedRole ? "white" : "#718096",
          border: "none",
          padding: "14px 40px",
          borderRadius: 12,
          fontSize: 16,
          fontWeight: 700,
          cursor: selectedRole ? "pointer" : "not-allowed",
          transition: "all 0.2s",
          boxShadow: selectedRole ? "0 4px 20px rgba(233, 69, 96, 0.4)" : "none",
        }}
      >
        {selectedRole ? `Start as ${ROLES.find(r => r.role === selectedRole)?.name}` : "Select a role to begin"}
      </button>
    </div>
  );
}
