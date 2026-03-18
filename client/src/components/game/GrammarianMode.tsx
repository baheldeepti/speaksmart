import { useState, useMemo, useRef } from "react";
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

const QUICK_TAGS = [
  { label: "Vivid Language", color: "#48bb78", type: "good" as const },
  { label: "Strong Metaphor", color: "#48bb78", type: "good" as const },
  { label: "Clear Structure", color: "#48bb78", type: "good" as const },
  { label: "Good Transition", color: "#48bb78", type: "good" as const },
  { label: "Grammar Error", color: "#e94560", type: "improve" as const },
  { label: "Repetitive", color: "#e94560", type: "improve" as const },
  { label: "Cliche", color: "#f5a623", type: "improve" as const },
  { label: "Unclear Phrasing", color: "#f5a623", type: "improve" as const },
];

interface SpeakerNotes {
  name: string;
  wordOfDayUses: number;
  notes: { text: string; type: "good" | "improve"; tag?: string }[];
}

export default function GrammarianMode() {
  const { grammarianNotes, addGrammarianNote, completeRole, goToMenu } = useToastmasters();
  const { playSuccess, playHit } = useAudio();
  const [noteInput, setNoteInput] = useState("");
  const [noteType, setNoteType] = useState<"good" | "improve">("good");
  const wordOfDay = useMemo(() => getWordOfDay(), []);
  const sessionStartRef = useRef<number>(Date.now());
  const noteTimingsRef = useRef<number[]>([]);
  const [wordOfDayCount, setWordOfDayCount] = useState(0);

  const [speakerNotes, setSpeakerNotes] = useState<SpeakerNotes[]>([]);
  const [currentSpeaker, setCurrentSpeaker] = useState("");
  const [activeSpeakerIdx, setActiveSpeakerIdx] = useState<number | null>(null);
  const [overallNotes, setOverallNotes] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const handleAddSpeaker = () => {
    const name = currentSpeaker.trim() || `Speaker ${speakerNotes.length + 1}`;
    setSpeakerNotes(prev => [...prev, { name, wordOfDayUses: 0, notes: [] }]);
    setActiveSpeakerIdx(speakerNotes.length);
    setCurrentSpeaker("");
  };

  const handleSelectSpeaker = (idx: number) => {
    setActiveSpeakerIdx(activeSpeakerIdx === idx ? null : idx);
  };

  const handleWordOfDayUsed = () => {
    setWordOfDayCount(prev => prev + 1);
    playHit();
    if (activeSpeakerIdx !== null) {
      setSpeakerNotes(prev => prev.map((s, i) =>
        i === activeSpeakerIdx ? { ...s, wordOfDayUses: s.wordOfDayUses + 1 } : s
      ));
    }
  };

  const handleQuickTag = (tag: typeof QUICK_TAGS[number]) => {
    setSelectedTag(tag.label);
    setNoteType(tag.type);
  };

  const handleAddNote = () => {
    const text = noteInput.trim();
    if (!text && !selectedTag) return;

    const noteText = selectedTag
      ? (text ? `[${selectedTag}] ${text}` : `[${selectedTag}]`)
      : text;

    const prefix = noteType === "good" ? "[+]" : "[-]";
    addGrammarianNote(`${prefix} ${noteText}`);
    noteTimingsRef.current.push(Date.now() - sessionStartRef.current);
    playHit();

    if (activeSpeakerIdx !== null) {
      setSpeakerNotes(prev => prev.map((s, i) =>
        i === activeSpeakerIdx
          ? { ...s, notes: [...s.notes, { text: noteText, type: noteType, tag: selectedTag || undefined }] }
          : s
      ));
    }

    setNoteInput("");
    setSelectedTag(null);
  };

  const handleComplete = () => {
    playSuccess();
    const sessionDuration = Math.round((Date.now() - sessionStartRef.current) / 1000);
    const goodCount = grammarianNotes.filter(n => n.startsWith("[+]")).length;
    const improveCount = grammarianNotes.filter(n => n.startsWith("[-]")).length;
    const uniqueTypes = (goodCount > 0 ? 1 : 0) + (improveCount > 0 ? 1 : 0);
    window.__pendingRoleEvaluation = {
      role: "grammarian",
      metrics: {
        noteCount: grammarianNotes.length,
        uniqueTypes: uniqueTypes + Math.min(grammarianNotes.length, 3),
        sessionDuration: sessionDuration * 1000,
        noteTiming: noteTimingsRef.current,
      },
    };
    completeRole();
  };

  return (
    <div style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      zIndex: 50,
      pointerEvents: "none",
      overflowY: "auto",
      padding: "20px 0",
    }}>
      <div style={{
        position: "fixed",
        top: 20,
        left: 20,
        pointerEvents: "auto",
        zIndex: 60,
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
        padding: "24px",
        maxWidth: 500,
        width: "90%",
        color: "white",
        pointerEvents: "auto",
        border: "1px solid rgba(255,255,255,0.1)",
        marginTop: 60,
      }}>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0", marginBottom: 2 }}>Grammarian Worksheet</div>
          <div style={{ fontSize: 11, color: "#718096" }}>Track grammar, word usage, and language quality</div>
        </div>

        <div style={{
          background: "rgba(159, 122, 234, 0.15)",
          border: "1px solid rgba(159, 122, 234, 0.3)",
          borderRadius: 12,
          padding: "16px",
          marginBottom: 16,
          textAlign: "center",
        }}>
          <div style={{ fontSize: 11, color: "#9f7aea", fontWeight: 600, marginBottom: 4 }}>WORD OF THE DAY</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#9f7aea" }}>{wordOfDay.word}</div>
          <div style={{ fontSize: 13, color: "#a0aec0", fontStyle: "italic", marginBottom: 10 }}>{wordOfDay.definition}</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
            <button
              onClick={handleWordOfDayUsed}
              style={{
                background: "rgba(159, 122, 234, 0.3)",
                border: "1px solid #9f7aea",
                color: "white",
                padding: "8px 16px",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Word Used!
            </button>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#9f7aea" }}>
              {wordOfDayCount}x
            </span>
          </div>
        </div>

        <div style={{
          background: "rgba(255,255,255,0.03)",
          borderRadius: 12,
          padding: "16px",
          marginBottom: 16,
          border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#a0aec0", marginBottom: 8 }}>
            Speakers ({speakerNotes.length})
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <input
              type="text"
              value={currentSpeaker}
              onChange={e => setCurrentSpeaker(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAddSpeaker()}
              placeholder="Speaker name"
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "white",
                padding: "8px 12px",
                borderRadius: 8,
                fontSize: 13,
                outline: "none",
              }}
            />
            <button
              onClick={handleAddSpeaker}
              style={{
                background: "rgba(159, 122, 234, 0.3)",
                border: "1px solid #9f7aea",
                color: "white",
                padding: "8px 14px",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Add
            </button>
          </div>
          {speakerNotes.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {speakerNotes.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectSpeaker(i)}
                  style={{
                    background: activeSpeakerIdx === i ? "rgba(159, 122, 234, 0.3)" : "rgba(255,255,255,0.05)",
                    border: activeSpeakerIdx === i ? "1px solid #9f7aea" : "1px solid rgba(255,255,255,0.15)",
                    color: activeSpeakerIdx === i ? "#d6bcfa" : "#a0aec0",
                    padding: "6px 12px",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {s.name} ({s.notes.length})
                </button>
              ))}
            </div>
          )}
          {activeSpeakerIdx !== null && (
            <div style={{ marginTop: 8, fontSize: 11, color: "#63b3ed", textAlign: "center" }}>
              Taking notes for: <strong>{speakerNotes[activeSpeakerIdx]?.name}</strong>
            </div>
          )}
        </div>

        <div style={{
          background: "rgba(255,255,255,0.03)",
          borderRadius: 12,
          padding: "16px",
          marginBottom: 16,
          border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#a0aec0", marginBottom: 8 }}>
            Quick Tags
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
            {QUICK_TAGS.map(tag => (
              <button
                key={tag.label}
                onClick={() => handleQuickTag(tag)}
                style={{
                  background: selectedTag === tag.label
                    ? `${tag.color}33`
                    : "rgba(255,255,255,0.05)",
                  border: selectedTag === tag.label
                    ? `1px solid ${tag.color}`
                    : "1px solid rgba(255,255,255,0.12)",
                  color: selectedTag === tag.label ? tag.color : "#a0aec0",
                  padding: "5px 10px",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 11,
                  fontWeight: 600,
                  transition: "all 0.15s",
                }}
              >
                {tag.label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <button
              onClick={() => { setNoteType("good"); setSelectedTag(null); }}
              style={{
                flex: 1,
                background: noteType === "good" ? "rgba(72, 187, 120, 0.2)" : "rgba(255,255,255,0.05)",
                border: noteType === "good" ? "1px solid #48bb78" : "1px solid rgba(255,255,255,0.1)",
                color: noteType === "good" ? "#48bb78" : "#a0aec0",
                padding: "6px",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              + Good Usage
            </button>
            <button
              onClick={() => { setNoteType("improve"); setSelectedTag(null); }}
              style={{
                flex: 1,
                background: noteType === "improve" ? "rgba(245, 166, 35, 0.2)" : "rgba(255,255,255,0.05)",
                border: noteType === "improve" ? "1px solid #f5a623" : "1px solid rgba(255,255,255,0.1)",
                color: noteType === "improve" ? "#f5a623" : "#a0aec0",
                padding: "6px",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              - Needs Work
            </button>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              value={noteInput}
              onChange={e => setNoteInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAddNote()}
              placeholder={selectedTag ? `Add detail for "${selectedTag}"...` : noteType === "good" ? "e.g., Great use of metaphor..." : "e.g., Subject-verb disagreement..."}
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

        {speakerNotes.some(s => s.notes.length > 0 || s.wordOfDayUses > 0) && (
          <div style={{
            background: "rgba(255,255,255,0.03)",
            borderRadius: 12,
            padding: "16px",
            marginBottom: 16,
            border: "1px solid rgba(255,255,255,0.06)",
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#a0aec0", marginBottom: 10 }}>
              Speaker Summary
            </div>
            {speakerNotes.filter(s => s.notes.length > 0 || s.wordOfDayUses > 0).map((speaker, i) => (
              <div key={i} style={{
                padding: "10px 0",
                borderTop: i > 0 ? "1px solid rgba(255,255,255,0.06)" : "none",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{speaker.name}</span>
                  {speaker.wordOfDayUses > 0 && (
                    <span style={{ fontSize: 11, color: "#9f7aea", background: "rgba(159,122,234,0.15)", padding: "2px 8px", borderRadius: 4 }}>
                      WOD: {speaker.wordOfDayUses}x
                    </span>
                  )}
                </div>
                {speaker.notes.map((note, j) => (
                  <div key={j} style={{
                    padding: "4px 8px",
                    marginBottom: 3,
                    borderRadius: 6,
                    fontSize: 12,
                    background: note.type === "good"
                      ? "rgba(72, 187, 120, 0.08)"
                      : "rgba(245, 166, 35, 0.08)",
                    color: note.type === "good" ? "#68d391" : "#fbd38d",
                  }}>
                    {note.type === "good" ? "+" : "-"} {note.text}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {grammarianNotes.length > 0 && (
          <div style={{
            background: "rgba(255,255,255,0.03)",
            borderRadius: 12,
            padding: "16px",
            marginBottom: 16,
            border: "1px solid rgba(255,255,255,0.06)",
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#a0aec0", marginBottom: 8 }}>
              All Notes ({grammarianNotes.length})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {grammarianNotes.map((note, i) => (
                <div key={i} style={{
                  padding: "6px 10px",
                  borderRadius: 6,
                  fontSize: 12,
                  background: note.startsWith("[+]")
                    ? "rgba(72, 187, 120, 0.1)"
                    : "rgba(245, 166, 35, 0.1)",
                  border: note.startsWith("[+]")
                    ? "1px solid rgba(72, 187, 120, 0.15)"
                    : "1px solid rgba(245, 166, 35, 0.15)",
                  color: note.startsWith("[+]") ? "#68d391" : "#fbd38d",
                }}>
                  {note}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{
          background: "rgba(255,255,255,0.03)",
          borderRadius: 12,
          padding: "16px",
          marginBottom: 16,
          border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#a0aec0", marginBottom: 8 }}>
            Overall Summary Notes
          </div>
          <textarea
            value={overallNotes}
            onChange={e => setOverallNotes(e.target.value)}
            placeholder="Overall language trends, recurring issues, recommendations for the group..."
            rows={3}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "white",
              padding: "10px 12px",
              borderRadius: 8,
              fontSize: 13,
              outline: "none",
              resize: "vertical",
              fontFamily: "inherit",
            }}
          />
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
            Submit Grammarian Report
          </button>
        </div>
      </div>
    </div>
  );
}
