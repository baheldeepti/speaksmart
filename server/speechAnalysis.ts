import { openai } from "./replit_integrations/audio/client";
import { ensureCompatibleFormat, speechToText } from "./replit_integrations/audio/client";
import fs from "fs";
import { Buffer } from "node:buffer";

export interface SpeechEvaluationResult {
  transcript: string;
  fillerWordCount: number;
  speechPaceWPM: number;
  clarityScore: number;
  structureScore: number;
  confidenceScore: number;
  engagementScore: number;
  overallScore: number;
  aiFeedback: string;
  rubric: {
    metrics: {
      name: string;
      score: number;
      maxScore: number;
      label: string;
      feedback: string;
    }[];
    strengths: string[];
    improvementAreas: string[];
  };
}

export interface RoleEvaluationResult {
  overallScore: number;
  feedback: string;
  metrics: {
    name: string;
    score: number;
    maxScore: number;
    label: string;
    feedback: string;
  }[];
}

export async function transcribeAndAnalyze(
  audioFilePath: string,
  durationSeconds: number,
  role: string,
  prompt?: string,
  pathwaysProject?: { name: string; objectives: string[]; timeMin: number; timeMax: number }
): Promise<SpeechEvaluationResult> {
  const audioBuffer = fs.readFileSync(audioFilePath);
  const { buffer: compatibleBuffer, format } = await ensureCompatibleFormat(Buffer.from(audioBuffer));

  const transcript = await speechToText(compatibleBuffer, format);

  const wordCount = transcript.split(/\s+/).filter(w => w.length > 0).length;
  const minutes = durationSeconds / 60;
  const speechPaceWPM = minutes > 0 ? Math.round(wordCount / minutes) : 0;

  const fillerWords = ["um", "uh", "ah", "like", "you know", "so", "basically", "actually", "literally", "right"];
  const lowerTranscript = transcript.toLowerCase();
  let fillerWordCount = 0;
  for (const filler of fillerWords) {
    const regex = new RegExp(`\\b${filler}\\b`, "gi");
    const matches = lowerTranscript.match(regex);
    if (matches) fillerWordCount += matches.length;
  }

  let pathwaysContext = "";
  if (pathwaysProject) {
    pathwaysContext = `\n\nThis speech is for a Toastmasters Pathways project: "${pathwaysProject.name}"
Project objectives: ${pathwaysProject.objectives.join(", ")}
Expected time: ${pathwaysProject.timeMin}-${pathwaysProject.timeMax} minutes
Please evaluate specifically against these project objectives.`;
  }

  let promptContext = "";
  if (prompt && role === "table_topics") {
    promptContext = `\nThe impromptu topic given was: "${prompt}"`;
  }

  const analysisPrompt = `You are an experienced Toastmasters speech evaluator giving an oral evaluation at a club meeting. You follow the Toastmasters evaluation method: lead with genuine encouragement, provide specific commendations, then offer 1-2 constructive suggestions framed as growth opportunities — never as criticisms. Your tone is warm, supportive, and mentor-like, as if speaking directly to the speaker.

Speech transcript: "${transcript}"

Role: ${role === "table_topics" ? "Table Topics (impromptu speech, 1-2 minutes)" : "Prepared Speech (5-7 minutes)"}
Duration: ${durationSeconds} seconds (${Math.floor(durationSeconds / 60)}m ${durationSeconds % 60}s)
Word count: ${wordCount}
Words per minute: ${speechPaceWPM}
Filler words detected: ${fillerWordCount}${promptContext}${pathwaysContext}

Evaluate using the Toastmasters Competent Communicator criteria (score each 1-10):
1. Clarity of Ideas — Were the main points clear and easy to follow? Did the speaker stay on topic?
2. Speech Organization — Opening that grabbed attention, body with logical flow, conclusion with a memorable close or call to action?
3. Vocal Variety & Delivery — Pace, pitch, volume changes, purposeful pauses? Did the voice convey emotion and emphasis?
4. Audience Connection — Did the speaker use stories, humor, rhetorical questions, or direct address to engage the audience?

For each criterion, write feedback the way a Toastmasters evaluator would say it out loud — personal, specific, referencing exact phrases or moments from the speech. Use "you" voice (e.g., "When you said '...', it really drew me in").

For the overall feedback, write it as a Toastmasters oral evaluation — 3-5 sentences using the sandwich method:
1. Start with a genuine compliment about what the speaker did well
2. Offer 1-2 specific, actionable suggestions framed positively ("Next time, you might try..." or "One thing that could take this to the next level...")
3. End with encouragement and something to look forward to

For strengths, identify 2-3 specific things the speaker did well, quoting exact phrases or describing specific moments.
For improvement areas, frame each as a positive growth opportunity with a specific technique to try.

Respond in this exact JSON format:
{
  "clarityScore": <number 1-10>,
  "structureScore": <number 1-10>,
  "confidenceScore": <number 1-10>,
  "engagementScore": <number 1-10>,
  "overallScore": <number 1-100>,
  "clarityFeedback": "<specific Toastmasters-style feedback using 'you' voice>",
  "structureFeedback": "<specific Toastmasters-style feedback using 'you' voice>",
  "confidenceFeedback": "<specific Toastmasters-style feedback using 'you' voice>",
  "engagementFeedback": "<specific Toastmasters-style feedback using 'you' voice>",
  "overallFeedback": "<3-5 sentence Toastmasters oral evaluation using sandwich method>",
  "strengths": ["<specific strength with quote or moment reference>", "<specific strength>"],
  "improvementAreas": ["<growth opportunity framed positively with technique to try>", "<growth opportunity>"]
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: analysisPrompt }],
    response_format: { type: "json_object" },
    max_tokens: 1500,
  });

  let analysis: any;
  try {
    analysis = JSON.parse(response.choices[0]?.message?.content || "{}");
  } catch {
    analysis = {
      clarityScore: 5,
      structureScore: 5,
      confidenceScore: 5,
      engagementScore: 5,
      overallScore: 50,
      clarityFeedback: "Unable to fully analyze speech.",
      structureFeedback: "Try to organize your speech with a clear beginning, middle, and end.",
      confidenceFeedback: "Practice will help build vocal confidence.",
      engagementFeedback: "Consider adding stories or examples to engage your audience.",
      overallFeedback: "Keep practicing! Each speech is an opportunity to improve.",
    };
  }

  return {
    transcript,
    fillerWordCount,
    speechPaceWPM,
    clarityScore: Math.min(10, Math.max(1, analysis.clarityScore || 5)),
    structureScore: Math.min(10, Math.max(1, analysis.structureScore || 5)),
    confidenceScore: Math.min(10, Math.max(1, analysis.confidenceScore || 5)),
    engagementScore: Math.min(10, Math.max(1, analysis.engagementScore || 5)),
    overallScore: Math.min(100, Math.max(1, analysis.overallScore || 50)),
    aiFeedback: analysis.overallFeedback || "Keep practicing to improve!",
    rubric: {
      metrics: [
        {
          name: "clarity",
          score: analysis.clarityScore || 5,
          maxScore: 10,
          label: "Clarity of Ideas",
          feedback: analysis.clarityFeedback || "",
        },
        {
          name: "structure",
          score: analysis.structureScore || 5,
          maxScore: 10,
          label: "Speech Organization",
          feedback: analysis.structureFeedback || "",
        },
        {
          name: "confidence",
          score: analysis.confidenceScore || 5,
          maxScore: 10,
          label: "Vocal Variety & Delivery",
          feedback: analysis.confidenceFeedback || "",
        },
        {
          name: "engagement",
          score: analysis.engagementScore || 5,
          maxScore: 10,
          label: "Audience Connection",
          feedback: analysis.engagementFeedback || "",
        },
        {
          name: "fillerWords",
          score: Math.max(1, 10 - fillerWordCount),
          maxScore: 10,
          label: "Filler Word Control",
          feedback: fillerWordCount === 0
            ? "Excellent! No filler words detected."
            : `${fillerWordCount} filler word${fillerWordCount > 1 ? "s" : ""} detected. Try pausing instead of using fillers.`,
        },
        {
          name: "pace",
          score: speechPaceWPM >= 120 && speechPaceWPM <= 160 ? 9 :
                 speechPaceWPM >= 100 && speechPaceWPM <= 180 ? 7 :
                 speechPaceWPM >= 80 && speechPaceWPM <= 200 ? 5 : 3,
          maxScore: 10,
          label: "Speaking Pace",
          feedback: speechPaceWPM < 100
            ? `${speechPaceWPM} WPM — consider speaking a bit faster to maintain energy.`
            : speechPaceWPM > 180
            ? `${speechPaceWPM} WPM — try slowing down and adding pauses for emphasis.`
            : `${speechPaceWPM} WPM — good conversational pace.`,
        },
      ],
      strengths: Array.isArray(analysis.strengths) ? analysis.strengths : [],
      improvementAreas: Array.isArray(analysis.improvementAreas) ? analysis.improvementAreas : [],
    },
  };
}

export function evaluateTimerRole(metrics: {
  totalDuration: number;
  timerStartDelay: number;
  numberOfStops: number;
  greenSignaled: boolean;
  yellowSignaled: boolean;
  redSignaled: boolean;
  accuracyPercent: number;
}): RoleEvaluationResult {
  const accuracyScore = Math.min(10, Math.round(metrics.accuracyPercent / 10));
  const responseScore = metrics.timerStartDelay < 3 ? 9 : metrics.timerStartDelay < 5 ? 7 : metrics.timerStartDelay < 10 ? 5 : 3;
  const signalCount = [metrics.greenSignaled, metrics.yellowSignaled, metrics.redSignaled].filter(Boolean).length;
  const signalScore = signalCount === 3 ? 10 : signalCount === 2 ? 7 : signalCount === 1 ? 4 : 2;
  const consistencyScore = metrics.numberOfStops <= 1 ? 9 : metrics.numberOfStops <= 3 ? 7 : 5;

  const overallScore = Math.round((accuracyScore + responseScore + signalScore + consistencyScore) / 4 * 10);

  const feedbackParts: string[] = [];
  if (accuracyScore >= 8) feedbackParts.push("Fellow Toastmaster, you did an outstanding job as Timer today. Your timing was spot-on, and the speaker could rely on you completely — that's exactly the kind of dependable support our club needs.");
  else if (accuracyScore >= 5) feedbackParts.push("Thank you for stepping into the Timer role today. You showed good awareness of the clock, and with a bit more practice, you'll develop that instinctive sense of timing that experienced Timers have. Next time, try keeping your eyes on the clock even during the most engaging parts of the speech.");
  else feedbackParts.push("I appreciate you taking on the Timer role — it's one that requires constant focus, and every session you practice it makes you sharper. One technique that helps is to mentally mark each 30-second interval as it passes, so you always know roughly where the speaker stands.");

  if (signalCount === 3) feedbackParts.push("I particularly want to commend you for signaling all three color zones — green, yellow, and red. That gave the speaker a clear roadmap of their remaining time, which is exactly what great Timers do.");
  else if (signalCount >= 1) feedbackParts.push(`You signaled ${signalCount} out of 3 color zones. Next time, try to catch all three thresholds — when a speaker sees green, then yellow, then red, it gives them the confidence to pace their conclusion perfectly.`);
  else feedbackParts.push("One area to focus on next time is the color signals. The green, yellow, and red signals are your primary tools as Timer — they're how you communicate with the speaker without interrupting. Try setting a quiet reminder for yourself at each threshold.");

  if (metrics.numberOfStops > 2) feedbackParts.push(`I noticed you stopped the timer ${metrics.numberOfStops} times during the speech. That's completely normal when you're getting comfortable with the role. As you gain experience, you'll find it easier to let the timer run continuously, which gives you the most accurate reading.`);

  return {
    overallScore,
    feedback: feedbackParts.join("\n\n"),
    metrics: [
      { name: "accuracy", score: accuracyScore, maxScore: 10, label: "Timing Accuracy", feedback: `${metrics.accuracyPercent}% accuracy in time tracking. ${accuracyScore >= 8 ? "Precise and reliable." : "Aim for consistent, uninterrupted tracking."}` },
      { name: "response", score: responseScore, maxScore: 10, label: "Response Speed", feedback: `${metrics.timerStartDelay}s delay before starting. ${responseScore >= 8 ? "Quick response — the speaker knew you were ready." : "Try to start the timer within 2-3 seconds of the speaker beginning."}` },
      { name: "signals", score: signalScore, maxScore: 10, label: "Signal Awareness", feedback: `${signalCount}/3 color signals triggered. ${signalScore >= 8 ? "All zones covered — excellent awareness." : "Practice watching for all three time thresholds."}` },
      { name: "consistency", score: consistencyScore, maxScore: 10, label: "Consistency", feedback: `${metrics.numberOfStops} timer stop${metrics.numberOfStops !== 1 ? "s" : ""}. ${consistencyScore >= 8 ? "Smooth, uninterrupted timing." : "Minimize stops for more reliable time tracking."}` },
    ],
  };
}

