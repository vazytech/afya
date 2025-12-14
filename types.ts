export enum DiabetesType {
  TYPE_1 = 'Type 1',
  TYPE_2 = 'Type 2',
  GESTATIONAL = 'Gestational',
  PRE_DIABETES = 'Pre-Diabetes',
  NONE = 'None (Healthy/At Risk)',
}

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other',
}

export enum AppView {
  DASHBOARD = 'dashboard',
  CHAT = 'chat',
  NUTRITION = 'nutrition',
  PROFILE = 'profile',
  EMERGENCY = 'emergency',
}

export interface UserProfile {
  name: string;
  age: number;
  gender: Gender;
  weight: number; // kg
  height: number; // cm
  diabetesType: DiabetesType;
  medications: string[];
  emergencyContactName: string;
  emergencyContactPhone: string;
}

export interface VitalLog {
  id: string;
  timestamp: number;
  bloodSugar: number; // mg/dL
  context: 'Fasting' | 'Post-Meal' | 'Random';
  notes?: string;
}

export interface MealLog {
  id: string;
  timestamp: number;
  description: string;
  calories?: number;
  carbs?: number; // grams
  glycemicIndex?: 'Low' | 'Medium' | 'High';
  advice?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: number;
}