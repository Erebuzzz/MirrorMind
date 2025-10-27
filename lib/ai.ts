import type { AnalysisResult } from "./types";

const HF_API_URL = "https://router.huggingface.co/hf-inference/models/";
const GOOGLE_AI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

interface HuggingFaceResponse {
  error?: string;
  estimated_time?: number;
}

interface GoogleAIResponse {
  candidates?: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
  error?: {
    message: string;
  };
}

async function queryGoogleAI(prompt: string, apiKey: string): Promise<string> {
  try {
    const response = await fetch(`${GOOGLE_AI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 500,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Google AI API error: ${response.statusText}`);
    }

    const data: GoogleAIResponse = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    }

    throw new Error("No response from Google AI");
  } catch (error) {
    console.error("Google AI error:", error);
    throw error;
  }
}

async function queryHuggingFace(model: string, inputs: string, token?: string): Promise<any> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${HF_API_URL}${model}`, {
    method: "POST",
    headers,
    body: JSON.stringify({ inputs, options: { wait_for_model: true } }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `HuggingFace API error: ${response.statusText}`);
  }

  return response.json();
}

async function getSummarization(text: string, token?: string): Promise<string> {
  try {
    const result = await queryHuggingFace(
      "facebook/bart-large-cnn",
      text,
      token
    );

    if (Array.isArray(result) && result[0]?.summary_text) {
      return result[0].summary_text;
    }

    return generateSummary(text);
  } catch (error) {
    console.error("Summarization error:", error);
    return generateSummary(text);
  }
}

async function getSentimentAnalysis(text: string, token?: string): Promise<{ label: string; score: number }> {
  try {
    const result = await queryHuggingFace(
      "distilbert-base-uncased-finetuned-sst-2-english",
      text,
      token
    );

    if (Array.isArray(result) && result[0]) {
      const topResult = result[0][0];
      return {
        label: topResult.label.toLowerCase(),
        score: topResult.score
      };
    }

    return { label: "neutral", score: 0.5 };
  } catch (error) {
    console.error("Sentiment analysis error:", error);
    return { label: "neutral", score: 0.5 };
  }
}

function analyzeSentiment(text: string): string {
  const positiveWords = ["happy", "joy", "love", "excited", "grateful", "wonderful", "amazing", "great", "good", "beautiful"];
  const negativeWords = ["sad", "angry", "frustrated", "tired", "anxious", "worried", "fear", "bad", "terrible", "difficult"];
  const calmWords = ["calm", "peaceful", "relaxed", "quiet", "serene", "gentle"];
  
  const lowerText = text.toLowerCase();
  
  let positiveCount = 0;
  let negativeCount = 0;
  let calmCount = 0;
  
  positiveWords.forEach(word => {
    if (lowerText.includes(word)) positiveCount++;
  });
  
  negativeWords.forEach(word => {
    if (lowerText.includes(word)) negativeCount++;
  });
  
  calmWords.forEach(word => {
    if (lowerText.includes(word)) calmCount++;
  });
  
  if (calmCount > 0) return "calm";
  if (positiveCount > negativeCount) return "positive";
  if (negativeCount > positiveCount) return "anxious";
  return "neutral";
}

function generateSummary(text: string): string {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  
  if (sentences.length <= 2) {
    return text.trim();
  }
  
  const firstSentence = sentences[0].trim();
  const lastSentence = sentences[sentences.length - 1].trim();
  
  if (text.length < 200) {
    return text.trim();
  }
  
  return `${firstSentence} ${lastSentence}`;
}

function mapSentimentToMood(hfSentiment: string, keywordMood: string, confidence: number): string {
  if (confidence > 0.8) {
    if (hfSentiment === "positive") return "positive";
    if (hfSentiment === "negative") return "anxious";
  }
  
  if (keywordMood === "calm") return "calm";
  
  if (hfSentiment === "positive" && (keywordMood === "positive" || keywordMood === "neutral")) {
    return "positive";
  }
  
  if (hfSentiment === "negative" && (keywordMood === "anxious" || keywordMood === "neutral")) {
    return "anxious";
  }
  
  return keywordMood;
}

function generatePersonalizedResponse(mood: string, text: string, summary: string): string {
  const lowerText = text.toLowerCase();
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Extract key themes and topics
  const themes = {
    work: /work|job|career|project|meeting|deadline|colleague|boss/i.test(text),
    relationships: /friend|family|partner|relationship|love|connect|talk|conversation/i.test(text),
    health: /health|exercise|sleep|tired|energy|sick|workout|gym/i.test(text),
    growth: /learn|grow|improve|achieve|goal|progress|develop/i.test(text),
    stress: /stress|anxious|worry|overwhelm|pressure|difficult|hard|struggle/i.test(text),
    joy: /happy|joy|excited|amazing|wonderful|great|love|enjoy/i.test(text),
    gratitude: /grateful|thankful|appreciate|blessed|lucky|fortunate/i.test(text),
    future: /tomorrow|future|plan|hope|will|going to|next/i.test(text),
    past: /yesterday|remember|used to|was|regret|miss/i.test(text),
  };

  let response = "";

  // Start with acknowledgment
  if (mood === "positive") {
    const starters = [
      `I can really sense the positive energy in your words! ${summary} `,
      `It's wonderful to hear you're feeling good! ${summary} `,
      `Your enthusiasm comes through clearly! ${summary} `,
    ];
    response = starters[Math.floor(Math.random() * starters.length)];
  } else if (mood === "anxious") {
    const starters = [
      `I hear that you're going through a challenging time. ${summary} `,
      `It sounds like things feel heavy right now. ${summary} `,
      `I can sense the stress you're experiencing. ${summary} `,
    ];
    response = starters[Math.floor(Math.random() * starters.length)];
  } else if (mood === "calm") {
    const starters = [
      `There's a peaceful quality to what you've shared. ${summary} `,
      `It's lovely to hear you're finding moments of calm. ${summary} `,
      `Your sense of tranquility comes through in your words. ${summary} `,
    ];
    response = starters[Math.floor(Math.random() * starters.length)];
  } else {
    response = `Thank you for sharing your thoughts. ${summary} `;
  }

  // Add personalized suggestions based on themes and mood
  const suggestions: string[] = [];

  if (themes.stress) {
    suggestions.push("Consider taking a few deep breaths or a short walk to reset your mind.");
    suggestions.push("Breaking down what's overwhelming into smaller, manageable steps might help.");
    suggestions.push("Remember: it's okay to ask for help or take a break when you need it.");
  }

  if (themes.work && mood === "anxious") {
    suggestions.push("Try prioritizing just 2-3 key tasks for tomorrow instead of everything at once.");
    suggestions.push("Maybe schedule short breaks between work sessions to maintain your energy.");
  }

  if (themes.work && mood === "positive") {
    suggestions.push("This momentum is great - consider documenting what's working well so you can replicate it.");
    suggestions.push("Celebrate these wins, even the small ones. They add up!");
  }

  if (themes.relationships && mood === "positive") {
    suggestions.push("These connections are clearly valuable to you. Keep nurturing them!");
    suggestions.push("Consider letting them know how much you appreciate them.");
  }

  if (themes.relationships && mood === "anxious") {
    suggestions.push("Open communication often helps. Consider sharing how you're feeling with someone you trust.");
    suggestions.push("Remember that healthy relationships involve both giving and receiving support.");
  }

  if (themes.health && !themes.joy) {
    suggestions.push("Your physical health impacts your mental state. Even small changes can make a difference.");
    suggestions.push("Try setting one small, achievable health goal for this week.");
  }

  if (themes.growth) {
    suggestions.push("Growth often comes from stepping outside comfort zones. You're on the right path.");
    suggestions.push("Track your progress - sometimes we don't realize how far we've come.");
  }

  if (themes.future && mood === "anxious") {
    suggestions.push("Focus on what you can control today, rather than what might happen tomorrow.");
    suggestions.push("Write down your specific concerns - they often feel less overwhelming on paper.");
  }

  if (themes.future && mood === "positive") {
    suggestions.push("This optimism is powerful. Consider writing down your goals to make them more concrete.");
    suggestions.push("Channel this positive energy into taking one small action toward your aspirations.");
  }

  if (themes.past && mood === "anxious") {
    suggestions.push("The past is done, but it can teach us. What's one lesson you can take forward?");
    suggestions.push("Be gentle with yourself. We all have moments we wish we could change.");
  }

  if (themes.gratitude) {
    suggestions.push("Gratitude is a powerful practice. Consider keeping a list of things you're thankful for.");
    suggestions.push("This appreciative mindset will serve you well. Keep cultivating it!");
  }

  // General wellness suggestions based on mood
  if (mood === "anxious" && suggestions.length < 2) {
    suggestions.push("Try a simple grounding technique: name 5 things you can see, 4 you can touch, 3 you can hear.");
    suggestions.push("Be kind to yourself. What would you tell a friend going through this?");
  }

  if (mood === "calm" && suggestions.length < 2) {
    suggestions.push("Notice what helps you feel this way - these are your personal reset buttons.");
    suggestions.push("This peaceful state is valuable. Try to return to it when stress builds up.");
  }

  if (mood === "positive" && suggestions.length < 2) {
    suggestions.push("Ride this positive wave! Use this energy to tackle something you've been putting off.");
    suggestions.push("Share your joy with others - positivity is contagious.");
  }

  // Add neutral suggestions if we don't have enough specific ones
  if (suggestions.length === 0) {
    suggestions.push("Take a moment to check in with yourself throughout the day.");
    suggestions.push("Consider what small action could make tomorrow slightly better than today.");
    suggestions.push("Remember to be patient with yourself - progress isn't always linear.");
  }

  // Combine response with 1-2 suggestions
  const numSuggestions = Math.min(2, suggestions.length);
  const selectedSuggestions = [];
  const usedIndices = new Set();
  
  while (selectedSuggestions.length < numSuggestions) {
    const idx = Math.floor(Math.random() * suggestions.length);
    if (!usedIndices.has(idx)) {
      usedIndices.add(idx);
      selectedSuggestions.push(suggestions[idx]);
    }
  }

  response += "\n\n" + selectedSuggestions.join(" ");

  return response.trim();
}