export function evaluateEvaluatorRole(metrics: {
  checklistTotal: number;
  checklistChecked: number;
  timeSpentSeconds: number;
  positiveCount: number;
  constructiveCount: number;
}): RoleEvaluationResult {
  const completionPercent = metrics.checklistTotal > 0 ? Math.round((metrics.checklistChecked / metrics.checklistTotal) * 100) : 0;
  const thoroughnessScore = Math.min(10, Math.round(completionPercent / 10));

  const total = metrics.positiveCount + metrics.constructiveCount;
  const balanceRatio = total > 0 ? Math.min(metrics.positiveCount, metrics.constructiveCount) / Math.max(metrics.positiveCount, metrics.constructiveCount) : 0;
  const balanceScore = Math.min(10, Math.round(balanceRatio * 10));

  const detailScore = metrics.checklistChecked >= 8 ? 10 : metrics.checklistChecked >= 6 ? 8 : metrics.checklistChecked >= 4 ? 6 : metrics.checklistChecked >= 2 ? 4 : 2;

  const engagementScore = metrics.timeSpentSeconds >= 120 ? 9 : metrics.timeSpentSeconds >= 60 ? 7 : metrics.timeSpentSeconds >= 30 ? 5 : 3;

  const overallScore = Math.round((thoroughnessScore + balanceScore + detailScore + engagementScore) / 4 * 10);

  const feedbackParts: string[] = [];
  if (thoroughnessScore >= 8) feedbackParts.push(`Fellow Toastmaster, you delivered a thorough evaluation today — you assessed ${completionPercent}% of the checklist criteria, which shows you were truly paying attention to the speaker's performance from start to finish. That kind of careful observation is what makes evaluations genuinely helpful.`);
  else if (thoroughnessScore >= 5) feedbackParts.push(`Thank you for your evaluation today. You covered ${completionPercent}% of the checklist, which is a solid foundation. To take your evaluations to the next level, try jotting a quick note for each criterion as the speech unfolds — even a single word can help you remember specific moments when it's time to give your evaluation.`);
  else feedbackParts.push(`I appreciate you taking on the Evaluator role today — it's one of the most valuable roles in Toastmasters because your feedback directly helps speakers improve. You covered ${completionPercent}% of the criteria this time. A helpful technique is to keep the checklist visible during the speech and make brief marks as you observe each quality.`);

  if (balanceScore >= 7) feedbackParts.push("I want to commend you on the balance of your feedback — you combined genuine praise with constructive suggestions beautifully. That's the hallmark of an experienced Toastmasters evaluator, and it creates a safe environment for the speaker to grow.");
  else feedbackParts.push(`Your feedback leaned ${metrics.positiveCount > metrics.constructiveCount ? "toward the positive side, which is encouraging" : "toward the constructive side, which shows you have a sharp eye for improvement"}. The Toastmasters \"sandwich\" method works wonderfully here — start with something specific the speaker did well, offer your suggestion for growth, then close with an encouraging observation. This way, the speaker leaves motivated to improve.`);

  if (engagementScore < 7) feedbackParts.push(`You spent about ${Math.floor(metrics.timeSpentSeconds / 60)} minute${Math.floor(metrics.timeSpentSeconds / 60) !== 1 ? "s" : ""} on your evaluation. The most impactful evaluations come from sustained attention — try to observe the entire speech actively, noting specific phrases, gestures, and moments that stood out. The more specific your examples, the more the speaker will value your feedback.`);

  return {
    overallScore,
    feedback: feedbackParts.join("\n\n"),
    metrics: [
      { name: "thoroughness", score: thoroughnessScore, maxScore: 10, label: "Thoroughness", feedback: `${completionPercent}% of checklist completed. ${thoroughnessScore >= 8 ? "Comprehensive coverage of all criteria." : "Review every checklist item for a more complete evaluation."}` },
      { name: "balance", score: balanceScore, maxScore: 10, label: "Feedback Balance", feedback: `${metrics.positiveCount} positive, ${metrics.constructiveCount} constructive items. ${balanceScore >= 7 ? "Well-balanced feedback approach." : "Aim for a roughly even mix of praise and suggestions."}` },
      { name: "detail", score: detailScore, maxScore: 10, label: "Detail Level", feedback: `${metrics.checklistChecked}/${metrics.checklistTotal} items assessed. ${detailScore >= 8 ? "Detailed, specific observations." : "Add more specific observations about the speaker's delivery."}` },
      { name: "engagement", score: engagementScore, maxScore: 10, label: "Engagement", feedback: `${Math.floor(metrics.timeSpentSeconds / 60)}m ${metrics.timeSpentSeconds % 60}s spent evaluating. ${engagementScore >= 7 ? "Good engagement with the evaluation process." : "Spend more time observing to catch nuances."}` },
    ],
  };
}

