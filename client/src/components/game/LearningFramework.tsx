import { useState } from "react";

const FRAMEWORK_STAGES = [
  {
    id: "foundation",
    title: "Stage 1: Foundation",
    subtitle: "Build your speaking confidence",
    color: "#48bb78",
    sessions: "1-10",
    goals: [
      "Overcome initial speaking anxiety",
      "Learn to structure a basic speech (opening, body, closing)",
      "Practice speaking within time limits",
      "Get comfortable with your voice and presence",
    ],
    roles: [
      { role: "Speaker", tip: "Start with 1-2 minute prepared speeches. Focus on simply finishing your speech, not perfection." },
      { role: "Table Topics", tip: "Practice impromptu speaking with easy prompts. Aim to speak for at least 60 seconds." },
      { role: "Timer", tip: "Learn how meeting timing works. Understand green, yellow, and red signals." },
    ],
    milestone: "You can deliver a short speech from start to finish without freezing up.",
  },
  {
    id: "awareness",
    title: "Stage 2: Awareness",
    subtitle: "Identify your habits and patterns",
    color: "#4299e1",
    sessions: "10-25",
    goals: [
      "Recognize your filler word patterns (um, uh, like)",
      "Understand your natural speaking pace",
      "Learn to listen critically as an evaluator",
      "Track grammar and vocabulary usage",
    ],
    roles: [
      { role: "Ah Counter", tip: "Track your own fillers first, then practice tracking others. Notice which fillers you default to." },
      { role: "Grammarian", tip: "Pay attention to word choice, transitions, and sentence structure. Note both strengths and areas to improve." },
      { role: "Evaluator", tip: "Practice the 'sandwich' method: praise, suggestion, praise. Be specific in your feedback." },
    ],
    milestone: "You can identify 3 specific habits you want to change in your speaking.",
  },
  {
    id: "structure",
    title: "Stage 3: Structure",
    subtitle: "Master speech organization",
    color: "#9f7aea",
    sessions: "25-50",
    goals: [
      "Use the Toastmasters speech framework effectively",
      "Deliver speeches with clear openings that hook the audience",
      "Develop 2-3 supporting points with evidence or stories",
      "Create memorable conclusions with a call to action",
    ],
    roles: [
      { role: "Speaker", tip: "Try 5-7 minute speeches. Use the Pathways projects for structured guidance on different speech types." },
      { role: "Table Topics", tip: "Move to medium and hard prompts. Practice the PREP method: Point, Reason, Example, Point." },
      { role: "Evaluator", tip: "Focus your evaluations on speech structure. Can you identify the speaker's main points?" },
    ],
    milestone: "Your speeches have a clear beginning, middle, and end that the audience can follow.",
  },
  {
    id: "delivery",
    title: "Stage 4: Delivery",
    subtitle: "Polish your presentation skills",
    color: "#ed8936",
    sessions: "50-100",
    goals: [
      "Use vocal variety (pace, pitch, volume, pauses)",
      "Incorporate purposeful gestures and body language",
      "Make eye contact and connect with the audience",
      "Eliminate most filler words",
    ],
    roles: [
      { role: "Speaker", tip: "Record yourself and listen back. Focus on one delivery skill per session (e.g., pauses, or volume changes)." },
      { role: "Table Topics", tip: "Challenge yourself with hard prompts. Practice using dramatic pauses and vocal variety even in impromptu responses." },
      { role: "Ah Counter", tip: "Your filler count should be dropping. Aim for fewer than 3 fillers per minute of speaking." },
    ],
    milestone: "Others describe your speaking as engaging and natural.",
  },
  {
    id: "mastery",
    title: "Stage 5: Mastery",
    subtitle: "Inspire and lead through speaking",
    color: "#e94560",
    sessions: "100+",
    goals: [
      "Adapt your message to different audiences",
      "Use storytelling to create emotional connection",
      "Handle Q&A and unexpected situations with ease",
      "Mentor others in their speaking journey",
    ],
    roles: [
      { role: "Speaker", tip: "Tackle advanced Pathways projects. Experiment with humor, persuasion, and storytelling techniques." },
      { role: "Evaluator", tip: "Give evaluations that truly help speakers grow. Your feedback should be specific, actionable, and encouraging." },
      { role: "All Roles", tip: "Rotate through every role regularly to maintain a well-rounded skill set. Lead meetings and mentor newer members." },
    ],
    milestone: "You can speak confidently in any setting and help others improve.",
  },
];

