import { useState } from "react";
import { useAuth } from "@/lib/stores/useAuth";

export default function AuthScreen() {
  const { login, register, error, clearError } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    if (mode === "login") {
      await login(email, password);
    } else {
      await register(username, email, password);
    }
    setSubmitting(false);
  };

  const switchMode = () => {
    clearError();
    setMode(mode === "login" ? "register" : "login");
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
      padding: 20,
    }}>
      <div style={{
        fontSize: 28,
        fontWeight: 800,
        marginBottom: 8,
        background: "linear-gradient(135deg, #4299e1, #48bb78)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}>
        Toastmasters XR
      </div>
      <div style={{ fontSize: 14, color: "#a0aec0", marginBottom: 32 }}>
        Practice Room
      </div>

      <form onSubmit={handleSubmit} style={{
        background: "rgba(255,255,255,0.05)",
        borderRadius: 16,
        padding: "28px 24px",
        width: "100%",
        maxWidth: 360,
        border: "1px solid rgba(255,255,255,0.1)",
      }}>
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, textAlign: "center" }}>
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </div>

        {mode === "register" && (
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: "#a0aec0", display: "block", marginBottom: 4 }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={2}
              maxLength={30}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.08)",
                color: "white",
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
                minHeight: 44,
              }}
              placeholder="Your display name"
            />
          </div>
        )}

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, color: "#a0aec0", display: "block", marginBottom: 4 }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.08)",
              color: "white",
              fontSize: 14,
              outline: "none",
              boxSizing: "border-box",
              minHeight: 44,
            }}
            placeholder="you@example.com"
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, color: "#a0aec0", display: "block", marginBottom: 4 }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.08)",
              color: "white",
              fontSize: 14,
              outline: "none",
              boxSizing: "border-box",
              minHeight: 44,
            }}
            placeholder="Min 6 characters"
          />
        </div>

        {error && (
          <div style={{
            background: "rgba(233, 69, 96, 0.15)",
            border: "1px solid rgba(233, 69, 96, 0.3)",
            borderRadius: 8,
            padding: "8px 12px",
            marginBottom: 14,
            fontSize: 13,
            color: "#e94560",
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: 10,
            border: "none",
            background: submitting
              ? "rgba(255,255,255,0.1)"
              : "linear-gradient(135deg, #4299e1, #3182ce)",
            color: "white",
            fontSize: 15,
            fontWeight: 700,
            cursor: submitting ? "not-allowed" : "pointer",
            minHeight: 48,
          }}
        >
          {submitting ? "..." : mode === "login" ? "Sign In" : "Create Account"}
        </button>

        <div style={{
          textAlign: "center",
          marginTop: 16,
          fontSize: 13,
          color: "#a0aec0",
        }}>
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={switchMode}
            style={{
              background: "none",
              border: "none",
              color: "#4299e1",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              padding: 0,
            }}
          >
            {mode === "login" ? "Sign Up" : "Sign In"}
          </button>
        </div>
      </form>
    </div>
  );
}
