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

export type TableTopicCategory = "all" | "leadership" | "personal_growth" | "ethics" | "storytelling" | "technology" | "culture" | "humor" | "toastmasters";
export type TableTopicDifficulty = "easy" | "medium" | "hard";

export interface TableTopicPrompt {
  text: string;
  category: TableTopicCategory;
  difficulty: TableTopicDifficulty;
}

export interface PathwaySelection {
  pathwayName: string;
  levelNumber: number;
  levelName: string;
  projectName: string;
  objectives: string[];
  minMinutes: number;
  maxMinutes: number;
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
  tableTopicCategory: TableTopicCategory;
  tableTopicDifficulty: TableTopicDifficulty | null;
  tableTopicCurrentPrompt: TableTopicPrompt | null;
  
  evaluationChecklist: EvaluationItem[];
  
  audienceReaction: "neutral" | "nodding" | "applause" | "distracted";
  
  grammarianNotes: string[];
  ahCounterCount: number;
  
  speechFeedback: {
    speechLength: number;
    pacing: string;
    fillerWords: number;
  } | null;

  selectedPathwayProject: PathwaySelection | null;

  setPhase: (phase: GamePhase) => void;
  selectRole: (role: Role) => void;
  startRole: () => void;
  setSelectedPathwayProject: (project: PathwaySelection | null) => void;
  
  startTimer: (maxSeconds: number) => void;
  tickTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
  
