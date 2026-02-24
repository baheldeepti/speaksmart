import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type GamePhase = "menu" | "role_selection" | "playing" | "feedback";
export type Role = "speaker" | "table_topics" | "timer" | "evaluator" | "grammarian" | "ah_counter";
export type PlayerLevel = "Beginner" | "Confident Speaker" | "Master Communicator";

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
}

export interface RoleCompletion {
  role: Role;
  completedAt: string;
  pointsEarned: number;
}

export interface EvaluationItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface ToastmastersState {
  phase: GamePhase;
  selectedRole: Role | null;
  points: number;
  level: PlayerLevel;
  completedRoles: RoleCompletion[];
  badges: Badge[];
  
  timerSeconds: number;
  timerRunning: boolean;
  timerMaxSeconds: number;
  
  tableTopicPrompt: string;
  
  evaluationChecklist: EvaluationItem[];
  
  audienceReaction: "neutral" | "nodding" | "applause" | "distracted";
  
  grammarianNotes: string[];
  ahCounterCount: number;
  
  speechFeedback: {
    speechLength: number;
    pacing: string;
    fillerWords: number;
  } | null;

  setPhase: (phase: GamePhase) => void;
  selectRole: (role: Role) => void;
  startRole: () => void;
  
  startTimer: (maxSeconds: number) => void;
  tickTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
  
  generateTableTopic: () => void;
  
  toggleEvaluationItem: (id: string) => void;
  
  setAudienceReaction: (reaction: "neutral" | "nodding" | "applause" | "distracted") => void;
  
  addGrammarianNote: (note: string) => void;
  incrementAhCounter: () => void;
  resetAhCounter: () => void;
  
  completeRole: () => void;
  setSpeechFeedback: (feedback: ToastmastersState["speechFeedback"]) => void;
  
  goToMenu: () => void;
  goToRoleSelection: () => void;
}

const TABLE_TOPIC_PROMPTS = [
  "What is the most important lesson you've learned this year?",
  "If you could have dinner with any historical figure, who would it be and why?",
  "Describe your perfect day from start to finish.",
  "What skill do you wish you had learned earlier in life?",
  "If you could change one thing about the world, what would it be?",
  "What's the best advice you've ever received?",
  "Tell us about a time when you stepped outside your comfort zone.",
  "If you could live anywhere in the world, where would it be?",
  "What does success mean to you?",
  "Describe a moment that changed your perspective on life.",
  "What is the most underrated quality in a leader?",
  "If you had to teach a class on any subject, what would it be?",
  "What's one habit that has significantly improved your life?",
  "Tell us about your proudest accomplishment.",
  "If you could solve one global problem, which would you choose?",
  "What motivates you to keep going during tough times?",
  "Describe a book or movie that profoundly impacted you.",
  "What would you do if you knew you couldn't fail?",
  "Tell us about someone who has inspired you.",
  "What's the most important thing you want people to remember about you?",
];

const DEFAULT_EVALUATION_CHECKLIST: EvaluationItem[] = [
  { id: "opening", label: "Strong opening that grabbed attention", checked: false },
  { id: "structure", label: "Clear speech structure (intro, body, conclusion)", checked: false },
  { id: "eye_contact", label: "Good eye contact with audience", checked: false },
  { id: "vocal_variety", label: "Effective vocal variety and pacing", checked: false },
  { id: "gestures", label: "Natural and purposeful gestures", checked: false },
  { id: "fillers", label: "Minimal use of filler words", checked: false },
  { id: "message", label: "Clear and memorable message", checked: false },
  { id: "closing", label: "Strong closing that reinforced the message", checked: false },
  { id: "timing", label: "Within the allotted time", checked: false },
  { id: "enthusiasm", label: "Showed enthusiasm and passion", checked: false },
];

