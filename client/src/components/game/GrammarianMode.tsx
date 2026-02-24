import { useState, useMemo } from "react";
import { useToastmasters } from "@/lib/stores/useToastmasters";
import { useAudio } from "@/lib/stores/useAudio";

const WORD_OF_DAY_OPTIONS = [
  { word: "Eloquent", definition: "Fluent or persuasive in speaking" },
  { word: "Articulate", definition: "Having the ability to speak clearly" },
  { word: "Compelling", definition: "Evoking interest or attention" },
  { word: "Insightful", definition: "Having a deep understanding" },
  { word: "Captivating", definition: "Attracting and holding attention" },
  { word: "Persuasive", definition: "Good at convincing someone to do or believe something" },
];

function getWordOfDay() {
  const dayIndex = Math.floor(Date.now() / 86400000) % WORD_OF_DAY_OPTIONS.length;
  return WORD_OF_DAY_OPTIONS[dayIndex];
}

export default function GrammarianMode() {
  const { grammarianNotes, addGrammarianNote, completeRole, goToMenu } = useToastmasters();
  const { playSuccess, playHit } = useAudio();
  const [noteInput, setNoteInput] = useState("");
  const [noteType, setNoteType] = useState<"good" | "improve">("good");
  const wordOfDay = useMemo(() => getWordOfDay(), []);

  const handleAddNote = () => {
    if (noteInput.trim()) {
      addGrammarianNote(`[${noteType === "good" ? "+" : "-"}] ${noteInput.trim()}`);
      setNoteInput("");
      playHit();
    }
  };

  const handleComplete = () => {
    playSuccess();
    completeRole();
  };

  return (
    <div style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 50,
      pointerEvents: "none",
    }}>
      <div style={{
        position: "absolute",
        top: 20,
        left: 20,
        pointerEvents: "auto",
      }}>
        <button
          onClick={goToMenu}
          style={{
            background: "rgba(0,0,0,0.7)",
            color: "white",
            border: "1px solid rgba(255,255,255,0.2)",
            padding: "8px 16px",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          ← Exit
        </button>
      </div>

      <div style={{
        background: "rgba(0,0,0,0.9)",
        borderRadius: 20,
        padding: "28px",
        maxWidth: 480,
        width: "90%",
        color: "white",
        pointerEvents: "auto",
        border: "1px solid rgba(255,255,255,0.1)",
        maxHeight: "85vh",
        overflowY: "auto",
      }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: "#a0aec0", marginBottom: 4, fontWeight: 600 }}>GRAMMARIAN</div>
          <div style={{ fontSize: 11, color: "#718096", marginBottom: 16 }}>Track grammar and word usage</div>

          <div style={{
            background: "rgba(159, 122, 234, 0.15)",
            border: "1px solid rgba(159, 122, 234, 0.3)",
            borderRadius: 12,
            padding: "16px",
            marginBottom: 4,
          }}>
            <div style={{ fontSize: 11, color: "#9f7aea", fontWeight: 600, marginBottom: 4 }}>WORD OF THE DAY</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#9f7aea" }}>{wordOfDay.word}</div>
            <div style={{ fontSize: 13, color: "#a0aec0", fontStyle: "italic" }}>{wordOfDay.definition}</div>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <button
              onClick={() => setNoteType("good")}
              style={{
                flex: 1,
                background: noteType === "good" ? "rgba(72, 187, 120, 0.2)" : "rgba(255,255,255,0.05)",
                border: noteType === "good" ? "1px solid #48bb78" : "1px solid rgba(255,255,255,0.1)",
                color: noteType === "good" ? "#48bb78" : "#a0aec0",
                padding: "8px",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              + Good Usage
            </button>
            <button
              onClick={() => setNoteType("improve")}
              style={{
                flex: 1,
                background: noteType === "improve" ? "rgba(245, 166, 35, 0.2)" : "rgba(255,255,255,0.05)",
                border: noteType === "improve" ? "1px solid #f5a623" : "1px solid rgba(255,255,255,0.1)",
                color: noteType === "improve" ? "#f5a623" : "#a0aec0",
                padding: "8px",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              - Needs Improvement
            </button>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              value={noteInput}
              onChange={e => setNoteInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAddNote()}
              placeholder={noteType === "good" ? "e.g., Great use of metaphor..." : "e.g., Subject-verb disagreement..."}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "white",
                padding: "10px 14px",
                borderRadius: 8,
                fontSize: 13,
                outline: "none",
              }}
            />
            <button
              onClick={handleAddNote}
              style={{
                background: "rgba(159, 122, 234, 0.3)",
                border: "1px solid #9f7aea",
                color: "white",
                padding: "10px 16px",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Add
            </button>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#a0aec0", marginBottom: 8 }}>
            Notes ({grammarianNotes.length})
          </div>
          {grammarianNotes.length === 0 ? (
            <div style={{ fontSize: 13, color: "#718096", textAlign: "center", padding: "16px" }}>
              No notes yet. Add observations as you listen to the speaker.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {grammarianNotes.map((note, i) => (
                <div key={i} style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  fontSize: 13,
                  background: note.startsWith("[+]")
                    ? "rgba(72, 187, 120, 0.1)"
                    : "rgba(245, 166, 35, 0.1)",
                  border: note.startsWith("[+]")
                    ? "1px solid rgba(72, 187, 120, 0.2)"
                    : "1px solid rgba(245, 166, 35, 0.2)",
                  color: note.startsWith("[+]") ? "#68d391" : "#fbd38d",
                }}>
                  {note}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ textAlign: "center" }}>
          <button
            onClick={handleComplete}
            style={{
              background: "linear-gradient(135deg, #9f7aea, #805ad5)",
              color: "white",
              border: "none",
              padding: "12px 32px",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Submit Report
          </button>
        </div>
      </div>
    </div>
  );
}
