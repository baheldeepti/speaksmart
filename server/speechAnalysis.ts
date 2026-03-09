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

  const analysisPrompt = `You are an expert Toastmasters speech evaluator. Analyze this speech transcript and provide detailed evaluation scores.

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

Also provide:
- An overall score (1-100)
- A 2-3 sentence feedback paragraph with specific, actionable advice

Respond in this exact JSON format:
{
  "clarityScore": <number 1-10>,
  "structureScore": <number 1-10>,
  "confidenceScore": <number 1-10>,
  "engagementScore": <number 1-10>,
  "overallScore": <number 1-100>,
  "clarityFeedback": "<one sentence>",
  "structureFeedback": "<one sentence>",
  "confidenceFeedback": "<one sentence>",
  "engagementFeedback": "<one sentence>",
  "overallFeedback": "<2-3 sentence paragraph with specific advice>"
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: analysisPrompt }],
    response_format: { type: "json_object" },
    max_tokens: 1000,
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

  return {
    overallScore,
    feedback: overallScore >= 80
      ? "Excellent timing management! You kept accurate time and used the signal system effectively."
      : overallScore >= 60
      ? "Good effort on timing. Focus on signaling all three color zones and responding quickly when the speaker starts."
      : "Keep practicing! Try to start the timer promptly and watch for all three timing thresholds.",
    metrics: [
      { name: "accuracy", score: accuracyScore, maxScore: 10, label: "Timing Accuracy", feedback: `${metrics.accuracyPercent}% accuracy in time tracking.` },
      { name: "response", score: responseScore, maxScore: 10, label: "Response Speed", feedback: `${metrics.timerStartDelay}s delay before starting timer.` },
      { name: "signals", score: signalScore, maxScore: 10, label: "Signal Awareness", feedback: `${signalCount}/3 color signals triggered correctly.` },
      { name: "consistency", score: consistencyScore, maxScore: 10, label: "Consistency", feedback: `${metrics.numberOfStops} timer stop${metrics.numberOfStops !== 1 ? "s" : ""} during the session.` },
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

  return {
    overallScore,
    feedback: overallScore >= 80
      ? "Thorough evaluation! You covered all key areas and provided balanced feedback."
      : overallScore >= 60
      ? "Good evaluation approach. Try to assess more checklist items and balance positive with constructive feedback."
      : "Keep practicing evaluation skills. Aim to review all checklist items and spend more time observing the speaker.",
    metrics: [
      { name: "thoroughness", score: thoroughnessScore, maxScore: 10, label: "Thoroughness", feedback: `${completionPercent}% of checklist completed.` },
      { name: "balance", score: balanceScore, maxScore: 10, label: "Feedback Balance", feedback: `${metrics.positiveCount} positive, ${metrics.constructiveCount} constructive items.` },
      { name: "detail", score: detailScore, maxScore: 10, label: "Detail Level", feedback: `${metrics.checklistChecked}/${metrics.checklistTotal} items assessed.` },
      { name: "engagement", score: engagementScore, maxScore: 10, label: "Engagement", feedback: `${Math.floor(metrics.timeSpentSeconds / 60)}m ${metrics.timeSpentSeconds % 60}s spent evaluating.` },
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

  return {
    overallScore,
    feedback: overallScore >= 80
      ? "Excellent grammar observation! You captured diverse language patterns throughout the entire session."
      : overallScore >= 60
      ? "Good observation skills. Try to note more variety in grammar usage and track observations throughout the whole speech."
      : "Keep building your observation skills. Focus on catching different types of language use and noting them consistently.",
    metrics: [
      { name: "count", score: countScore, maxScore: 10, label: "Observation Count", feedback: `${metrics.noteCount} grammar notes recorded.` },
      { name: "variety", score: varietyScore, maxScore: 10, label: "Variety", feedback: `${metrics.uniqueTypes} different observation types.` },
      { name: "spread", score: spreadScore, maxScore: 10, label: "Attentiveness", feedback: spreadScore >= 8 ? "Notes spread well across the session." : "Try to note observations throughout the entire speech." },
      { name: "quality", score: qualityScore, maxScore: 10, label: "Detail Quality", feedback: qualityScore >= 8 ? "High quality, detailed observations." : "Add more specific details to your notes." },
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

  return {
    overallScore,
    feedback: overallScore >= 80
      ? "Excellent filler word tracking! You caught multiple types consistently throughout the speech."
      : overallScore >= 60
      ? "Good tracking effort. Try to monitor for more types of filler words and track throughout the entire speech."
      : "Keep practicing! Focus on listening for different filler words (um, uh, like, you know) and track them consistently.",
    metrics: [
      { name: "detection", score: detectionScore, maxScore: 10, label: "Detection Count", feedback: `${metrics.totalCount} filler words caught.` },
      { name: "coverage", score: coverageScore, maxScore: 10, label: "Category Coverage", feedback: `${categories} different filler types tracked.` },
      { name: "consistency", score: consistencyScore, maxScore: 10, label: "Tracking Consistency", feedback: consistencyScore >= 8 ? "Consistent tracking throughout." : "Try to track filler words throughout the entire speech." },
      { name: "attentiveness", score: attentivenessScore, maxScore: 10, label: "Attentiveness", feedback: attentivenessScore >= 8 ? "Very attentive to speaker's language." : "Stay focused on the speaker's word choices." },
    ],
  };
}