const DEFAULT_BADGES: Badge[] = [
  { id: "first_speech", name: "First Speech", description: "Complete your first speaker role", icon: "🎤", earned: false },
  { id: "quick_thinker", name: "Quick Thinker", description: "Complete a Table Topics session", icon: "💡", earned: false },
  { id: "timekeeper", name: "Timekeeper", description: "Complete the Timer role", icon: "⏱️", earned: false },
  { id: "critic", name: "Constructive Critic", description: "Complete the Evaluator role", icon: "📝", earned: false },
  { id: "wordsmith", name: "Wordsmith", description: "Complete the Grammarian role", icon: "📖", earned: false },
  { id: "ah_hunter", name: "Ah Hunter", description: "Complete the Ah Counter role", icon: "🔍", earned: false },
  { id: "all_rounder", name: "All-Rounder", description: "Complete all 6 roles", icon: "🏆", earned: false },
  { id: "five_sessions", name: "Dedicated", description: "Complete 5 sessions total", icon: "⭐", earned: false },
  { id: "ten_sessions", name: "Committed", description: "Complete 10 sessions total", icon: "🌟", earned: false },
];

function calculateLevel(points: number): PlayerLevel {
  if (points >= 500) return "Master Communicator";
  if (points >= 200) return "Confident Speaker";
  return "Beginner";
}

function getPointsForRole(role: Role): number {
  switch (role) {
    case "speaker": return 50;
    case "table_topics": return 30;
    case "evaluator": return 40;
    case "timer": return 20;
    case "grammarian": return 25;
    case "ah_counter": return 20;
    default: return 10;
  }
}

const loadState = () => {
  try {
    const saved = localStorage.getItem("toastmasters_state");
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        points: parsed.points || 0,
        completedRoles: parsed.completedRoles || [],
        badges: parsed.badges || DEFAULT_BADGES,
      };
    }
  } catch {}
  return { points: 0, completedRoles: [], badges: DEFAULT_BADGES };
};

const saveState = (points: number, completedRoles: RoleCompletion[], badges: Badge[]) => {
  try {
    localStorage.setItem("toastmasters_state", JSON.stringify({ points, completedRoles, badges }));
  } catch {}
};