async function generatePersonalizedResponseWithAI(
  mood: string,
  text: string,
  summary: string,
  googleApiKey?: string
): Promise<string> {
  if (!googleApiKey) {
    return generatePersonalizedResponse(mood, text, summary);
  }

  try {
    const prompt = `You are a compassionate AI journal companion. A person has just shared a journal entry with you. Your role is to:

1. Acknowledge their feelings with empathy
2. Provide 1-2 specific, actionable suggestions based on their situation
3. Be warm, supportive, and conversational (not clinical or robotic)
4. Keep your response to 2-3 short paragraphs

Here's their journal entry:
"${text}"

Their detected mood is: ${mood}

Provide a thoughtful, personalized response that shows you understood what they wrote and offer genuine, practical suggestions that could help them. Write in a warm, friend-like tone.`;

    const response = await queryGoogleAI(prompt, googleApiKey);
    return response;
  } catch (error) {
    console.error("Google AI personalized response error:", error);
    return generatePersonalizedResponse(mood, text, summary);
  }
}

export async function analyzeJournal(text: string, useHuggingFace: boolean = false): Promise<AnalysisResult> {
  try {
    const keywordMood = analyzeSentiment(text);
    
    if (useHuggingFace && typeof window !== "undefined") {
      const [hfSummary, hfSentiment] = await Promise.all([
        getSummarization(text).catch(() => generateSummary(text)),
        getSentimentAnalysis(text).catch(() => ({ label: "neutral", score: 0.5 }))
      ]);
      
      const finalMood = mapSentimentToMood(hfSentiment.label, keywordMood, hfSentiment.score);
      const finalSummary = hfSummary.length > 50 ? hfSummary : generateSummary(text);
      
      return {
        summary: finalSummary,
        mood: finalMood,
        reflection: generatePersonalizedResponse(finalMood, text, finalSummary),
      };
    }
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      summary: generateSummary(text),
      mood: keywordMood,
      reflection: generatePersonalizedResponse(keywordMood, text, generateSummary(text)),
    };
  } catch (error) {
    console.error("Analysis error:", error);
    
    return {
      summary: generateSummary(text),
      mood: "neutral",
      reflection: "What are your thoughts about this entry?",
    };
  }
}

export async function analyzeJournalServer(text: string, token?: string, googleApiKey?: string): Promise<AnalysisResult> {
  try {
    const keywordMood = analyzeSentiment(text);
    
    const truncatedText = text.length > 1024 ? text.substring(0, 1024) : text;
    
    const [hfSummary, hfSentiment] = await Promise.all([
      getSummarization(truncatedText, token).catch(() => generateSummary(text)),
      getSentimentAnalysis(truncatedText, token).catch(() => ({ label: "neutral", score: 0.5 }))
    ]);
    
    const finalMood = mapSentimentToMood(hfSentiment.label, keywordMood, hfSentiment.score);
    const finalSummary = hfSummary.length > 50 ? hfSummary : generateSummary(text);
    
    return {
      summary: finalSummary,
      mood: finalMood,
      reflection: await generatePersonalizedResponseWithAI(finalMood, text, finalSummary, googleApiKey),
    };
  } catch (error) {
    console.error("Server analysis error:", error);
    
    return {
      summary: generateSummary(text),
      mood: analyzeSentiment(text),
      reflection: generatePersonalizedResponse(analyzeSentiment(text), text, "Here's what I gathered from your entry."),
    };
  }
}
