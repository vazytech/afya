import React, { useState } from 'react';
import { Apple, Plus, Loader2, Utensils, CheckCircle2, AlertCircle } from 'lucide-react';
import { MealLog, UserProfile } from '../types';
import { analyzeMealWithAI } from '../services/geminiService';

interface NutritionTrackerProps {
    userProfile: UserProfile;
    meals: MealLog[];
    onAddMeal: (meal: MealLog) => void;
}

const NutritionTracker: React.FC<NutritionTrackerProps> = ({ userProfile, meals, onAddMeal }) => {
    const [input, setInput] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<any>(null);

    const handleAnalyze = async () => {
        if (!input.trim()) return;
        setIsAnalyzing(true);
        setAnalysisResult(null);
        
        try {
            const result = await analyzeMealWithAI(input, userProfile);
            setAnalysisResult(result);
        } catch (e) {
            console.error(e);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSave = () => {
        if (!analysisResult) return;
        
        const newMeal: MealLog = {
            id: Date.now().toString(),
            timestamp: Date.now(),
            description: input,
            calories: analysisResult.calories,
            carbs: analysisResult.carbs,
            glycemicIndex: analysisResult.glycemicIndex,
            advice: analysisResult.advice
        };

        onAddMeal(newMeal);
        setInput('');
        setAnalysisResult(null);
    };

    const getGIBadge = (gi: string) => {
        const colors: Record<string, string> = {
            'Low': 'bg-emerald-100 text-emerald-800 border-emerald-200',
            'Medium': 'bg-amber-100 text-amber-800 border-amber-200',
            'High': 'bg-rose-100 text-rose-800 border-rose-200'
        };
        return (
            <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${colors[gi] || colors['Medium']}`}>
                GI: {gi}
            </span>
        );
    };

    return (
        <div className="p-4 space-y-6 pb-24 overflow-y-auto h-full bg-teal-50/50">
            <div className="flex items-center gap-3 mb-2">
                <div className="bg-emerald-100 p-2 rounded-xl text-emerald-700">
                    <Apple size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Nutrition</h1>
                    <p className="text-slate-500 text-sm">Track meals & manage sugar</p>
                </div>
            </div>

            {/* Analysis Card */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
                <label className="block text-sm font-medium text-slate-700 mb-2">What did you eat?</label>
                <div className="flex gap-2 mb-4">
                    <input 
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="e.g., Oatmeal with blueberries"
                        className="flex-1 p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
                    />
                    <button 
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || !input.trim()}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white p-3 rounded-xl transition-colors font-medium flex items-center gap-2"
                    >
                        {isAnalyzing ? <Loader2 className="animate-spin" size={20} /> : <Utensils size={20} />}
                        Analyze
                    </button>
                </div>

                {analysisResult && (
                    <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100 animate-in fade-in slide-in-from-top-4">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg capitalize">{input}</h3>
                                <div className="flex gap-2 mt-1">
                                    {getGIBadge(analysisResult.glycemicIndex)}
                                    <span className="px-2 py-1 bg-white rounded-lg text-xs font-medium border border-slate-100 text-slate-600">
                                        {analysisResult.calories} kcal
                                    </span>
                                    <span className="px-2 py-1 bg-white rounded-lg text-xs font-medium border border-slate-100 text-slate-600">
                                        {analysisResult.carbs}g Carbs
                                    </span>
                                </div>
                            </div>
                            <CheckCircle2 className="text-emerald-500" />
                        </div>
                        
                        <div className="bg-white p-3 rounded-xl border border-emerald-100/50 mb-3">
                            <p className="text-sm text-slate-600 leading-relaxed flex gap-2">
                                <AlertCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                                {analysisResult.advice}
                            </p>
                        </div>

                        <button 
                            onClick={handleSave}
                            className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold shadow-md hover:bg-emerald-700 transition-colors flex justify-center items-center gap-2"
                        >
                            <Plus size={18} />
                            Log to Diary
                        </button>
                    </div>
                )}
            </div>

            {/* History List */}
            <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-800 ml-1">Today's Meals</h2>
                {meals.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-slate-200">
                        <div className="bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                            <Utensils size={20} />
                        </div>
                        <p className="text-slate-400 text-sm">No meals logged yet today.</p>
                    </div>
                ) : (
                    meals.slice().reverse().map(meal => (
                        <div key={meal.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                                <span className="font-bold text-slate-800">{meal.description}</span>
                                <span className="text-xs text-slate-400">
                                    {new Date(meal.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                {meal.glycemicIndex && getGIBadge(meal.glycemicIndex)}
                                {meal.carbs && <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">{meal.carbs}g Carbs</span>}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NutritionTracker;