export const useToastmasters = create<ToastmastersState>()(
  subscribeWithSelector((set, get) => {
    const saved = loadState();
    return {
      phase: "menu",
      selectedRole: null,
      points: saved.points,
      level: calculateLevel(saved.points),
      completedRoles: saved.completedRoles,
      badges: saved.badges,
      
      timerSeconds: 0,
      timerRunning: false,
      timerMaxSeconds: 300,
      
      tableTopicPrompt: "",
      
      evaluationChecklist: DEFAULT_EVALUATION_CHECKLIST.map(item => ({ ...item })),
      
      audienceReaction: "neutral",
      
      grammarianNotes: [],
      ahCounterCount: 0,
      
      speechFeedback: null,

      setPhase: (phase) => set({ phase }),
      
      selectRole: (role) => set({ selectedRole: role }),
      
      startRole: () => {
        const { selectedRole } = get();
        if (!selectedRole) return;
        
        const updates: Partial<ToastmastersState> = {
          phase: "playing",
          timerSeconds: 0,
          timerRunning: false,
          audienceReaction: "neutral",
          speechFeedback: null,
          evaluationChecklist: DEFAULT_EVALUATION_CHECKLIST.map(item => ({ ...item })),
          grammarianNotes: [],
          ahCounterCount: 0,
        };
        
        if (selectedRole === "table_topics") {
          const prompts = TABLE_TOPIC_PROMPTS;
          updates.tableTopicPrompt = prompts[Math.floor(Math.random() * prompts.length)];
        }
        
        set(updates);
      },
      
      startTimer: (maxSeconds) => set({ timerRunning: true, timerMaxSeconds: maxSeconds, timerSeconds: 0 }),
      
      tickTimer: () => {
        const { timerSeconds, timerMaxSeconds, timerRunning } = get();
        if (!timerRunning) return;
        if (timerSeconds >= timerMaxSeconds) {
          set({ timerRunning: false });
          return;
        }
        set({ timerSeconds: timerSeconds + 1 });
      },
      
      stopTimer: () => set({ timerRunning: false }),
      
      resetTimer: () => set({ timerSeconds: 0, timerRunning: false }),
      
      generateTableTopic: () => {
        const prompts = TABLE_TOPIC_PROMPTS;
        set({ tableTopicPrompt: prompts[Math.floor(Math.random() * prompts.length)] });
      },
      
      toggleEvaluationItem: (id) => {
        const { evaluationChecklist } = get();
        set({
          evaluationChecklist: evaluationChecklist.map(item =>
            item.id === id ? { ...item, checked: !item.checked } : item
          ),
        });
      },
      
      setAudienceReaction: (reaction) => set({ audienceReaction: reaction }),
      
      addGrammarianNote: (note) => {
        const { grammarianNotes } = get();
        set({ grammarianNotes: [...grammarianNotes, note] });
      },
      
      incrementAhCounter: () => {
        const { ahCounterCount } = get();
        set({ ahCounterCount: ahCounterCount + 1 });
      },
      
      resetAhCounter: () => set({ ahCounterCount: 0 }),
      
      completeRole: () => {
        const { selectedRole, points, completedRoles, badges, timerSeconds } = get();
        if (!selectedRole) return;
        
        const rolePoints = getPointsForRole(selectedRole);
        const newPoints = points + rolePoints;
        const newLevel = calculateLevel(newPoints);
        
        const completion: RoleCompletion = {
          role: selectedRole,
          completedAt: new Date().toISOString(),
          pointsEarned: rolePoints,
        };
        
        const newCompletedRoles = [...completedRoles, completion];
        
        const newBadges = badges.map(badge => {
          if (badge.earned) return badge;
          
          switch (badge.id) {
            case "first_speech":
              if (selectedRole === "speaker") return { ...badge, earned: true, earnedDate: new Date().toISOString() };
              break;
            case "quick_thinker":
              if (selectedRole === "table_topics") return { ...badge, earned: true, earnedDate: new Date().toISOString() };
              break;
            case "timekeeper":
              if (selectedRole === "timer") return { ...badge, earned: true, earnedDate: new Date().toISOString() };
              break;
            case "critic":
              if (selectedRole === "evaluator") return { ...badge, earned: true, earnedDate: new Date().toISOString() };
              break;
            case "wordsmith":
              if (selectedRole === "grammarian") return { ...badge, earned: true, earnedDate: new Date().toISOString() };
              break;
            case "ah_hunter":
              if (selectedRole === "ah_counter") return { ...badge, earned: true, earnedDate: new Date().toISOString() };
              break;
            case "all_rounder": {
              const allRoles: Role[] = ["speaker", "table_topics", "timer", "evaluator", "grammarian", "ah_counter"];
              const completedRoleTypes = new Set(newCompletedRoles.map(c => c.role));
              if (allRoles.every(r => completedRoleTypes.has(r))) {
                return { ...badge, earned: true, earnedDate: new Date().toISOString() };
              }
              break;
            }
            case "five_sessions":
              if (newCompletedRoles.length >= 5) return { ...badge, earned: true, earnedDate: new Date().toISOString() };
              break;
            case "ten_sessions":
              if (newCompletedRoles.length >= 10) return { ...badge, earned: true, earnedDate: new Date().toISOString() };
              break;
          }
          return badge;
        });

        const feedback = {
          speechLength: timerSeconds,
          pacing: timerSeconds < 60 ? "Too fast - try to elaborate more" : timerSeconds > 300 ? "Consider being more concise" : "Good pacing!",
          fillerWords: Math.floor(Math.random() * 5),
        };
        
        saveState(newPoints, newCompletedRoles, newBadges);
        
        set({
          phase: "feedback",
          points: newPoints,
          level: newLevel,
          completedRoles: newCompletedRoles,
          badges: newBadges,
          timerRunning: false,
          speechFeedback: feedback,
        });
      },
      
      setSpeechFeedback: (feedback) => set({ speechFeedback: feedback }),
      
      goToMenu: () => set({
        phase: "menu",
        selectedRole: null,
        timerSeconds: 0,
        timerRunning: false,
        audienceReaction: "neutral",
        speechFeedback: null,
      }),
      
      goToRoleSelection: () => set({
        phase: "role_selection",
        selectedRole: null,
        timerSeconds: 0,
        timerRunning: false,
      }),
    };
  })
);
