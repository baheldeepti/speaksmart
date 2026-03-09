export interface PathwayProject {
  name: string;
  objectives: string[];
  minMinutes: number;
  maxMinutes: number;
}

export interface PathwayLevel {
  level: number;
  name: string;
  projects: PathwayProject[];
}

export interface Pathway {
  name: string;
  levels: PathwayLevel[];
}

export const PATHWAYS: Pathway[] = [
  {
    name: "Dynamic Leadership",
    levels: [
      {
        level: 1, name: "Mastering Fundamentals",
        projects: [
          { name: "Ice Breaker", objectives: ["Introduce yourself", "Organize a speech", "Present a clear message"], minMinutes: 4, maxMinutes: 6 },
          { name: "Evaluation and Feedback", objectives: ["Present a speech on any topic", "Receive and apply feedback", "Improve speaking skills"], minMinutes: 5, maxMinutes: 7 },
          { name: "Researching and Presenting", objectives: ["Research a topic", "Organize information clearly", "Present findings effectively"], minMinutes: 5, maxMinutes: 7 },
        ],
      },
      {
        level: 2, name: "Learning Your Style",
        projects: [
          { name: "Understanding Your Leadership Style", objectives: ["Identify your leadership style", "Articulate strengths and growth areas", "Develop a leadership plan"], minMinutes: 5, maxMinutes: 7 },
          { name: "Connect with Your Audience", objectives: ["Identify audience needs", "Engage listeners throughout", "Adapt to audience feedback"], minMinutes: 5, maxMinutes: 7 },
        ],
      },
      {
        level: 3, name: "Increasing Knowledge",
        projects: [
          { name: "Negotiate the Best Outcome", objectives: ["Understand negotiation principles", "Present a persuasive position", "Demonstrate flexibility"], minMinutes: 5, maxMinutes: 7 },
          { name: "Active Listening", objectives: ["Demonstrate active listening", "Summarize key points", "Ask clarifying questions"], minMinutes: 5, maxMinutes: 7 },
          { name: "Motivate Others", objectives: ["Inspire action", "Share a compelling vision", "Connect emotionally with audience"], minMinutes: 5, maxMinutes: 7 },
        ],
      },
      {
        level: 4, name: "Building Skills",
        projects: [
          { name: "Manage Change", objectives: ["Explain the need for change", "Present a change plan", "Address resistance constructively"], minMinutes: 5, maxMinutes: 7 },
          { name: "Manage Online Meetings", objectives: ["Plan an online meeting", "Facilitate discussion", "Keep participants engaged"], minMinutes: 20, maxMinutes: 25 },
        ],
      },
      {
        level: 5, name: "Demonstrating Expertise",
        projects: [
          { name: "Lead in Any Situation", objectives: ["Demonstrate adaptable leadership", "Handle unexpected challenges", "Inspire confidence in others"], minMinutes: 5, maxMinutes: 7 },
          { name: "High Performance Leadership", objectives: ["Complete a leadership project", "Apply leadership skills", "Reflect on outcomes"], minMinutes: 5, maxMinutes: 7 },
        ],
      },
    ],
  },
  {
    name: "Effective Coaching",
    levels: [
      {
        level: 1, name: "Mastering Fundamentals",
        projects: [
          { name: "Ice Breaker", objectives: ["Introduce yourself", "Organize a speech", "Present a clear message"], minMinutes: 4, maxMinutes: 6 },
          { name: "Writing a Speech with Purpose", objectives: ["Write a well-organized speech", "Use clear and vivid language", "Deliver with confidence"], minMinutes: 5, maxMinutes: 7 },
          { name: "Introduction to Vocal Variety", objectives: ["Use vocal variety to enhance message", "Vary pitch, pace, and volume", "Engage audience through delivery"], minMinutes: 5, maxMinutes: 7 },
        ],
      },
      {
        level: 2, name: "Learning Your Style",
        projects: [
          { name: "Understanding Your Communication Style", objectives: ["Identify your communication style", "Adapt to different audiences", "Improve interpersonal effectiveness"], minMinutes: 5, maxMinutes: 7 },
          { name: "Coaching a Peer", objectives: ["Provide constructive feedback", "Guide improvement", "Build trust through communication"], minMinutes: 5, maxMinutes: 7 },
        ],
      },
      {
        level: 3, name: "Increasing Knowledge",
        projects: [
          { name: "Reaching Consensus", objectives: ["Facilitate group discussion", "Build consensus", "Manage differing opinions"], minMinutes: 5, maxMinutes: 7 },
          { name: "Improvement Through Positive Coaching", objectives: ["Apply positive coaching techniques", "Motivate through encouragement", "Track progress"], minMinutes: 5, maxMinutes: 7 },
        ],
      },
      {
        level: 4, name: "Building Skills",
        projects: [
          { name: "Mentoring", objectives: ["Establish a mentoring relationship", "Set development goals", "Support growth"], minMinutes: 5, maxMinutes: 7 },
          { name: "Prepare to Speak Professionally", objectives: ["Develop professional speaking skills", "Handle Q&A sessions", "Project credibility"], minMinutes: 18, maxMinutes: 22 },
        ],
      },
      {
        level: 5, name: "Demonstrating Expertise",
        projects: [
          { name: "High Performance Leadership", objectives: ["Lead a significant project", "Apply coaching principles", "Demonstrate measurable results"], minMinutes: 5, maxMinutes: 7 },
          { name: "Reflect on Your Path", objectives: ["Review your speaking journey", "Identify key learnings", "Share insights with others"], minMinutes: 10, maxMinutes: 12 },
        ],
      },
    ],
  },
  {
    name: "Innovative Planning",
    levels: [
      {
        level: 1, name: "Mastering Fundamentals",
        projects: [
          { name: "Ice Breaker", objectives: ["Introduce yourself", "Organize a speech", "Present a clear message"], minMinutes: 4, maxMinutes: 6 },
          { name: "Evaluation and Feedback", objectives: ["Deliver a speech", "Receive constructive feedback", "Apply feedback to improve"], minMinutes: 5, maxMinutes: 7 },
          { name: "Researching and Presenting", objectives: ["Research a topic thoroughly", "Present data clearly", "Support claims with evidence"], minMinutes: 5, maxMinutes: 7 },
        ],
      },
      {
        level: 2, name: "Learning Your Style",
        projects: [
          { name: "Understanding Your Communication Style", objectives: ["Assess your communication strengths", "Identify growth areas", "Develop a plan to improve"], minMinutes: 5, maxMinutes: 7 },
          { name: "Connect with Storytelling", objectives: ["Use personal stories effectively", "Create emotional connection", "Structure narrative for impact"], minMinutes: 5, maxMinutes: 7 },
        ],
      },
      {
        level: 3, name: "Increasing Knowledge",
        projects: [
          { name: "Project Management", objectives: ["Plan a project from start to finish", "Identify risks and mitigations", "Present project plan clearly"], minMinutes: 5, maxMinutes: 7 },
          { name: "Create a Podcast", objectives: ["Plan podcast content", "Record and edit audio", "Present your podcast concept"], minMinutes: 2, maxMinutes: 3 },
          { name: "Building a Social Media Presence", objectives: ["Develop a social media strategy", "Create engaging content", "Present your approach"], minMinutes: 5, maxMinutes: 7 },
        ],
      },
      {
        level: 4, name: "Building Skills",
        projects: [
          { name: "Manage Projects Successfully", objectives: ["Execute a real project", "Track milestones", "Report on outcomes"], minMinutes: 5, maxMinutes: 7 },
          { name: "Public Relations Strategies", objectives: ["Craft a PR message", "Handle media interactions", "Build public trust"], minMinutes: 5, maxMinutes: 7 },
        ],
      },
      {
        level: 5, name: "Demonstrating Expertise",
        projects: [
          { name: "High Performance Leadership", objectives: ["Lead a complex initiative", "Demonstrate innovative thinking", "Achieve measurable impact"], minMinutes: 5, maxMinutes: 7 },
          { name: "Reflect on Your Path", objectives: ["Summarize key achievements", "Share lessons learned", "Inspire others to grow"], minMinutes: 10, maxMinutes: 12 },
        ],
      },
    ],
  },
  {
    name: "Leadership Development",
    levels: [
      {
        level: 1, name: "Mastering Fundamentals",
        projects: [
          { name: "Ice Breaker", objectives: ["Introduce yourself", "Organize a speech", "Present a clear message"], minMinutes: 4, maxMinutes: 6 },
          { name: "Writing a Speech with Purpose", objectives: ["Craft a clear message", "Use purposeful language", "Engage your audience"], minMinutes: 5, maxMinutes: 7 },
          { name: "Introduction to Vocal Variety", objectives: ["Use vocal variety effectively", "Control pace and volume", "Enhance delivery"], minMinutes: 5, maxMinutes: 7 },
        ],
      },
      {
        level: 2, name: "Learning Your Style",
        projects: [
          { name: "Understanding Your Leadership Style", objectives: ["Assess leadership strengths", "Identify development areas", "Create an action plan"], minMinutes: 5, maxMinutes: 7 },
          { name: "Mentoring", objectives: ["Build a mentoring relationship", "Guide another's development", "Reflect on mentoring experience"], minMinutes: 5, maxMinutes: 7 },
        ],
      },
      {
        level: 3, name: "Increasing Knowledge",
        projects: [
          { name: "Planning and Implementing", objectives: ["Create a detailed plan", "Execute with precision", "Evaluate results"], minMinutes: 5, maxMinutes: 7 },
          { name: "Persuasive Speaking", objectives: ["Build a logical argument", "Use emotional appeals", "Call audience to action"], minMinutes: 5, maxMinutes: 7 },
          { name: "Inspire Your Audience", objectives: ["Share a compelling vision", "Connect with emotion", "Motivate action"], minMinutes: 5, maxMinutes: 7 },
        ],
      },
      {
        level: 4, name: "Building Skills",
        projects: [
          { name: "Leading in Your Volunteer Organization", objectives: ["Take on a leadership role", "Manage team dynamics", "Achieve team goals"], minMinutes: 5, maxMinutes: 7 },
          { name: "Manage Successful Events", objectives: ["Plan an event", "Coordinate logistics", "Execute successfully"], minMinutes: 5, maxMinutes: 7 },
        ],
      },
      {
        level: 5, name: "Demonstrating Expertise",
        projects: [
          { name: "High Performance Leadership", objectives: ["Lead a major project", "Demonstrate strategic thinking", "Produce lasting results"], minMinutes: 5, maxMinutes: 7 },
          { name: "Reflect on Your Path", objectives: ["Review your journey", "Celebrate growth", "Set future goals"], minMinutes: 10, maxMinutes: 12 },
        ],
      },
    ],
  },
  {
    name: "Motivational Strategies",
    levels: [
      {
        level: 1, name: "Mastering Fundamentals",
        projects: [
          { name: "Ice Breaker", objectives: ["Introduce yourself", "Organize a speech", "Present a clear message"], minMinutes: 4, maxMinutes: 6 },
          { name: "Evaluation and Feedback", objectives: ["Deliver a speech", "Apply feedback", "Demonstrate improvement"], minMinutes: 5, maxMinutes: 7 },
          { name: "Researching and Presenting", objectives: ["Research effectively", "Organize findings", "Present with clarity"], minMinutes: 5, maxMinutes: 7 },
        ],
      },
      {
        level: 2, name: "Learning Your Style",
        projects: [
          { name: "Understanding Motivational Strategies", objectives: ["Identify what motivates people", "Apply motivational techniques", "Inspire through communication"], minMinutes: 5, maxMinutes: 7 },
          { name: "Connect with Your Audience", objectives: ["Read audience cues", "Adjust your approach", "Build rapport"], minMinutes: 5, maxMinutes: 7 },
        ],
      },
      {
        level: 3, name: "Increasing Knowledge",
        projects: [
          { name: "Motivate Others", objectives: ["Understand intrinsic motivation", "Use storytelling to inspire", "Create lasting impact"], minMinutes: 5, maxMinutes: 7 },
          { name: "Active Listening", objectives: ["Practice deep listening", "Respond empathetically", "Build stronger connections"], minMinutes: 5, maxMinutes: 7 },
        ],
      },
      {
        level: 4, name: "Building Skills",
        projects: [
          { name: "Building a Team", objectives: ["Form an effective team", "Assign roles strategically", "Achieve collective goals"], minMinutes: 5, maxMinutes: 7 },
          { name: "Manage Online Meetings", objectives: ["Facilitate virtual engagement", "Use technology effectively", "Keep participants focused"], minMinutes: 20, maxMinutes: 25 },
        ],
      },
      {
        level: 5, name: "Demonstrating Expertise",
        projects: [
          { name: "High Performance Leadership", objectives: ["Lead a motivational initiative", "Measure team engagement", "Produce positive outcomes"], minMinutes: 5, maxMinutes: 7 },
          { name: "Reflect on Your Path", objectives: ["Assess your growth", "Share motivational insights", "Encourage others"], minMinutes: 10, maxMinutes: 12 },
        ],
      },
    ],
  },
  {
    name: "Persuasive Influence",
    levels: [
      {
        level: 1, name: "Mastering Fundamentals",
        projects: [
          { name: "Ice Breaker", objectives: ["Introduce yourself", "Organize a speech", "Present a clear message"], minMinutes: 4, maxMinutes: 6 },
          { name: "Writing a Speech with Purpose", objectives: ["Develop a central theme", "Use persuasive language", "End with a call to action"], minMinutes: 5, maxMinutes: 7 },
          { name: "Introduction to Vocal Variety", objectives: ["Enhance delivery with vocal variety", "Use pauses effectively", "Control vocal energy"], minMinutes: 5, maxMinutes: 7 },
        ],
      },
      {
        level: 2, name: "Learning Your Style",
        projects: [
          { name: "Understanding Your Communication Style", objectives: ["Identify persuasive strengths", "Adapt style for influence", "Develop authentic voice"], minMinutes: 5, maxMinutes: 7 },
          { name: "Active Listening", objectives: ["Listen to understand", "Ask powerful questions", "Respond thoughtfully"], minMinutes: 5, maxMinutes: 7 },
        ],
      },
      {
        level: 3, name: "Increasing Knowledge",
        projects: [
          { name: "Persuasive Speaking", objectives: ["Construct logical arguments", "Appeal to emotions", "Overcome objections"], minMinutes: 5, maxMinutes: 7 },
          { name: "Building a Social Media Presence", objectives: ["Craft persuasive online content", "Engage followers", "Build influence digitally"], minMinutes: 5, maxMinutes: 7 },
          { name: "Negotiate the Best Outcome", objectives: ["Prepare for negotiation", "Find common ground", "Achieve win-win results"], minMinutes: 5, maxMinutes: 7 },
        ],
      },
      {
        level: 4, name: "Building Skills",
        projects: [
          { name: "Leading in Difficult Situations", objectives: ["Navigate conflict", "Maintain composure", "Find resolution"], minMinutes: 5, maxMinutes: 7 },
          { name: "Prepare to Speak Professionally", objectives: ["Polish professional delivery", "Handle tough questions", "Command the room"], minMinutes: 18, maxMinutes: 22 },
        ],
      },
      {
        level: 5, name: "Demonstrating Expertise",
        projects: [
          { name: "High Performance Leadership", objectives: ["Lead through influence", "Drive organizational change", "Demonstrate persuasive mastery"], minMinutes: 5, maxMinutes: 7 },
          { name: "Reflect on Your Path", objectives: ["Review persuasive growth", "Share key strategies", "Inspire future speakers"], minMinutes: 10, maxMinutes: 12 },
        ],
      },
    ],
  },
  {
    name: "Presentation Mastery",
    levels: [
      {
        level: 1, name: "Mastering Fundamentals",
        projects: [
          { name: "Ice Breaker", objectives: ["Introduce yourself to the club", "Organize a speech about yourself", "Present a clear personal message"], minMinutes: 4, maxMinutes: 6 },
          { name: "Writing a Speech with Purpose", objectives: ["Select a specific purpose", "Organize your speech clearly", "Use appropriate language for your audience"], minMinutes: 5, maxMinutes: 7 },
          { name: "Introduction to Vocal Variety", objectives: ["Use pitch, pace, and power", "Enhance meaning through vocal delivery", "Practice vocal warm-up techniques"], minMinutes: 5, maxMinutes: 7 },
        ],
      },
      {
        level: 2, name: "Learning Your Style",
        projects: [
          { name: "Understanding Your Communication Style", objectives: ["Identify your natural style", "Recognize how others perceive you", "Adjust your approach for impact"], minMinutes: 5, maxMinutes: 7 },
          { name: "Connect with Storytelling", objectives: ["Incorporate personal stories", "Build emotional connection", "Use story structure effectively"], minMinutes: 5, maxMinutes: 7 },
        ],
      },
      {
        level: 3, name: "Increasing Knowledge",
        projects: [
          { name: "Persuasive Speaking", objectives: ["Present a strong position", "Support with evidence", "Compel audience to act"], minMinutes: 5, maxMinutes: 7 },
          { name: "Using Presentation Software", objectives: ["Design effective slides", "Integrate visuals with speech", "Avoid common presentation pitfalls"], minMinutes: 5, maxMinutes: 7 },
          { name: "Using Body Language", objectives: ["Use gestures purposefully", "Move with intention on stage", "Convey confidence nonverbally"], minMinutes: 5, maxMinutes: 7 },
        ],
      },
      {
        level: 4, name: "Building Skills",
        projects: [
          { name: "Managing a Difficult Audience", objectives: ["Handle disruptions gracefully", "Redirect attention", "Maintain authority and composure"], minMinutes: 5, maxMinutes: 7 },
          { name: "Prepare to Speak Professionally", objectives: ["Develop a keynote-quality speech", "Rehearse thoroughly", "Deliver with polish and confidence"], minMinutes: 18, maxMinutes: 22 },
        ],
      },
      {
        level: 5, name: "Demonstrating Expertise",
        projects: [
          { name: "High Performance Leadership", objectives: ["Lead a speaking-related project", "Mentor others in presentation skills", "Demonstrate mastery of all techniques"], minMinutes: 5, maxMinutes: 7 },
          { name: "Reflect on Your Path", objectives: ["Review your presentation journey", "Identify signature techniques", "Deliver a capstone speech"], minMinutes: 10, maxMinutes: 12 },
        ],
      },
    ],
  },
  {
    name: "Strategic Relationships",
    levels: [
      {
        level: 1, name: "Mastering Fundamentals",
        projects: [
          { name: "Ice Breaker", objectives: ["Introduce yourself", "Organize a speech", "Present a clear message"], minMinutes: 4, maxMinutes: 6 },
          { name: "Evaluation and Feedback", objectives: ["Give and receive feedback", "Apply constructive criticism", "Grow through evaluation"], minMinutes: 5, maxMinutes: 7 },
          { name: "Researching and Presenting", objectives: ["Research thoroughly", "Present data effectively", "Cite sources properly"], minMinutes: 5, maxMinutes: 7 },
        ],
      },
      {
        level: 2, name: "Learning Your Style",
        projects: [
          { name: "Understanding Your Communication Style", objectives: ["Assess interpersonal skills", "Identify relationship patterns", "Develop connection strategies"], minMinutes: 5, maxMinutes: 7 },
          { name: "Connect with Your Audience", objectives: ["Build immediate rapport", "Read social cues", "Adapt communication style"], minMinutes: 5, maxMinutes: 7 },
        ],
      },
      {
        level: 3, name: "Increasing Knowledge",
        projects: [
          { name: "Networking", objectives: ["Develop networking skills", "Create meaningful connections", "Follow up effectively"], minMinutes: 5, maxMinutes: 7 },
          { name: "Reaching Consensus", objectives: ["Navigate diverse viewpoints", "Build agreement", "Maintain relationships through disagreement"], minMinutes: 5, maxMinutes: 7 },
        ],
      },
      {
        level: 4, name: "Building Skills",
        projects: [
          { name: "Mentoring", objectives: ["Guide another's development", "Share experience generously", "Build lasting mentoring bonds"], minMinutes: 5, maxMinutes: 7 },
          { name: "Leading in Difficult Situations", objectives: ["Handle interpersonal conflict", "Maintain trust", "Emerge with stronger relationships"], minMinutes: 5, maxMinutes: 7 },
        ],
      },
      {
        level: 5, name: "Demonstrating Expertise",
        projects: [
          { name: "High Performance Leadership", objectives: ["Build and lead a high-performing team", "Leverage strategic relationships", "Create collaborative success"], minMinutes: 5, maxMinutes: 7 },
          { name: "Reflect on Your Path", objectives: ["Review relationship growth", "Celebrate partnerships", "Share networking wisdom"], minMinutes: 10, maxMinutes: 12 },
        ],
      },
    ],
  },
  {
    name: "Team Collaboration",
    levels: [
      {
        level: 1, name: "Mastering Fundamentals",
        projects: [
          { name: "Ice Breaker", objectives: ["Introduce yourself", "Organize a speech", "Present a clear message"], minMinutes: 4, maxMinutes: 6 },
          { name: "Evaluation and Feedback", objectives: ["Provide team-oriented feedback", "Support peer growth", "Improve through collaboration"], minMinutes: 5, maxMinutes: 7 },
          { name: "Researching and Presenting", objectives: ["Conduct group research", "Synthesize team findings", "Present as a unified voice"], minMinutes: 5, maxMinutes: 7 },
        ],
      },
      {
        level: 2, name: "Learning Your Style",
        projects: [
          { name: "Understanding Your Communication Style", objectives: ["Recognize team dynamics", "Adapt to group communication", "Strengthen collaboration skills"], minMinutes: 5, maxMinutes: 7 },
          { name: "Active Listening", objectives: ["Listen without judgment", "Validate team members' ideas", "Build psychological safety"], minMinutes: 5, maxMinutes: 7 },
        ],
      },
      {
        level: 3, name: "Increasing Knowledge",
        projects: [
          { name: "Reaching Consensus", objectives: ["Facilitate team decisions", "Honor diverse perspectives", "Achieve group alignment"], minMinutes: 5, maxMinutes: 7 },
          { name: "Motivate Others", objectives: ["Energize team members", "Recognize contributions", "Foster team spirit"], minMinutes: 5, maxMinutes: 7 },
          { name: "Collaborate on a Team Project", objectives: ["Plan collaboratively", "Assign roles effectively", "Deliver as a team"], minMinutes: 5, maxMinutes: 7 },
        ],
      },
      {
        level: 4, name: "Building Skills",
        projects: [
          { name: "Building a Team", objectives: ["Recruit and onboard members", "Create team norms", "Drive collective accountability"], minMinutes: 5, maxMinutes: 7 },
          { name: "Manage Online Meetings", objectives: ["Run effective virtual meetings", "Engage remote participants", "Use collaboration tools"], minMinutes: 20, maxMinutes: 25 },
        ],
      },
      {
        level: 5, name: "Demonstrating Expertise",
        projects: [
          { name: "High Performance Leadership", objectives: ["Lead a team-based project", "Maximize team potential", "Celebrate collective achievement"], minMinutes: 5, maxMinutes: 7 },
          { name: "Reflect on Your Path", objectives: ["Review team experiences", "Share collaboration lessons", "Inspire future teams"], minMinutes: 10, maxMinutes: 12 },
        ],
      },
    ],
  },
  {
    name: "Visionary Communication",
    levels: [
      {
        level: 1, name: "Mastering Fundamentals",
        projects: [
          { name: "Ice Breaker", objectives: ["Introduce yourself", "Organize a speech", "Present a clear message"], minMinutes: 4, maxMinutes: 6 },
          { name: "Writing a Speech with Purpose", objectives: ["Define a visionary message", "Structure for impact", "Use vivid language"], minMinutes: 5, maxMinutes: 7 },
          { name: "Introduction to Vocal Variety", objectives: ["Command attention with voice", "Use dramatic pauses", "Vary energy levels"], minMinutes: 5, maxMinutes: 7 },
        ],
      },
      {
        level: 2, name: "Learning Your Style",
        projects: [
          { name: "Understanding Your Communication Style", objectives: ["Discover your visionary voice", "Identify inspiring qualities", "Develop authentic presence"], minMinutes: 5, maxMinutes: 7 },
          { name: "Connect with Storytelling", objectives: ["Paint a picture with words", "Share transformative stories", "Inspire through narrative"], minMinutes: 5, maxMinutes: 7 },
        ],
      },
      {
        level: 3, name: "Increasing Knowledge",
        projects: [
          { name: "Inspire Your Audience", objectives: ["Cast a compelling vision", "Rally people around a cause", "Create lasting inspiration"], minMinutes: 5, maxMinutes: 7 },
          { name: "Persuasive Speaking", objectives: ["Combine vision with persuasion", "Build irresistible arguments", "Move people to action"], minMinutes: 5, maxMinutes: 7 },
          { name: "Using Body Language", objectives: ["Project confidence physically", "Use space commandingly", "Align body with message"], minMinutes: 5, maxMinutes: 7 },
        ],
      },
      {
        level: 4, name: "Building Skills",
        projects: [
          { name: "Communicate Change", objectives: ["Articulate need for change", "Paint the future state", "Address fears and concerns"], minMinutes: 5, maxMinutes: 7 },
          { name: "Prepare to Speak Professionally", objectives: ["Craft a signature talk", "Develop stage presence", "Deliver a visionary keynote"], minMinutes: 18, maxMinutes: 22 },
        ],
      },
      {
        level: 5, name: "Demonstrating Expertise",
        projects: [
          { name: "High Performance Leadership", objectives: ["Lead a visionary initiative", "Communicate a bold vision", "Demonstrate transformative leadership"], minMinutes: 5, maxMinutes: 7 },
          { name: "Reflect on Your Path", objectives: ["Share your communication evolution", "Articulate your vision for the future", "Deliver an inspiring capstone"], minMinutes: 10, maxMinutes: 12 },
        ],
      },
    ],
  },
];

export function getPathwayNames(): string[] {
  return PATHWAYS.map(p => p.name);
}

export function getPathway(name: string): Pathway | undefined {
  return PATHWAYS.find(p => p.name === name);
}

export function getLevelsForPathway(pathwayName: string): PathwayLevel[] {
  return getPathway(pathwayName)?.levels ?? [];
}

export function getProjectsForLevel(pathwayName: string, levelNumber: number): PathwayProject[] {
  const pathway = getPathway(pathwayName);
  if (!pathway) return [];
  const level = pathway.levels.find(l => l.level === levelNumber);
  return level?.projects ?? [];
}
