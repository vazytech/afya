import { GoogleGenAI, Chat, Type, Schema } from "@google/genai";
import { UserProfile, VitalLog } from "../types";

const SYSTEM_INSTRUCTION = `
You are AFYA, a compassionate, specialized AI health assistant for people with diabetes.
Your goal is to help users manage their condition, provide nutrition/exercise advice, and support healthy habits.

CRITICAL SAFETY RULES:
1. You are NOT a doctor. Do not provide medical diagnoses or prescribe medication.
2. Always advise the user to consult a healthcare professional for serious concerns.
3. If a user reports blood sugar < 70 mg/dL (Hypoglycemia) or > 300 mg/dL (Hyperglycemia) with symptoms like confusion, fainting, or rapid breathing, strongly advise them to seek IMMEDIATE emergency medical help.
4. Be empathetic, encouraging, and clear.

CONTEXT AWARENESS:
Use the provided user profile and recent vitals to tailor your advice (e.g., specific advice for Type 1 vs Type 2).

TONE:
Supportive, knowledgeable, calm, and motivating.
`;

let chatSession: Chat | null = null;

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const initializeChat = (userProfile: UserProfile, recentVitals: VitalLog[]) => {
  const ai = getAIClient();
  
  // Construct a context string to prime the model
  const contextString = `
    User Profile:
    Name: ${userProfile.name}
    Age: ${userProfile.age}
    Type: ${userProfile.diabetesType}
    Meds: ${userProfile.medications.join(', ')}
    
    Recent Vitals (Last 3):
    ${recentVitals.slice(0, 3).map(v => `${new Date(v.timestamp).toLocaleString()}: ${v.bloodSugar} mg/dL (${v.context})`).join('\n')}
  `;

  chatSession = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION + "\n\nCurrent User Context:\n" + contextString,
    },
  });
};

export const sendMessageToAfya = async (message: string, userProfile?: UserProfile, recentVitals?: VitalLog[]): Promise<string> => {
  if (!chatSession) {
    // If session doesn't exist (or lost), re-init with current data
    if (userProfile && recentVitals) {
        initializeChat(userProfile, recentVitals);
    } else {
         // Fallback initialization if no data passed (should typically be handled by caller)
         const ai = getAIClient();
         chatSession = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: { systemInstruction: SYSTEM_INSTRUCTION }
         });
    }
  }

  try {
    const result = await chatSession!.sendMessage({
      message: message,
    });
    return result.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting to the health network right now. Please check your internet connection or try again later.";
  }
};

// Function to analyze meal
export const analyzeMealWithAI = async (mealDescription: string, userProfile: UserProfile) => {
  const ai = getAIClient();
  
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      calories: { type: Type.INTEGER, description: "Estimated calories" },
      carbs: { type: Type.INTEGER, description: "Estimated carbohydrates in grams" },
      glycemicIndex: { type: Type.STRING, enum: ["Low", "Medium", "High"], description: "Glycemic index category" },
      advice: { type: Type.STRING, description: "Brief health advice for a diabetic regarding this meal" }
    },
    required: ["calories", "carbs", "glycemicIndex", "advice"]
  };

  try {
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze this meal for a patient with ${userProfile.diabetesType}: "${mealDescription}". Estimate values.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    return JSON.parse(result.text || "{}");
  } catch (error) {
    console.error("Meal analysis error:", error);
    return null;
  }
};