export function evaluateGrammarianRole(metrics: {
  noteCount: number;
  uniqueTypes: number;
  sessionDuration: number;
  noteTiming: number[];
}): RoleEvaluationResult {
  const countScore = metrics.noteCount >= 10 ? 10 : metrics.noteCount >= 7 ? 8 : metrics.noteCount >= 4 ? 6 : metrics.noteCount >= 2 ? 4 : 2;

  const varietyScore = metrics.uniqueTypes >= 4 ? 10 : metrics.uniqueTypes >= 3 ? 8 : metrics.uniqueTypes >= 2 ? 6 : 3;

  let spreadScore = 5;
  if (metrics.noteTiming.length >= 3 && metrics.sessionDuration > 0) {
    const normalized = metrics.noteTiming.map(t => t / metrics.sessionDuration);
    const hasEarly = normalized.some(t => t < 0.33);
    const hasMid = normalized.some(t => t >= 0.33 && t < 0.66);
    const hasLate = normalized.some(t => t >= 0.66);
    spreadScore = [hasEarly, hasMid, hasLate].filter(Boolean).length >= 3 ? 10 : [hasEarly, hasMid, hasLate].filter(Boolean).length >= 2 ? 7 : 4;
  }

  const qualityScore = Math.min(10, Math.round((countScore + varietyScore) / 2));

  const overallScore = Math.round((countScore + varietyScore + spreadScore + qualityScore) / 4 * 10);

  const feedbackParts: string[] = [];
  if (countScore >= 8) feedbackParts.push(`Fellow Toastmaster, you were an outstanding Grammarian today! You captured ${metrics.noteCount} language observations, which shows you were truly listening with purpose throughout the entire meeting. That level of attention is exactly what helps our members become more articulate speakers.`);
  else if (countScore >= 5) feedbackParts.push(`Thank you for serving as Grammarian today. You recorded ${metrics.noteCount} observations, which is a good start. Here's a tip from experienced Grammarians: try listening for three things simultaneously — creative word choices worth praising, grammatical slips to gently flag, and how speakers use the Word of the Day. Aiming for 7-10 notes per speech will give you rich material for your report.`);
  else feedbackParts.push(`I appreciate you taking on the Grammarian role today — it's a fantastic way to develop your own vocabulary and listening skills. You captured ${metrics.noteCount} note${metrics.noteCount !== 1 ? "s" : ""} this time. One technique that really helps is to divide your page into columns: one for great phrases, one for grammar issues, and one for Word of the Day usage. This structure makes it easier to catch observations in real time.`);

  if (varietyScore >= 7) feedbackParts.push("I especially liked the variety in your observations — you noticed both strong language choices and areas where speakers could improve. That balanced perspective is exactly what the Grammarian's report should provide, and it shows real linguistic awareness.");
  else feedbackParts.push("To make your Grammarian report even more valuable, try diversifying what you listen for. Beyond grammar errors, notice vivid metaphors, powerful word choices, repetitive phrases, and creative use of the Word of the Day. The best Grammarian reports celebrate great language just as much as they flag improvements.");

  if (spreadScore < 7) feedbackParts.push("I noticed your observations were concentrated in one section of the meeting. A helpful practice is to make at least one note in the first minute, the middle section, and the final minute of each speech. This ensures your report reflects the speaker's language throughout their entire presentation.");

  return {
    overallScore,
    feedback: feedbackParts.join("\n\n"),
    metrics: [
      { name: "count", score: countScore, maxScore: 10, label: "Observation Count", feedback: `${metrics.noteCount} grammar notes recorded. ${countScore >= 8 ? "Strong attention to language details." : "Aim for 7+ notes per speech."}` },
      { name: "variety", score: varietyScore, maxScore: 10, label: "Variety", feedback: `${metrics.uniqueTypes} different observation types. ${varietyScore >= 7 ? "Good mix of observation categories." : "Include both positive language use and areas for improvement."}` },
      { name: "spread", score: spreadScore, maxScore: 10, label: "Attentiveness", feedback: spreadScore >= 8 ? "Notes spread well across the entire session — consistent attention." : "Try to note observations throughout the entire speech, not just one section." },
      { name: "quality", score: qualityScore, maxScore: 10, label: "Detail Quality", feedback: qualityScore >= 8 ? "High quality, detailed observations with good specificity." : "Add more specific details — quote exact phrases and explain why they worked or didn't." },
    ],
  };
}

