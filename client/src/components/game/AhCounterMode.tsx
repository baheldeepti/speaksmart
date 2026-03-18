import { useState, useRef } from "react";
import { useToastmasters } from "@/lib/stores/useToastmasters";
import { useAudio } from "@/lib/stores/useAudio";

const FILLER_WORDS = ["Um", "Uh", "Ah", "Like", "You know", "So", "Actually", "Basically", "Right", "Well"];

interface SpeakerTally {
  name: string;
  counts: Record<string, number>;
}

export default function AhCounterMode() {
  const { ahCounterCount, incrementAhCounter, resetAhCounter, completeRole, goToMenu } = useToastmasters();
  const { playHit, playSuccess } = useAudio();
  const [fillerCounts, setFillerCounts] = useState<Record<string, number>>({});
  const sessionStartRef = useRef<number>(Date.now());
  const trackingTimestampsRef = useRef<number[]>([]);
  const [customFiller, setCustomFiller] = useState("");
  const [customFillers, setCustomFillers] = useState<string[]>([]);

  const [speakerTallies, setSpeakerTallies] = useState<SpeakerTally[]>([]);
  const [currentSpeaker, setCurrentSpeaker] = useState("");
  const [activeSpeakerIdx, setActiveSpeakerIdx] = useState<number | null>(null);
  const [notes, setNotes] = useState("");

  const allFillers = [...FILLER_WORDS, ...customFillers];

  const handleAddSpeaker = () => {
    const name = currentSpeaker.trim() || `Speaker ${speakerTallies.length + 1}`;
    setSpeakerTallies(prev => [...prev, { name, counts: {} }]);
    setActiveSpeakerIdx(speakerTallies.length);
    setCurrentSpeaker("");
  };

  const handleSelectSpeaker = (idx: number) => {
    setActiveSpeakerIdx(activeSpeakerIdx === idx ? null : idx);
  };

  const handleCount = (word: string) => {
    incrementAhCounter();
    setFillerCounts(prev => ({
      ...prev,
      [word]: (prev[word] || 0) + 1,
    }));
    playHit();
    trackingTimestampsRef.current.push(Date.now() - sessionStartRef.current);

    if (activeSpeakerIdx !== null) {
      setSpeakerTallies(prev => prev.map((s, i) => {
        if (i !== activeSpeakerIdx) return s;
        return { ...s, counts: { ...s.counts, [word]: (s.counts[word] || 0) + 1 } };
      }));
    }
  };

  const handleAddCustomFiller = () => {
    const word = customFiller.trim();
    if (word && !allFillers.includes(word)) {
      setCustomFillers(prev => [...prev, word]);
      setCustomFiller("");
    }
  };

  const handleComplete = () => {
    playSuccess();
    const sessionDuration = Math.round((Date.now() - sessionStartRef.current) / 1000);
    window.__pendingRoleEvaluation = {
      role: "ah_counter",
      metrics: {
        totalCount: ahCounterCount,
        categoryCounts: fillerCounts,
        sessionDuration: sessionDuration * 1000,
        trackingTimestamps: trackingTimestampsRef.current,
      },
    };
    completeRole();
  };

  const handleReset = () => {
    resetAhCounter();
    setFillerCounts({});
    setSpeakerTallies(prev => prev.map(s => ({ ...s, counts: {} })));
  };

  const totalCount = ahCounterCount;

  const getSpeakerTotal = (s: SpeakerTally) => Object.values(s.counts).reduce((a, b) => a + b, 0);

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
          <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0", marginBottom: 2 }}>Ah Counter Worksheet</div>
          <div style={{ fontSize: 11, color: "#718096" }}>Track filler words for each speaker</div>
        </div>

        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{
            fontSize: 48,
            fontWeight: 800,
            color: totalCount > 10 ? "#e94560" : totalCount > 5 ? "#f5a623" : "#48bb78",
          }}>
            {totalCount}
          </div>
          <div style={{ fontSize: 12, color: "#a0aec0" }}>total filler words</div>
        </div>

        <div style={{
          background: "rgba(255,255,255,0.03)",
          borderRadius: 12,
          padding: "16px",
          marginBottom: 16,
          border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#a0aec0", marginBottom: 8 }}>
            Speakers ({speakerTallies.length})
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
                background: "rgba(237, 137, 54, 0.3)",
                border: "1px solid #ed8936",
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
          {speakerTallies.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {speakerTallies.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectSpeaker(i)}
                  style={{
                    background: activeSpeakerIdx === i ? "rgba(237, 137, 54, 0.3)" : "rgba(255,255,255,0.05)",
                    border: activeSpeakerIdx === i ? "1px solid #ed8936" : "1px solid rgba(255,255,255,0.15)",
                    color: activeSpeakerIdx === i ? "#fbd38d" : "#a0aec0",
                    padding: "6px 12px",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {s.name} ({getSpeakerTotal(s)})
                </button>
              ))}
            </div>
          )}
          {activeSpeakerIdx !== null && (
            <div style={{
              marginTop: 8,
              fontSize: 11,
              color: "#63b3ed",
              textAlign: "center",
            }}>
              Tallying for: <strong>{speakerTallies[activeSpeakerIdx]?.name}</strong>
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
          <div style={{ fontSize: 12, fontWeight: 600, color: "#a0aec0", marginBottom: 10 }}>
            Tap to Count Filler Words
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 8,
            marginBottom: 12,
          }}>
            {allFillers.map(word => (
              <button
                key={word}
                onClick={() => handleCount(word)}
                style={{
                  background: fillerCounts[word]
                    ? "rgba(237, 137, 54, 0.2)"
                    : "rgba(255,255,255,0.05)",
                  border: fillerCounts[word]
                    ? "1px solid rgba(237, 137, 54, 0.4)"
                    : "1px solid rgba(255,255,255,0.15)",
                  color: "white",
                  padding: "12px 8px",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                  textAlign: "center",
                  transition: "all 0.15s",
                  position: "relative",
                }}
              >
                {word}
                {fillerCounts[word] && (
                  <span style={{
                    position: "absolute",
                    top: 4,
                    right: 6,
                    background: "#ed8936",
                    color: "white",
                    borderRadius: "50%",
                    width: 20,
                    height: 20,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                  }}>
                    {fillerCounts[word]}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              value={customFiller}
              onChange={e => setCustomFiller(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAddCustomFiller()}
              placeholder="Add custom filler word..."
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "white",
                padding: "8px 12px",
                borderRadius: 8,
                fontSize: 12,
                outline: "none",
              }}
            />
            <button
              onClick={handleAddCustomFiller}
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "white",
                padding: "8px 14px",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              +
            </button>
          </div>
        </div>

        {speakerTallies.length > 0 && (
          <div style={{
            background: "rgba(255,255,255,0.03)",
            borderRadius: 12,
            padding: "16px",
            marginBottom: 16,
            border: "1px solid rgba(255,255,255,0.06)",
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#a0aec0", marginBottom: 10 }}>
              Speaker Breakdown
            </div>
            {speakerTallies.map((speaker, i) => {
              const total = getSpeakerTotal(speaker);
              const topFillers = Object.entries(speaker.counts).sort((a, b) => b[1] - a[1]);
              return (
                <div key={i} style={{
                  padding: "10px 0",
                  borderTop: i > 0 ? "1px solid rgba(255,255,255,0.06)" : "none",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{speaker.name}</span>
                    <span style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: total > 10 ? "#e94560" : total > 5 ? "#f5a623" : "#48bb78",
                    }}>
                      {total} filler{total !== 1 ? "s" : ""}
                    </span>
                  </div>
                  {topFillers.length > 0 && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {topFillers.map(([word, count]) => (
                        <span key={word} style={{
                          fontSize: 11,
                          color: "#fbd38d",
                          background: "rgba(237, 137, 54, 0.15)",
                          padding: "2px 8px",
                          borderRadius: 4,
                        }}>
                          {word}: {count}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {Object.keys(fillerCounts).length > 0 && (
          <div style={{
            background: "rgba(255,255,255,0.03)",
            borderRadius: 12,
            padding: "16px",
            marginBottom: 16,
            border: "1px solid rgba(255,255,255,0.06)",
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#a0aec0", marginBottom: 8 }}>Overall Totals</div>
            {Object.entries(fillerCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([word, count]) => (
                <div key={word} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  padding: "4px 0",
                  color: "#e2e8f0",
                }}>
                  <span>"{word}"</span>
                  <span style={{ fontWeight: 700, color: "#ed8936" }}>{count}x</span>
                </div>
              ))}
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
            Notes & Observations
          </div>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Patterns you noticed, suggestions for speakers, habits to address..."
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

        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button
            onClick={handleReset}
            style={{
              background: "rgba(255,255,255,0.1)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.2)",
              padding: "10px 20px",
              borderRadius: 10,
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            Reset
          </button>
          <button
            onClick={handleComplete}
            style={{
              background: "linear-gradient(135deg, #ed8936, #dd6b20)",
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
