import { useEffect, useRef, useState } from "react";
import { useToastmasters, TABLE_TOPIC_CATEGORIES, TABLE_TOPIC_DIFFICULTIES } from "@/lib/stores/useToastmasters";
import { useAudio } from "@/lib/stores/useAudio";
import { useRecorder } from "@/lib/useRecorder";

export default function TableTopicsMode() {
  const {
    timerSeconds, timerRunning, timerMaxSeconds,
    startTimer, tickTimer, stopTimer, completeRole,
    tableTopicPrompt, generateTableTopic, goToMenu,
    tableTopicCategory, tableTopicDifficulty, tableTopicCurrentPrompt,
    setTableTopicCategory, setTableTopicDifficulty,
  } = useToastmasters();
  const { playSuccess } = useAudio();
  const recorder = useRecorder();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [started, setStarted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(true);

  useEffect(() => {
    if (timerRunning) {
      intervalRef.current = setInterval(() => {
        tickTimer();
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerRunning, tickTimer]);

  useEffect(() => {
    if (timerSeconds >= timerMaxSeconds && timerRunning) {
      stopTimer();
      recorder.stopRecording();
      setShowFeedback(true);
    }
  }, [timerSeconds, timerMaxSeconds, timerRunning, stopTimer]);

  const handleStart = () => {
    setStarted(true);
    startTimer(120);
    recorder.startRecording();
  };

  const handleFinish = () => {
    stopTimer();
    recorder.stopRecording();
    setShowFeedback(true);
    playSuccess();
  };

  const handleComplete = async () => {
    if (recorder.audioUrl) {
      try {
        const res = await fetch(recorder.audioUrl);
        const blob = await res.blob();
        window.__pendingRecordingBlob = blob;
        window.__pendingRecordingRole = "table_topics";
        window.__pendingRecordingDuration = timerSeconds;
      } catch {}
    }
    completeRole();
  };

  const handleNewPrompt = () => {
    generateTableTopic();
  };

  const handleCategoryConfirm = () => {
    generateTableTopic();
    setShowCategoryPicker(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const getTimerColor = () => {
    if (timerSeconds < 60) return "#48bb78";
    if (timerSeconds < 90) return "#f5a623";
    return "#e94560";
  };

  const getDifficultyInfo = () => {
    if (!tableTopicCurrentPrompt) return null;
    return TABLE_TOPIC_DIFFICULTIES.find(d => d.value === tableTopicCurrentPrompt.difficulty);
  };

  const getCategoryInfo = () => {
    if (!tableTopicCurrentPrompt) return null;
    return TABLE_TOPIC_CATEGORIES.find(c => c.value === tableTopicCurrentPrompt.category);
  };

  if (showCategoryPicker) {
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
          maxWidth: 520,
          width: "90%",
          color: "white",
          pointerEvents: "auto",
          border: "1px solid rgba(255,255,255,0.1)",
          maxHeight: "85vh",
          overflowY: "auto",
        }}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Table Topics</div>
            <div style={{ fontSize: 13, color: "#a0aec0" }}>Choose a category and difficulty</div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: "#a0aec0", marginBottom: 8, fontWeight: 600, textTransform: "uppercase" }}>
              Category
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
            }}>
              {TABLE_TOPIC_CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setTableTopicCategory(cat.value)}
                  style={{
                    background: tableTopicCategory === cat.value
                      ? "rgba(99, 102, 241, 0.3)"
                      : "rgba(255,255,255,0.05)",
                    border: tableTopicCategory === cat.value
                      ? "2px solid #6366f1"
                      : "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 10,
                    padding: "10px 12px",
                    color: "white",
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: 13,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    transition: "all 0.15s",
                  }}
                >
                  <span style={{ fontSize: 18 }}>{cat.icon}</span>
                  <span style={{ fontWeight: tableTopicCategory === cat.value ? 600 : 400 }}>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, color: "#a0aec0", marginBottom: 8, fontWeight: 600, textTransform: "uppercase" }}>
              Difficulty
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setTableTopicDifficulty(null)}
                style={{
                  flex: 1,
                  background: tableTopicDifficulty === null
                    ? "rgba(99, 102, 241, 0.3)"
                    : "rgba(255,255,255,0.05)",
                  border: tableTopicDifficulty === null
                    ? "2px solid #6366f1"
                    : "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10,
                  padding: "10px 12px",
                  color: "white",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: tableTopicDifficulty === null ? 600 : 400,
                }}
              >
                Any
              </button>
              {TABLE_TOPIC_DIFFICULTIES.map(diff => (
                <button
                  key={diff.value}
                  onClick={() => setTableTopicDifficulty(diff.value)}
                  style={{
                    flex: 1,
                    background: tableTopicDifficulty === diff.value
                      ? `${diff.color}33`
                      : "rgba(255,255,255,0.05)",
                    border: tableTopicDifficulty === diff.value
                      ? `2px solid ${diff.color}`
                      : "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 10,
                    padding: "10px 12px",
                    color: "white",
                    cursor: "pointer",
                    fontSize: 13,
                    textAlign: "center",
                    fontWeight: tableTopicDifficulty === diff.value ? 600 : 400,
                  }}
                >
                  <div>{diff.label}</div>
                  <div style={{ fontSize: 10, color: "#a0aec0", marginTop: 2 }}>{diff.description}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleCategoryConfirm}
            style={{
              width: "100%",
              background: "linear-gradient(135deg, #6366f1, #4f46e5)",
              color: "white",
              border: "none",
              padding: "14px 24px",
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              minHeight: 44,
            }}
          >
            Get My Topic
          </button>
        </div>
      </div>
    );
  }

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
        position: "absolute",
        top: 20,
        right: 20,
        background: "rgba(0,0,0,0.8)",
        borderRadius: 12,
        padding: "12px 20px",
        textAlign: "center",
        color: "white",
      }}>
        <div style={{ fontSize: 12, color: "#a0aec0", marginBottom: 4 }}>TABLE TOPICS</div>
        <div style={{ fontSize: 11, color: "#718096" }}>1-2 minute impromptu speech</div>
      </div>

      {!showFeedback ? (
        <div style={{
          background: "rgba(0,0,0,0.85)",
          borderRadius: 20,
          padding: "32px",
          maxWidth: 500,
          width: "90%",
          textAlign: "center",
          color: "white",
          pointerEvents: "auto",
          border: "1px solid rgba(255,255,255,0.1)",
        }}>
          {tableTopicCurrentPrompt && (
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 12 }}>
              {getCategoryInfo() && (
                <span style={{
                  fontSize: 11,
                  background: "rgba(99, 102, 241, 0.2)",
                  color: "#a5b4fc",
                  padding: "3px 10px",
                  borderRadius: 12,
                  border: "1px solid rgba(99, 102, 241, 0.3)",
                }}>
                  {getCategoryInfo()!.icon} {getCategoryInfo()!.label}
                </span>
              )}
              {getDifficultyInfo() && (
                <span style={{
                  fontSize: 11,
                  background: `${getDifficultyInfo()!.color}22`,
                  color: getDifficultyInfo()!.color,
                  padding: "3px 10px",
                  borderRadius: 12,
                  border: `1px solid ${getDifficultyInfo()!.color}44`,
                }}>
                  {getDifficultyInfo()!.label}
                </span>
              )}
            </div>
          )}

          <div style={{ fontSize: 12, color: "#f5a623", marginBottom: 12, fontWeight: 600 }}>
            YOUR TOPIC
          </div>
          <div style={{
            fontSize: 20,
            fontWeight: 600,
            lineHeight: 1.5,
            marginBottom: 20,
            color: "#fff",
            fontStyle: "italic",
          }}>
            "{tableTopicPrompt}"
          </div>

          {started && (
            <div style={{ marginBottom: 20 }}>
              <div style={{
                fontSize: 48,
                fontWeight: 800,
                color: getTimerColor(),
                fontFamily: "monospace",
              }}>
                {formatTime(timerSeconds)}
              </div>
              <div style={{
                width: "80%",
                height: 6,
                background: "rgba(255,255,255,0.1)",
                borderRadius: 3,
                margin: "8px auto",
                overflow: "hidden",
              }}>
                <div style={{
                  height: "100%",
                  width: `${Math.min((timerSeconds / timerMaxSeconds) * 100, 100)}%`,
                  background: getTimerColor(),
                  borderRadius: 3,
                  transition: "width 1s linear",
                }} />
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            {!started ? (
              <>
                <button
                  onClick={() => setShowCategoryPicker(true)}
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    color: "white",
                    border: "1px solid rgba(255,255,255,0.2)",
                    padding: "12px 24px",
                    borderRadius: 10,
                    fontSize: 14,
                    cursor: "pointer",
                    minHeight: 44,
                  }}
                >
                  Categories
                </button>
                <button
                  onClick={handleNewPrompt}
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    color: "white",
                    border: "1px solid rgba(255,255,255,0.2)",
                    padding: "12px 24px",
                    borderRadius: 10,
                    fontSize: 14,
                    cursor: "pointer",
                    minHeight: 44,
                  }}
                >
                  New Prompt
                </button>
                <button
                  onClick={handleStart}
                  style={{
                    background: "linear-gradient(135deg, #48bb78, #38a169)",
                    color: "white",
                    border: "none",
                    padding: "12px 24px",
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                    minHeight: 44,
                  }}
                >
                  Start Speaking
                </button>
              </>
            ) : (
              <button
                onClick={handleFinish}
                style={{
                  background: "linear-gradient(135deg, #e94560, #c62a71)",
                  color: "white",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  minHeight: 44,
                }}
              >
                Finish Speaking
              </button>
            )}
          </div>
        </div>
      ) : (
        <div style={{
          background: "rgba(0,0,0,0.85)",
          borderRadius: 20,
          padding: "32px",
          maxWidth: 400,
          width: "90%",
          textAlign: "center",
          color: "white",
          pointerEvents: "auto",
          border: "1px solid rgba(255,255,255,0.1)",
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>👏</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
            Great Job!
          </div>
          <div style={{ fontSize: 16, color: "#a0aec0", marginBottom: 8 }}>
            You spoke for {formatTime(timerSeconds)}
          </div>
          <div style={{ fontSize: 14, color: "#718096", marginBottom: 20 }}>
            {timerSeconds < 60
              ? "Try to elaborate more next time - aim for at least 1 minute!"
              : timerSeconds <= 120
              ? "Perfect timing! You stayed within the ideal range."
              : "Great effort! Try to be a bit more concise next time."}
          </div>

          {recorder.hasRecording && (
            <div style={{
              background: "rgba(255,255,255,0.05)",
              borderRadius: 12,
              padding: "14px 18px",
              marginBottom: 16,
              border: "1px solid rgba(255,255,255,0.1)",
            }}>
              <div style={{ fontSize: 12, color: "#a0aec0", marginBottom: 10 }}>Your Recording</div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                {!recorder.isPlaying ? (
                  <button
                    onClick={recorder.playRecording}
                    style={{
                      background: "linear-gradient(135deg, #4299e1, #3182ce)",
                      color: "white",
                      border: "none",
                      padding: "8px 18px",
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      minHeight: 44,
                    }}
                  >
                    Play Back
                  </button>
                ) : (
                  <button
                    onClick={recorder.stopPlayback}
                    style={{
                      background: "rgba(255,255,255,0.15)",
                      color: "white",
                      border: "1px solid rgba(255,255,255,0.2)",
                      padding: "8px 18px",
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      minHeight: 44,
                    }}
                  >
                    Stop
                  </button>
                )}
                <button
                  onClick={() => recorder.downloadRecording("table-topics-recording")}
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    color: "white",
                    border: "1px solid rgba(255,255,255,0.2)",
                    padding: "8px 18px",
                    borderRadius: 8,
                    fontSize: 13,
                    cursor: "pointer",
                    minHeight: 44,
                  }}
                >
                  Download
                </button>
              </div>
            </div>
          )}

          <button
            onClick={handleComplete}
            style={{
              background: "linear-gradient(135deg, #48bb78, #38a169)",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              minHeight: 44,
            }}
          >
            Complete Session
          </button>
        </div>
      )}

      {started && !showFeedback && recorder.isRecording && (
        <div style={{
          position: "absolute",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: 6,
          pointerEvents: "none",
        }}>
          <div style={{
            width: 10, height: 10, borderRadius: "50%",
            background: "#e94560",
            animation: "pulse 1.5s infinite",
          }} />
          <span style={{ color: "#e94560", fontSize: 12, fontWeight: 600 }}>REC</span>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