export function evaluateAhCounterRole(metrics: {
  totalCount: number;
  categoryCounts: Record<string, number>;
  sessionDuration: number;
  trackingTimestamps: number[];
}): RoleEvaluationResult {
  const detectionScore = metrics.totalCount >= 5 ? 9 : metrics.totalCount >= 3 ? 7 : metrics.totalCount >= 1 ? 5 : 3;

  const categories = Object.keys(metrics.categoryCounts).filter(k => metrics.categoryCounts[k] > 0).length;
  const coverageScore = categories >= 4 ? 10 : categories >= 3 ? 8 : categories >= 2 ? 6 : categories >= 1 ? 4 : 2;

  let consistencyScore = 5;
  if (metrics.trackingTimestamps.length >= 3 && metrics.sessionDuration > 0) {
    const normalized = metrics.trackingTimestamps.map(t => t / metrics.sessionDuration);
    const hasEarly = normalized.some(t => t < 0.33);
    const hasMid = normalized.some(t => t >= 0.33 && t < 0.66);
    const hasLate = normalized.some(t => t >= 0.66);
    consistencyScore = [hasEarly, hasMid, hasLate].filter(Boolean).length >= 3 ? 10 : [hasEarly, hasMid, hasLate].filter(Boolean).length >= 2 ? 7 : 4;
  }

  const attentivenessScore = Math.min(10, Math.round((detectionScore + coverageScore + consistencyScore) / 3));

  const overallScore = Math.round((detectionScore + coverageScore + consistencyScore + attentivenessScore) / 4 * 10);

  const feedbackParts: string[] = [];
  if (detectionScore >= 8) feedbackParts.push(`Fellow Toastmaster, excellent work as Ah Counter today! You caught ${metrics.totalCount} filler words, which shows you were listening with laser focus. Your sharp ear is a real asset to our club — when speakers know someone is counting their fillers, they naturally become more conscious of their speech patterns, and that's how we all improve.`);
  else if (detectionScore >= 5) feedbackParts.push(`Thank you for serving as Ah Counter today. You detected ${metrics.totalCount} filler words, which is a solid effort. Here's a tip that experienced Ah Counters use: rather than trying to listen for everything at once, focus on the two most common fillers first — "um" and "uh" — and then gradually expand your listening to include "like," "you know," and "so." You'll find your count naturally increases with practice.`);
  else feedbackParts.push(`I appreciate you taking on the Ah Counter role today — it's one of the best ways to develop your own listening skills while helping others. You tracked ${metrics.totalCount} filler word${metrics.totalCount !== 1 ? "s" : ""} this time. Most speakers use more fillers than they realize, so don't worry if the count seems low at first. Try sitting close to the speaker and keeping your pen ready — the moment you hear a filler, mark it immediately before your mind moves on.`);

  if (coverageScore >= 7) feedbackParts.push(`I'm impressed that you tracked ${categories} different types of fillers. That kind of detailed breakdown is incredibly valuable — when you can tell a speaker "you said 'um' 3 times and 'like' 5 times," it gives them specific patterns to work on. That's the mark of a skilled Ah Counter.`);
  else feedbackParts.push(`You tracked ${categories} type${categories !== 1 ? "s" : ""} of fillers, and expanding that range will make your reports even more impactful. Speakers are often surprised to learn their specific filler patterns — some favor "um," others lean on "you know" or "so." By tracking the full spectrum, you give each speaker a personalized roadmap for cleaner speech.`);

  if (consistencyScore < 7) feedbackParts.push("I noticed your tracking was concentrated in one section of the speech. Interestingly, filler words tend to spike at the beginning (nerves) and near the end (losing structure), so maintaining attention throughout reveals the most useful patterns. Try making a small tick mark every 30 seconds even if you don't hear a filler — it keeps you engaged and focused.");

  return {
    overallScore,
    feedback: feedbackParts.join("\n\n"),
    metrics: [
      { name: "detection", score: detectionScore, maxScore: 10, label: "Detection Count", feedback: `${metrics.totalCount} filler words caught. ${detectionScore >= 8 ? "Sharp listening skills." : "Aim to catch at least 5 per speech."}` },
      { name: "coverage", score: coverageScore, maxScore: 10, label: "Category Coverage", feedback: `${categories} different filler types tracked. ${coverageScore >= 7 ? "Good range of filler categories." : "Listen for um, uh, like, you know, so, basically, and pauses."}` },
      { name: "consistency", score: consistencyScore, maxScore: 10, label: "Tracking Consistency", feedback: consistencyScore >= 8 ? "Consistent tracking from start to finish — excellent focus." : "Practice maintaining attention throughout the entire speech." },
      { name: "attentiveness", score: attentivenessScore, maxScore: 10, label: "Attentiveness", feedback: attentivenessScore >= 8 ? "Very attentive to the speaker's verbal patterns and habits." : "Stay focused on speech patterns — try to minimize distractions during the speech." },
    ],
  };
}
