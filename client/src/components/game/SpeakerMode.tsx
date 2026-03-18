import { useEffect, useRef, useState } from "react";
import { useToastmasters } from "@/lib/stores/useToastmasters";
import { useAudio } from "@/lib/stores/useAudio";
import { useRecorder } from "@/lib/useRecorder";
import { PATHWAYS, type Pathway, type PathwayLevel, type PathwayProject } from "@/data/pathways";
import type { PathwaySelection } from "@/lib/stores/useToastmasters";

export default function SpeakerMode() {
  const {
    timerSeconds, timerRunning, timerMaxSeconds,
    startTimer, tickTimer, stopTimer, completeRole,
    setAudienceReaction, goToMenu,
    selectedPathwayProject, setSelectedPathwayProject,
  } = useToastmasters();
  const { playSuccess } = useAudio();
  const recorder = useRecorder();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [started, setStarted] = useState(false);
  const [finishing, setFinishing] = useState(false);

  const [pathwaysEnabled, setPathwaysEnabled] = useState(false);
  const [selectedPathway, setSelectedPathway] = useState<Pathway | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<PathwayLevel | null>(null);
  const [selectedProject, setSelectedProject] = useState<PathwayProject | null>(null);

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
    if (!started) return;
    const elapsed = timerSeconds;
    const max = timerMaxSeconds;
    const ratio = elapsed / max;

    if (ratio < 0.3) {
      setAudienceReaction("neutral");
    } else if (ratio < 0.7) {
      setAudienceReaction("nodding");
    } else if (ratio >= 1) {
      setAudienceReaction("distracted");
    }
  }, [timerSeconds, timerMaxSeconds, started, setAudienceReaction]);

  useEffect(() => {
    if (timerSeconds >= timerMaxSeconds && timerRunning) {
      stopTimer();
      recorder.stopRecording();
      setAudienceReaction("applause");
    }
  }, [timerSeconds, timerMaxSeconds, timerRunning, stopTimer, setAudienceReaction]);

  useEffect(() => {
    if (!finishing) return;
    if (recorder.hasRecording && recorder.audioUrl) {
      (async () => {
        try {
          const res = await fetch(recorder.audioUrl!);
          const blob = await res.blob();
          window.__pendingRecordingBlob = blob;
          window.__pendingRecordingRole = "speaker";
          window.__pendingRecordingDuration = timerSeconds;
        } catch {}
        completeRole();
      })();
    } else {
      const timeout = setTimeout(() => completeRole(), 2000);
      return () => clearTimeout(timeout);
    }
  }, [finishing, recorder.hasRecording, recorder.audioUrl]);

  const handlePathwayToggle = () => {
    const next = !pathwaysEnabled;
    setPathwaysEnabled(next);
    if (!next) {
      setSelectedPathway(null);
      setSelectedLevel(null);
      setSelectedProject(null);
      setSelectedPathwayProject(null);
    }
  };

  const handleSelectPathway = (pathway: Pathway) => {
    setSelectedPathway(pathway);
    setSelectedLevel(null);
    setSelectedProject(null);
    setSelectedPathwayProject(null);
  };

  const handleSelectLevel = (level: PathwayLevel) => {
    setSelectedLevel(level);
    setSelectedProject(null);
    setSelectedPathwayProject(null);
  };

  const handleSelectProject = (project: PathwayProject) => {
    setSelectedProject(project);
    if (selectedPathway && selectedLevel) {
      const selection: PathwaySelection = {
        pathwayName: selectedPathway.name,
        levelNumber: selectedLevel.level,
        levelName: selectedLevel.name,
        projectName: project.name,
        objectives: project.objectives,
        minMinutes: project.minMinutes,
        maxMinutes: project.maxMinutes,
      };
      setSelectedPathwayProject(selection);
    }
  };

  const handleStart = () => {
    setStarted(true);
    const maxSeconds = selectedProject
      ? selectedProject.maxMinutes * 60
      : 300;
    startTimer(maxSeconds);
    recorder.startRecording();
  };

  const handleFinish = () => {
    stopTimer();
    recorder.stopRecording();
    setAudienceReaction("applause");
    playSuccess();
    setFinishing(true);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const getTimerColor = () => {
    const ratio = timerSeconds / timerMaxSeconds;
    if (ratio < 0.5) return "#48bb78";
    if (ratio < 0.8) return "#f5a623";
    return "#e94560";
  };

  return (
    <div style={{
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "20px",
      zIndex: 50,
      pointerEvents: "none",
    }}>
      {started && recorder.isRecording && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          background: "rgba(233, 69, 96, 0.9)",
          padding: "10px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          zIndex: 200,
          pointerEvents: "none",
        }}>
          <div style={{
            width: 12, height: 12, borderRadius: "50%",
            background: "white",
            animation: "recPulse 1s infinite",
          }} />
          <span style={{ color: "white", fontSize: 14, fontWeight: 700, letterSpacing: 1 }}>
            RECORDING YOUR SPEECH
          </span>
        </div>
      )}

      {started && !recorder.isRecording && !finishing && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          background: "rgba(72, 187, 120, 0.9)",
          padding: "10px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          zIndex: 200,
          pointerEvents: "none",
        }}>
          <span style={{ color: "white", fontSize: 14, fontWeight: 700 }}>
            RECORDING STOPPED
          </span>
        </div>
      )}

      {finishing && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 200,
          pointerEvents: "none",
        }}>
          <div style={{
            background: "rgba(0,0,0,0.9)",
            borderRadius: 16,
            padding: "32px 40px",
            textAlign: "center",
            color: "white",
          }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
              Processing your speech...
            </div>
            <div style={{ fontSize: 13, color: "#a0aec0" }}>
              Preparing your evaluation
            </div>
          </div>
        </div>
      )}

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
        <div style={{ fontSize: 12, color: "#a0aec0", marginBottom: 4 }}>SPEAKER MODE</div>
        <div style={{ fontSize: 11, color: "#718096" }}>
          {selectedPathwayProject
            ? `${selectedPathwayProject.projectName} (${selectedPathwayProject.minMinutes}-${selectedPathwayProject.maxMinutes} min)`
            : "5-minute prepared speech"}
        </div>
      </div>

      {started && (
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          pointerEvents: "none",
        }}>
          <div style={{
            fontSize: 64,
            fontWeight: 800,
            color: getTimerColor(),
            textShadow: `0 0 30px ${getTimerColor()}44`,
            fontFamily: "monospace",
          }}>
            {formatTime(timerSeconds)}
          </div>
          <div style={{
            width: 200,
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
              transition: "width 1s linear, background 0.5s",
            }} />
          </div>
          <div style={{ fontSize: 14, color: "#a0aec0" }}>
            {formatTime(timerMaxSeconds)} total
          </div>
          {selectedPathwayProject && (
            <div style={{
              marginTop: 12,
              padding: "8px 16px",
              background: "rgba(0,0,0,0.6)",
              borderRadius: 8,
              fontSize: 12,
              color: "#9f7aea",
            }}>
              {selectedPathwayProject.projectName}
            </div>
          )}
        </div>
      )}

      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        pointerEvents: "auto",
        marginBottom: 10,
      }}>
        {!started ? (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            maxWidth: 480,
            width: "100%",
          }}>
            <div style={{
              background: "rgba(0,0,0,0.85)",
              borderRadius: 16,
              padding: "20px 24px",
              width: "100%",
              border: "1px solid rgba(255,255,255,0.1)",
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: pathwaysEnabled ? 16 : 0,
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "white" }}>
                    Practice with Pathways Project
                  </div>
                  <div style={{ fontSize: 11, color: "#718096", marginTop: 2 }}>
                    Select a Toastmasters Pathways project for tailored feedback
                  </div>
                </div>
                <button
                  onClick={handlePathwayToggle}
                  style={{
                    width: 48,
                    height: 26,
                    borderRadius: 13,
                    border: "none",
                    background: pathwaysEnabled ? "#9f7aea" : "rgba(255,255,255,0.15)",
                    cursor: "pointer",
                    position: "relative",
                    transition: "background 0.2s",
                    flexShrink: 0,
                    marginLeft: 12,
                  }}
                >
                  <div style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "white",
                    position: "absolute",
                    top: 3,
                    left: pathwaysEnabled ? 25 : 3,
                    transition: "left 0.2s",
                  }} />
                </button>
              </div>

              {pathwaysEnabled && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 12, color: "#a0aec0", marginBottom: 6 }}>Path</div>
                    <div style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 6,
                    }}>
                      {PATHWAYS.map((p) => (
                        <button
                          key={p.name}
                          onClick={() => handleSelectPathway(p)}
                          style={{
                            padding: "6px 12px",
                            borderRadius: 8,
                            border: selectedPathway?.name === p.name
                              ? "1px solid #9f7aea"
                              : "1px solid rgba(255,255,255,0.15)",
                            background: selectedPathway?.name === p.name
                              ? "rgba(159,122,234,0.2)"
                              : "rgba(255,255,255,0.05)",
                            color: selectedPathway?.name === p.name ? "#d6bcfa" : "#a0aec0",
                            fontSize: 11,
                            cursor: "pointer",
                            transition: "all 0.15s",
                          }}
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedPathway && (
                    <div>
                      <div style={{ fontSize: 12, color: "#a0aec0", marginBottom: 6 }}>Level</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {selectedPathway.levels.map((l) => (
                          <button
                            key={l.level}
                            onClick={() => handleSelectLevel(l)}
                            style={{
                              padding: "6px 12px",
                              borderRadius: 8,
                              border: selectedLevel?.level === l.level
                                ? "1px solid #9f7aea"
                                : "1px solid rgba(255,255,255,0.15)",
                              background: selectedLevel?.level === l.level
                                ? "rgba(159,122,234,0.2)"
                                : "rgba(255,255,255,0.05)",
                              color: selectedLevel?.level === l.level ? "#d6bcfa" : "#a0aec0",
                              fontSize: 11,
                              cursor: "pointer",
                              transition: "all 0.15s",
                            }}
                          >
                            L{l.level}: {l.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedLevel && (
                    <div>
                      <div style={{ fontSize: 12, color: "#a0aec0", marginBottom: 6 }}>Project</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {selectedLevel.projects.map((proj) => (
                          <button
                            key={proj.name}
                            onClick={() => handleSelectProject(proj)}
                            style={{
                              padding: "10px 14px",
                              borderRadius: 10,
                              border: selectedProject?.name === proj.name
                                ? "1px solid #9f7aea"
                                : "1px solid rgba(255,255,255,0.15)",
                              background: selectedProject?.name === proj.name
                                ? "rgba(159,122,234,0.2)"
                                : "rgba(255,255,255,0.05)",
                              color: "white",
                              cursor: "pointer",
                              textAlign: "left",
                              transition: "all 0.15s",
                            }}
                          >
                            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: selectedProject?.name === proj.name ? "#d6bcfa" : "white" }}>
                              {proj.name}
                            </div>
                            <div style={{ fontSize: 11, color: "#718096" }}>
                              {proj.minMinutes}-{proj.maxMinutes} min • {proj.objectives.length} objectives
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedProject && (
                    <div style={{
                      background: "rgba(159,122,234,0.1)",
                      borderRadius: 10,
                      padding: "12px 14px",
                      border: "1px solid rgba(159,122,234,0.3)",
                    }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#d6bcfa", marginBottom: 8 }}>
                        Project Objectives
                      </div>
                      {selectedProject.objectives.map((obj, i) => (
                        <div key={i} style={{
                          fontSize: 12,
                          color: "#a0aec0",
                          padding: "3px 0",
                          display: "flex",
                          gap: 6,
                        }}>
                          <span style={{ color: "#9f7aea" }}>•</span>
                          {obj}
                        </div>
                      ))}
                      <div style={{
                        marginTop: 8,
                        fontSize: 11,
                        color: "#718096",
                      }}>
                        Time: {selectedProject.minMinutes}-{selectedProject.maxMinutes} minutes
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={handleStart}
              style={{
                background: "linear-gradient(135deg, #48bb78, #38a169)",
                color: "white",
                border: "none",
                padding: "14px 32px",
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 20px rgba(72, 187, 120, 0.4)",
                minHeight: 48,
              }}
            >
              Begin Speech
            </button>
          </div>
        ) : !finishing ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={handleFinish}
              style={{
                background: "linear-gradient(135deg, #e94560, #c62a71)",
                color: "white",
                border: "none",
                padding: "14px 32px",
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 20px rgba(233, 69, 96, 0.4)",
                minHeight: 48,
              }}
            >
              Finish Speech
            </button>
          </div>
        ) : null}
      </div>

      <style>{`
        @keyframes recPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
