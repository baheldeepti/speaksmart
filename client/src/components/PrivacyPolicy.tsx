export default function PrivacyPolicy({ onClose }: { onClose: () => void }) {
  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      color: "white",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      zIndex: 200,
      overflow: "auto",
      padding: "20px",
    }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <button
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "white",
            padding: "8px 16px",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 14,
            marginBottom: 20,
            WebkitTapHighlightColor: "transparent",
          }}
        >
          ← Back
        </button>

        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Privacy Policy</h1>
        <p style={{ fontSize: 13, color: "#718096", marginBottom: 24 }}>
          Last updated: February 24, 2026
        </p>

        <div style={{ fontSize: 14, lineHeight: 1.8, color: "#cbd5e0" }}>
          <Section title="1. Information We Collect">
            <p>
              <strong>Toastmasters XR Practice Room</strong> ("the App") is designed with your privacy in mind.
              We collect minimal data to provide you with the best experience:
            </p>
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              <li><strong>Game Progress:</strong> Points, badges, and completed roles are stored locally on your device using browser storage. This data never leaves your device.</li>
              <li><strong>Multiplayer Sessions:</strong> When using multiplayer mode, your chosen display name and in-game actions (role selection, chat messages, timer data) are temporarily shared with other players in your session. This data is not stored after the session ends.</li>
              <li><strong>No Personal Information:</strong> We do not collect your real name, email address, phone number, location, or any other personally identifiable information.</li>
            </ul>
          </Section>

          <Section title="2. How We Use Information">
            <ul style={{ paddingLeft: 20 }}>
              <li>To save your game progress locally on your device</li>
              <li>To enable real-time multiplayer functionality during active sessions</li>
              <li>To provide gameplay feedback and track achievements</li>
            </ul>
          </Section>

          <Section title="3. Data Storage">
            <p>
              All game progress data is stored locally on your device using browser localStorage.
              We do not use cookies for tracking purposes. Multiplayer session data exists only in
              server memory during active sessions and is automatically deleted when sessions end.
            </p>
          </Section>

          <Section title="4. Data Sharing">
            <p>
              We do not sell, trade, or transfer your information to third parties. During multiplayer
              sessions, your display name and in-game actions are visible to other players in the same
              room. No data is shared with advertising networks, analytics services, or any external parties.
            </p>
          </Section>

          <Section title="5. Children's Privacy">
            <p>
              The App is suitable for users of all ages. We do not knowingly collect personal
              information from children under 13. The App contains no age-restricted content,
              in-app purchases, or targeted advertising.
            </p>
          </Section>

          <Section title="6. Third-Party Services">
            <p>
              The App does not integrate with any third-party analytics, advertising, or tracking
              services. No data is sent to external services.
            </p>
          </Section>

          <Section title="7. Data Deletion">
            <p>
              You can delete all locally stored game data at any time by clearing your browser's
              localStorage or using your device's app data management. Multiplayer session data is
              automatically deleted when you leave a room or when a session ends.
            </p>
          </Section>

          <Section title="8. Security">
            <p>
              Multiplayer communications use WebSocket connections secured by TLS encryption.
              We implement reasonable security measures to protect data during transmission.
            </p>
          </Section>

          <Section title="9. Changes to This Policy">
            <p>
              We may update this privacy policy from time to time. Any changes will be reflected
              with an updated "Last updated" date at the top of this page.
            </p>
          </Section>

          <Section title="10. Contact Us">
            <p>
              If you have questions about this privacy policy, please contact us through the
              app's support channels.
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "white", marginBottom: 8 }}>{title}</h2>
      {children}
    </div>
  );
}
