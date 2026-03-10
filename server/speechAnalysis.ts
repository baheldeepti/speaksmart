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

  const analysisPrompt = `You are an expert Toastmasters speech evaluator. Analyze this speech transcript and provide a detailed, comprehensive evaluation.

Speech transcript: "${transcript}"

Role: ${role === "table_topics" ? "Table Topics (impromptu speech, 1-2 minutes)" : "Prepared Speech (5-7 minutes)"}
Duration: ${durationSeconds} seconds (${Math.floor(durationSeconds / 60)}m ${durationSeconds % 60}s)
Word count: ${wordCount}
Words per minute: ${speechPaceWPM}
Filler words detected: ${fillerWordCount}${promptContext}${pathwaysContext}

Please evaluate on these criteria (score each 1-10):
1. Clarity of Ideas - How clear and understandable were the main points?
2. Story Structure - Did the speech have a clear beginning, middle, and end?
3. Vocal Confidence - Based on word choice, pace, and flow, how confident does the speaker sound?
4. Audience Engagement - How engaging and interesting was the content?

For each criterion, provide a specific 1-2 sentence feedback explaining the score, referencing specific moments from the speech when possible.

Also provide:
- An overall score (1-100)
- A detailed 3-5 sentence feedback paragraph with specific, actionable advice
- A list of 2-3 specific strengths demonstrated in this speech
- A list of 2-3 specific areas for improvement with actionable suggestions

Respond in this exact JSON format:
{
  "clarityScore": <number 1-10>,
  "structureScore": <number 1-10>,
  "confidenceScore": <number 1-10>,
  "engagementScore": <number 1-10>,
  "overallScore": <number 1-100>,
  "clarityFeedback": "<1-2 specific sentences>",
  "structureFeedback": "<1-2 specific sentences>",
  "confidenceFeedback": "<1-2 specific sentences>",
  "engagementFeedback": "<1-2 specific sentences>",
  "overallFeedback": "<3-5 sentence detailed paragraph with specific advice>",
  "strengths": ["<specific strength 1>", "<specific strength 2>"],
  "improvementAreas": ["<specific actionable improvement 1>", "<specific actionable improvement 2>"]
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
          label: "Story Structure",
          feedback: analysis.structureFeedback || "",
        },
        {
          name: "confidence",
          score: analysis.confidenceScore || 5,
          maxScore: 10,
          label: "Vocal Confidence",
          feedback: analysis.confidenceFeedback || "",
        },
        {
          name: "engagement",
          score: analysis.engagementScore || 5,
          maxScore: 10,
          label: "Audience Engagement",
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
  if (accuracyScore >= 8) feedbackParts.push("Your timing accuracy was excellent — you tracked the speaker's time precisely.");
  else if (accuracyScore >= 5) feedbackParts.push("Your timing was reasonably accurate. Practice keeping closer track of the exact time elapsed.");
  else feedbackParts.push("Your timing accuracy needs improvement. Try to stay focused on the clock throughout the entire speech.");

  if (signalCount === 3) feedbackParts.push("Great job signaling all three color zones (green, yellow, red) — this helps speakers manage their time effectively.");
  else if (signalCount >= 1) feedbackParts.push(`You signaled ${signalCount}/3 color zones. Make sure to watch for and signal all three thresholds so the speaker knows exactly where they stand.`);
  else feedbackParts.push("You didn't trigger any color signals. The green/yellow/red signals are essential for helping speakers pace themselves — prioritize this next time.");

  if (metrics.numberOfStops > 2) feedbackParts.push(`You stopped the timer ${metrics.numberOfStops} times. Try to maintain a steady, uninterrupted timer for more accurate tracking.`);

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
  if (thoroughnessScore >= 8) feedbackParts.push(`Excellent thoroughness! You assessed ${completionPercent}% of the evaluation checklist, showing careful attention to all aspects of the speaker's performance.`);
  else if (thoroughnessScore >= 5) feedbackParts.push(`You covered ${completionPercent}% of the checklist. Try to assess every item — even brief observations on each criterion help the speaker understand their strengths and weaknesses.`);
  else feedbackParts.push(`Only ${completionPercent}% of the checklist was completed. A thorough evaluation requires reviewing all criteria. Take notes during the speech to ensure you cover everything.`);

  if (balanceScore >= 7) feedbackParts.push("Your feedback was well-balanced between positive and constructive points — this is exactly what speakers need to grow.");
  else feedbackParts.push(`Your feedback leaned ${metrics.positiveCount > metrics.constructiveCount ? "heavily positive" : "mostly constructive"}. The best evaluations include roughly equal positive reinforcement and constructive suggestions. Try the "sandwich" method: positive → improvement → positive.`);

  if (engagementScore < 7) feedbackParts.push(`You spent ${Math.floor(metrics.timeSpentSeconds / 60)}m ${metrics.timeSpentSeconds % 60}s evaluating. Spending more time observing lets you catch subtleties in delivery, body language references, and word choices.`);

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
  if (countScore >= 8) feedbackParts.push(`Excellent observation volume! You recorded ${metrics.noteCount} grammar notes, demonstrating strong attentiveness throughout the speech.`);
  else if (countScore >= 5) feedbackParts.push(`You recorded ${metrics.noteCount} grammar notes. Try to capture more observations — aim for at least 7-10 notes per speech to give the speaker comprehensive grammar feedback.`);
  else feedbackParts.push(`Only ${metrics.noteCount} grammar note${metrics.noteCount !== 1 ? "s" : ""} recorded. The Grammarian role requires active listening and frequent note-taking. Try writing down any interesting word choices, grammatical errors, or creative expressions.`);

  if (varietyScore >= 7) feedbackParts.push("Good variety in your observations — you captured both positive language use and areas for improvement.");
  else feedbackParts.push("Try to diversify your notes. Look for both excellent word choices (positive) and grammar issues (improvement). Also note use of the Word of the Day, vivid descriptions, and repetitive phrases.");

  if (spreadScore < 7) feedbackParts.push("Your notes were clustered in one part of the speech. Practice taking notes throughout the entire speech — beginning, middle, and end — to give the speaker a complete picture.");

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
  if (detectionScore >= 8) feedbackParts.push(`Great detection! You caught ${metrics.totalCount} filler words, showing strong listening skills and attention to the speaker's verbal habits.`);
  else if (detectionScore >= 5) feedbackParts.push(`You detected ${metrics.totalCount} filler words. This is a decent start — experienced Ah Counters typically catch 5+ per speech. Focus on the most common fillers: "um," "uh," "like," and "you know."`);
  else feedbackParts.push(`You tracked ${metrics.totalCount} filler word${metrics.totalCount !== 1 ? "s" : ""}. Most speakers use several filler words during a speech. Practice active listening — sit where you can hear clearly and focus solely on speech patterns.`);

  if (coverageScore >= 7) feedbackParts.push(`You tracked ${categories} different types of fillers — great range! Monitoring multiple filler categories gives the speaker the most useful feedback.`);
  else feedbackParts.push(`You only tracked ${categories} type${categories !== 1 ? "s" : ""} of fillers. Speakers often use multiple types — listen for "um," "uh," "ah," "like," "you know," "so," "basically," and pause fillers. Tracking variety helps speakers understand their specific habits.`);

  if (consistencyScore < 7) feedbackParts.push("Your tracking was concentrated in one part of the speech. Try to maintain consistent attention from start to finish — filler words often increase when speakers are nervous (beginning) or losing structure (end).");

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