const PRACTICE_TIPS = [
  { icon: "1", title: "Consistency Over Intensity", text: "3 short sessions per week beats 1 long session. Regular practice builds lasting habits." },
  { icon: "2", title: "Record and Review", text: "Use the recording feature every time you speak. Listening to yourself is the fastest way to improve." },
  { icon: "3", title: "Rotate All Roles", text: "Don't just practice speaking. Timer, Grammarian, Ah Counter, and Evaluator roles sharpen your listening and analysis skills." },
  { icon: "4", title: "Set Specific Goals", text: "Each session, pick ONE thing to focus on: fewer fillers, better pauses, stronger opening, etc." },
  { icon: "5", title: "Review Your AI Feedback", text: "After each session, read the detailed rubric evaluation. Focus on the 'Areas for Improvement' section." },
  { icon: "6", title: "Use the Pathways", text: "Toastmasters Pathways projects give you structured goals and speech types to practice progressively." },
];

export default function LearningFramework({ onBack }: { onBack: () => void }) {
  const [expandedStage, setExpandedStage] = useState<string | null>("foundation");
  const [showTips, setShowTips] = useState(false);

  return (
    <div style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      color: "white",
      fontFamily: "'Inter', sans-serif",
      zIndex: 100,
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        padding: "16px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        flexShrink: 0,
      }}>
        <button onClick={onBack} style={{
          background: "none", border: "none", color: "#4299e1",
          fontSize: 14, cursor: "pointer", padding: "8px 0", minHeight: 44,
        }}>
          Back
        </button>
        <div style={{ flex: 1, textAlign: "center", fontSize: 18, fontWeight: 700 }}>
          Learning Framework
        </div>
        <div style={{ width: 40 }} />
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
        <div style={{
          textAlign: "center",
          marginBottom: 24,
          padding: "20px",
          background: "rgba(255,255,255,0.04)",
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.08)",
        }}>
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
            Your Path to Confident Speaking
          </div>
          <div style={{ fontSize: 14, color: "#a0aec0", lineHeight: 1.7, maxWidth: 500, margin: "0 auto" }}>
            Public speaking is a skill anyone can learn. This framework breaks it down into 5 stages, 
            each building on the last. Go at your own pace — the key is consistent practice.
          </div>
        </div>

        <div style={{
          position: "relative",
          marginBottom: 24,
        }}>
          <div style={{
            position: "absolute",
            left: 20,
            top: 0,
            bottom: 0,
            width: 3,
            background: "rgba(255,255,255,0.08)",
            borderRadius: 2,
          }} />

          {FRAMEWORK_STAGES.map((stage, idx) => {
            const isExpanded = expandedStage === stage.id;
            return (
              <div key={stage.id} style={{ position: "relative", marginBottom: 12 }}>
                <div style={{
                  position: "absolute",
                  left: 12,
                  top: 18,
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: stage.color,
                  border: "3px solid #1a1a2e",
                  zIndex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 800,
                  color: "#1a1a2e",
                }}>
                  {idx + 1}
                </div>

                <button
                  onClick={() => setExpandedStage(isExpanded ? null : stage.id)}
                  style={{
                    width: "100%",
                    marginLeft: 44,
                    background: isExpanded
                      ? `rgba(${stage.color === "#48bb78" ? "72,187,120" : stage.color === "#4299e1" ? "66,153,225" : stage.color === "#9f7aea" ? "159,122,234" : stage.color === "#ed8936" ? "237,137,54" : "233,69,96"},0.1)`
                      : "rgba(255,255,255,0.03)",
                    border: isExpanded ? `1px solid ${stage.color}40` : "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 14,
                    padding: "16px 18px",
                    textAlign: "left",
                    cursor: "pointer",
                    color: "white",
                    transition: "all 0.2s",
                    maxWidth: "calc(100% - 44px)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: stage.color, marginBottom: 2 }}>
                        {stage.title}
                      </div>
                      <div style={{ fontSize: 12, color: "#a0aec0" }}>
                        {stage.subtitle}
                      </div>
                    </div>
                    <div style={{
                      fontSize: 11,
                      color: "#718096",
                      background: "rgba(255,255,255,0.06)",
                      padding: "3px 8px",
                      borderRadius: 4,
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                      marginLeft: 8,
                    }}>
                      Sessions {stage.sessions}
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{ marginTop: 16 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#a0aec0", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                        Goals
                      </div>
                      {stage.goals.map((goal, i) => (
                        <div key={i} style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 8,
                          marginBottom: 6,
                          fontSize: 13,
                          color: "#cbd5e0",
                          lineHeight: 1.5,
                        }}>
                          <span style={{ color: stage.color, flexShrink: 0, marginTop: 2, fontSize: 10 }}>●</span>
                          {goal}
                        </div>
                      ))}

                      <div style={{
                        fontSize: 12, fontWeight: 700, color: "#a0aec0", marginBottom: 8, marginTop: 16,
                        textTransform: "uppercase", letterSpacing: 0.5,
                      }}>
                        Recommended Roles & Tips
                      </div>
                      {stage.roles.map((r, i) => (
                        <div key={i} style={{
                          background: "rgba(255,255,255,0.04)",
                          borderRadius: 10,
                          padding: "10px 12px",
                          marginBottom: 6,
                          border: "1px solid rgba(255,255,255,0.06)",
                        }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: stage.color, marginBottom: 4 }}>
                            {r.role}
                          </div>
                          <div style={{ fontSize: 12, color: "#a0aec0", lineHeight: 1.5 }}>
                            {r.tip}
                          </div>
                        </div>
                      ))}

                      <div style={{
                        marginTop: 14,
                        background: `${stage.color}15`,
                        border: `1px solid ${stage.color}30`,
                        borderRadius: 10,
                        padding: "12px 14px",
                      }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: stage.color, marginBottom: 4, textTransform: "uppercase" }}>
                          Milestone
                        </div>
                        <div style={{ fontSize: 13, color: "#e2e8f0", lineHeight: 1.5 }}>
                          {stage.milestone}
                        </div>
                      </div>
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        <div style={{ marginBottom: 24 }}>
          <button
            onClick={() => setShowTips(!showTips)}
            style={{
              width: "100%",
              background: showTips ? "rgba(245, 166, 35, 0.1)" : "rgba(255,255,255,0.04)",
              border: showTips ? "1px solid rgba(245, 166, 35, 0.3)" : "1px solid rgba(255,255,255,0.08)",
              borderRadius: 14,
              padding: "16px 18px",
              textAlign: "left",
              cursor: "pointer",
              color: "white",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#f5a623" }}>
                  Practice Tips
                </div>
                <div style={{ fontSize: 12, color: "#a0aec0" }}>
                  6 strategies to accelerate your improvement
                </div>
              </div>
              <div style={{ fontSize: 18, color: "#718096" }}>{showTips ? "−" : "+"}</div>
            </div>

            {showTips && (
              <div style={{ marginTop: 16 }}>
                {PRACTICE_TIPS.map((tip, i) => (
                  <div key={i} style={{
                    display: "flex",
                    gap: 12,
                    marginBottom: 14,
                    alignItems: "flex-start",
                  }}>
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "rgba(245, 166, 35, 0.2)",
                      border: "1px solid rgba(245, 166, 35, 0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      fontWeight: 800,
                      color: "#f5a623",
                      flexShrink: 0,
                    }}>
                      {tip.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", marginBottom: 2 }}>
                        {tip.title}
                      </div>
                      <div style={{ fontSize: 12, color: "#a0aec0", lineHeight: 1.5 }}>
                        {tip.text}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </button>
        </div>

        <div style={{
          background: "rgba(255,255,255,0.04)",
          borderRadius: 14,
          padding: "20px",
          marginBottom: 20,
          border: "1px solid rgba(255,255,255,0.08)",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
            How This App Helps You
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginTop: 14,
          }}>
            {[
              { title: "AI Evaluation", desc: "Get detailed rubric-based feedback after every session" },
              { title: "Progress Tracking", desc: "See your scores improve over time across all roles" },
              { title: "6 Toastmasters Roles", desc: "Practice Speaker, Table Topics, Timer, Evaluator, Grammarian, and Ah Counter" },
              { title: "Pathways Projects", desc: "Follow the Toastmasters Pathways curriculum for structured growth" },
              { title: "Multiplayer Mode", desc: "Practice with others in a live meeting simulation" },
              { title: "Worksheets", desc: "Structured tracking forms for Timer, Ah Counter, and Grammarian roles" },
            ].map((item, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.04)",
                borderRadius: 10,
                padding: "12px",
                border: "1px solid rgba(255,255,255,0.06)",
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#4299e1", marginBottom: 4 }}>
                  {item.title}
                </div>
                <div style={{ fontSize: 11, color: "#a0aec0", lineHeight: 1.5 }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