  generateTableTopic: () => void;
  setTableTopicCategory: (category: TableTopicCategory) => void;
  setTableTopicDifficulty: (difficulty: TableTopicDifficulty | null) => void;
  
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

const TABLE_TOPIC_PROMPTS: TableTopicPrompt[] = [
  { text: "What is the most underrated quality in a leader?", category: "leadership", difficulty: "easy" },
  { text: "Describe a time you had to lead a team through a difficult situation.", category: "leadership", difficulty: "medium" },
  { text: "What's the difference between a manager and a leader?", category: "leadership", difficulty: "easy" },
  { text: "How do you handle conflict within a team?", category: "leadership", difficulty: "medium" },
  { text: "What makes someone a good mentor?", category: "leadership", difficulty: "easy" },
  { text: "Should leaders always lead by example? Defend your position.", category: "leadership", difficulty: "hard" },
  { text: "Describe the worst leadership decision you've witnessed and what you'd have done differently.", category: "leadership", difficulty: "medium" },
  { text: "How do you motivate someone who has lost interest in their work?", category: "leadership", difficulty: "medium" },
  { text: "Is it better to be respected or liked as a leader? Make a case.", category: "leadership", difficulty: "hard" },
  { text: "What's one thing every new manager should know on day one?", category: "leadership", difficulty: "easy" },
  { text: "How should a leader handle taking responsibility for a team failure?", category: "leadership", difficulty: "hard" },
  { text: "Describe a workplace challenge that taught you something valuable.", category: "leadership", difficulty: "medium" },
  { text: "How do you build trust in a remote team?", category: "leadership", difficulty: "medium" },

  { text: "What's one habit that has significantly improved your life?", category: "personal_growth", difficulty: "easy" },
  { text: "Describe a moment that changed your perspective on life.", category: "personal_growth", difficulty: "medium" },
  { text: "What skill do you wish you had learned earlier in life?", category: "personal_growth", difficulty: "easy" },
  { text: "Tell us about a time when you stepped outside your comfort zone.", category: "personal_growth", difficulty: "medium" },
  { text: "What motivates you to keep going during tough times?", category: "personal_growth", difficulty: "easy" },
  { text: "Tell us about your proudest accomplishment.", category: "personal_growth", difficulty: "easy" },
  { text: "What would you do if you knew you couldn't fail?", category: "personal_growth", difficulty: "easy" },
  { text: "How do you define personal success beyond career achievements?", category: "personal_growth", difficulty: "medium" },
  { text: "Describe a failure that ultimately made you stronger. Walk us through the journey.", category: "personal_growth", difficulty: "hard" },
  { text: "What's the hardest truth you've had to accept about yourself?", category: "personal_growth", difficulty: "hard" },
  { text: "How do you stay disciplined when motivation fades?", category: "personal_growth", difficulty: "medium" },
  { text: "What advice would you give your 18-year-old self?", category: "personal_growth", difficulty: "easy" },
  { text: "Argue for or against: comfort is the enemy of growth.", category: "personal_growth", difficulty: "hard" },

  { text: "Is it ever okay to lie to protect someone's feelings?", category: "ethics", difficulty: "medium" },
  { text: "Should wealthy nations be obligated to help poorer ones?", category: "ethics", difficulty: "hard" },
  { text: "If you found a wallet with $1,000 and an ID, what would you do?", category: "ethics", difficulty: "easy" },
  { text: "Is social media doing more harm than good to society?", category: "ethics", difficulty: "medium" },
  { text: "Should voting be mandatory? Make a compelling argument.", category: "ethics", difficulty: "hard" },
  { text: "What's one law you would change and why?", category: "ethics", difficulty: "medium" },
  { text: "Is privacy a right or a privilege in the digital age?", category: "ethics", difficulty: "hard" },
  { text: "Should companies be held responsible for their environmental impact?", category: "ethics", difficulty: "medium" },
  { text: "Is it ethical to use AI to make hiring decisions?", category: "ethics", difficulty: "hard" },
  { text: "What does civic responsibility mean to you?", category: "ethics", difficulty: "easy" },
  { text: "Should there be limits on free speech? Defend your position.", category: "ethics", difficulty: "hard" },
  { text: "Is cancel culture a form of accountability or mob justice?", category: "ethics", difficulty: "hard" },
  { text: "What's one social issue you think doesn't get enough attention?", category: "ethics", difficulty: "medium" },

  { text: "Tell us a story about a stranger who changed your day.", category: "storytelling", difficulty: "medium" },
  { text: "If you woke up tomorrow with a superpower, what would it be and what would you do first?", category: "storytelling", difficulty: "easy" },
  { text: "Describe a book or movie that profoundly impacted you.", category: "storytelling", difficulty: "easy" },
  { text: "Tell us about someone who has inspired you.", category: "storytelling", difficulty: "easy" },
  { text: "Describe your perfect day from start to finish.", category: "storytelling", difficulty: "easy" },
  { text: "You discover a door in your house that wasn't there yesterday. What happens next?", category: "storytelling", difficulty: "medium" },
  { text: "Tell us about the most memorable meal you've ever had.", category: "storytelling", difficulty: "easy" },
  { text: "You can travel to any fictional world for a week. Where do you go and what do you do?", category: "storytelling", difficulty: "medium" },
  { text: "Create a 1-minute story that begins with 'I never expected to find that in my mailbox.'", category: "storytelling", difficulty: "hard" },
  { text: "Describe a childhood memory using all five senses.", category: "storytelling", difficulty: "medium" },
  { text: "You're writing a letter to be opened in 100 years. What does it say?", category: "storytelling", difficulty: "hard" },
  { text: "Tell us about a coincidence that seemed too perfect to be random.", category: "storytelling", difficulty: "medium" },
  { text: "Pitch a movie idea in 60 seconds. Make us want to watch it.", category: "storytelling", difficulty: "hard" },

  { text: "How will AI change the job market in the next 10 years?", category: "technology", difficulty: "medium" },
  { text: "Should children have access to smartphones? At what age?", category: "technology", difficulty: "easy" },
  { text: "What technology from science fiction do you wish existed today?", category: "technology", difficulty: "easy" },
  { text: "Is remote work better for society or worse? Take a side.", category: "technology", difficulty: "medium" },
  { text: "Should AI-generated art be considered real art? Argue your case.", category: "technology", difficulty: "hard" },
  { text: "How has technology improved or worsened human relationships?", category: "technology", difficulty: "medium" },
  { text: "What's the most important technological invention of the last 50 years?", category: "technology", difficulty: "easy" },
  { text: "Will humans ever colonize another planet? Should we try?", category: "technology", difficulty: "medium" },
  { text: "Argue for or against: social media should require age verification.", category: "technology", difficulty: "hard" },
  { text: "What's one piece of technology you couldn't live without?", category: "technology", difficulty: "easy" },
  { text: "Should self-driving cars be allowed on public roads? Defend your position.", category: "technology", difficulty: "hard" },
  { text: "How should society prepare for jobs that don't exist yet?", category: "technology", difficulty: "hard" },
  { text: "Describe what daily life might look like in the year 2075.", category: "technology", difficulty: "medium" },

  { text: "If you could live anywhere in the world, where would it be?", category: "culture", difficulty: "easy" },
  { text: "Describe a tradition from your culture that you treasure.", category: "culture", difficulty: "easy" },
  { text: "What's the most valuable thing travel has taught you?", category: "culture", difficulty: "medium" },
  { text: "If you could have dinner with any historical figure, who would it be and why?", category: "culture", difficulty: "easy" },
  { text: "Tell us about a food that reminds you of home.", category: "culture", difficulty: "easy" },
  { text: "How has a different culture influenced the way you see the world?", category: "culture", difficulty: "medium" },
  { text: "What's one custom or tradition from another culture you wish your culture adopted?", category: "culture", difficulty: "medium" },
  { text: "Describe the most beautiful place you've ever visited.", category: "culture", difficulty: "easy" },
  { text: "Should learning a second language be mandatory in schools? Defend your view.", category: "culture", difficulty: "hard" },
  { text: "How does music transcend cultural boundaries?", category: "culture", difficulty: "medium" },
  { text: "Tell us about a cultural misunderstanding that taught you something.", category: "culture", difficulty: "medium" },
  { text: "Is globalization helping or hurting local cultures? Take a position.", category: "culture", difficulty: "hard" },
  { text: "What's a festival or celebration you think everyone should experience?", category: "culture", difficulty: "easy" },

  { text: "If animals could talk, which species would be the rudest?", category: "humor", difficulty: "easy" },
  { text: "What's the most useless talent you have?", category: "humor", difficulty: "easy" },
  { text: "If you could add one absurd rule to any sport, what would it be?", category: "humor", difficulty: "easy" },
  { text: "Describe your morning routine as if you were narrating a nature documentary.", category: "humor", difficulty: "medium" },
  { text: "If you were a flavor of ice cream, which would you be and why?", category: "humor", difficulty: "easy" },
  { text: "What would be the worst superpower to have?", category: "humor", difficulty: "easy" },
  { text: "Convince us that a random household object is actually a secret weapon.", category: "humor", difficulty: "medium" },
  { text: "If you could rename any day of the week, what would you call it?", category: "humor", difficulty: "easy" },
  { text: "Pitch a terrible business idea and make it sound amazing.", category: "humor", difficulty: "hard" },
  { text: "What would your autobiography be titled?", category: "humor", difficulty: "easy" },
  { text: "You're the CEO of a company that sells invisible products. Give us the sales pitch.", category: "humor", difficulty: "hard" },
  { text: "If you could be any kitchen appliance, which one and why?", category: "humor", difficulty: "easy" },
  { text: "Describe your last vacation as if it were a movie trailer.", category: "humor", difficulty: "medium" },

  { text: "What's the best advice you've ever received about public speaking?", category: "toastmasters", difficulty: "easy" },
  { text: "How has Toastmasters (or speaking practice) changed you?", category: "toastmasters", difficulty: "easy" },
  { text: "What's the most nervous you've ever been before a speech?", category: "toastmasters", difficulty: "easy" },
  { text: "Describe the ideal meeting agenda for a Toastmasters club.", category: "toastmasters", difficulty: "medium" },
  { text: "What's the single most important thing to remember when evaluating a speaker?", category: "toastmasters", difficulty: "medium" },
  { text: "How would you convince a friend to join Toastmasters?", category: "toastmasters", difficulty: "easy" },
  { text: "What role in a Toastmasters meeting teaches you the most? Defend your choice.", category: "toastmasters", difficulty: "hard" },
  { text: "Describe the difference between a good speech and a great speech.", category: "toastmasters", difficulty: "medium" },
  { text: "What's more important: content or delivery? Make your case.", category: "toastmasters", difficulty: "hard" },
  { text: "How do you prepare for an impromptu speech?", category: "toastmasters", difficulty: "medium" },
  { text: "Tell us about a speech that moved you to tears or laughter.", category: "toastmasters", difficulty: "medium" },
  { text: "Should Table Topics be harder or easier? Argue your point.", category: "toastmasters", difficulty: "hard" },
  { text: "What's the most important thing you want people to remember about you?", category: "toastmasters", difficulty: "medium" },
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

function getFilteredPrompts(category: TableTopicCategory, difficulty: TableTopicDifficulty | null): TableTopicPrompt[] {
  let filtered = TABLE_TOPIC_PROMPTS;
  if (category !== "all") {
    filtered = filtered.filter(p => p.category === category);
  }
  if (difficulty) {
    filtered = filtered.filter(p => p.difficulty === difficulty);
  }
  if (filtered.length === 0) {
    return TABLE_TOPIC_PROMPTS;
  }
  return filtered;
}

export const TABLE_TOPIC_CATEGORIES: { value: TableTopicCategory; label: string; icon: string }[] = [
  { value: "all", label: "Random", icon: "🎲" },
  { value: "leadership", label: "Leadership & Business", icon: "💼" },
  { value: "personal_growth", label: "Personal Growth", icon: "🌱" },
  { value: "ethics", label: "Ethics & Society", icon: "⚖️" },
  { value: "storytelling", label: "Storytelling & Creativity", icon: "📖" },
  { value: "technology", label: "Technology & Future", icon: "🚀" },
  { value: "culture", label: "Culture & Travel", icon: "🌍" },
  { value: "humor", label: "Humor & Light", icon: "😄" },
  { value: "toastmasters", label: "Toastmasters-Specific", icon: "🎤" },
];

export const TABLE_TOPIC_DIFFICULTIES: { value: TableTopicDifficulty; label: string; description: string; color: string }[] = [
  { value: "easy", label: "Easy", description: "Opinion-based", color: "#48bb78" },
  { value: "medium", label: "Medium", description: "Requires structure", color: "#f5a623" },
  { value: "hard", label: "Hard", description: "Debate / Persuasion", color: "#e94560" },
];

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
      tableTopicCategory: "all",
      tableTopicDifficulty: null,
      tableTopicCurrentPrompt: null,
      
      evaluationChecklist: DEFAULT_EVALUATION_CHECKLIST.map(item => ({ ...item })),
      
      audienceReaction: "neutral",
      
      grammarianNotes: [],
      ahCounterCount: 0,
      
      speechFeedback: null,

      selectedPathwayProject: null,

      setPhase: (phase) => set({ phase }),
      
      selectRole: (role) => set({ selectedRole: role }),
      
      setSelectedPathwayProject: (project) => set({ selectedPathwayProject: project }),
      
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
          const { tableTopicCategory, tableTopicDifficulty } = get();
          const filtered = getFilteredPrompts(tableTopicCategory, tableTopicDifficulty);
          const prompt = filtered[Math.floor(Math.random() * filtered.length)];
          updates.tableTopicPrompt = prompt.text;
          updates.tableTopicCurrentPrompt = prompt;
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
        const { tableTopicCategory, tableTopicDifficulty } = get();
        const filtered = getFilteredPrompts(tableTopicCategory, tableTopicDifficulty);
        const prompt = filtered[Math.floor(Math.random() * filtered.length)];
        set({ tableTopicPrompt: prompt.text, tableTopicCurrentPrompt: prompt });
      },
      
      setTableTopicCategory: (category) => set({ tableTopicCategory: category }),
      setTableTopicDifficulty: (difficulty) => set({ tableTopicDifficulty: difficulty }),
      
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
        selectedPathwayProject: null,
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
