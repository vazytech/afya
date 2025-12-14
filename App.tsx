import React, { useState, useEffect } from 'react';
import { LayoutDashboard, MessageCircle, User as UserIcon, ShieldAlert, Apple } from 'lucide-react';
import { AppView, DiabetesType, Gender, UserProfile, VitalLog, MealLog } from './types';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import ProfileSettings from './components/ProfileSettings';
import EmergencyMode from './components/EmergencyMode';
import NutritionTracker from './components/NutritionTracker';

// Default initial state
const INITIAL_PROFILE: UserProfile = {
  name: 'User',
  age: 45,
  gender: Gender.FEMALE,
  weight: 70,
  height: 165,
  diabetesType: DiabetesType.TYPE_2,
  medications: ['Metformin'],
  emergencyContactName: 'Dr. Smith',
  emergencyContactPhone: ''
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [isEmergency, setIsEmergency] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [vitals, setVitals] = useState<VitalLog[]>([]);
  const [meals, setMeals] = useState<MealLog[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('afya_profile');
    const savedVitals = localStorage.getItem('afya_vitals');
    const savedMeals = localStorage.getItem('afya_meals');
    
    if (savedProfile) setUserProfile(JSON.parse(savedProfile));
    if (savedVitals) setVitals(JSON.parse(savedVitals));
    if (savedMeals) setMeals(JSON.parse(savedMeals));
  }, []);

  // Save data on change
  useEffect(() => {
    localStorage.setItem('afya_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('afya_vitals', JSON.stringify(vitals));
  }, [vitals]);

  useEffect(() => {
    localStorage.setItem('afya_meals', JSON.stringify(meals));
  }, [meals]);

  const handleAddVital = (vital: Omit<VitalLog, 'id'>) => {
    const newLog: VitalLog = { ...vital, id: Date.now().toString() };
    setVitals(prev => [...prev, newLog]);
  };

  const handleAddMeal = (meal: MealLog) => {
    setMeals(prev => [...prev, meal]);
  };

  const handleUpdateProfile = (profile: UserProfile) => {
    setUserProfile(profile);
  };

  if (isEmergency) {
    return <EmergencyMode userProfile={userProfile} onExit={() => setIsEmergency(false)} />;
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-teal-50 overflow-hidden text-slate-900 font-sans">
      {/* Top Header - Mobile optimized */}
      <header className="bg-white/80 backdrop-blur-md border-b border-teal-100 p-4 flex justify-between items-center z-10 shadow-sm sticky top-0">
        <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-200">
                A
            </div>
            <span className="font-bold text-xl tracking-tight text-teal-900">AFYA</span>
        </div>
        <button 
            onClick={() => setIsEmergency(true)}
            className="bg-rose-100 text-rose-600 p-2 px-4 rounded-full text-sm font-bold flex items-center gap-1 hover:bg-rose-200 transition-colors shadow-sm animate-pulse"
        >
            <ShieldAlert size={18} />
            SOS
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        {currentView === AppView.DASHBOARD && (
          <Dashboard 
            vitals={vitals} 
            onAddVital={handleAddVital} 
            userProfile={userProfile} 
          />
        )}
        {currentView === AppView.CHAT && (
          <ChatInterface 
            userProfile={userProfile}
            vitals={vitals}
          />
        )}
        {currentView === AppView.NUTRITION && (
          <NutritionTracker 
            userProfile={userProfile}
            meals={meals}
            onAddMeal={handleAddMeal}
          />
        )}
        {currentView === AppView.PROFILE && (
          <ProfileSettings 
            profile={userProfile}
            onSave={handleUpdateProfile}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-slate-100 p-2 pb-safe z-10 shadow-[0_-5px_15px_rgba(0,0,0,0.02)]">
        <div className="flex justify-between items-center max-w-lg mx-auto px-2">
          <button
            onClick={() => setCurrentView(AppView.DASHBOARD)}
            className={`flex flex-col items-center p-3 rounded-2xl transition-all w-16 ${currentView === AppView.DASHBOARD ? 'text-emerald-600 bg-emerald-50 font-semibold scale-105' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <LayoutDashboard size={22} strokeWidth={currentView === AppView.DASHBOARD ? 2.5 : 2} />
            <span className="text-[10px] mt-1">Today</span>
          </button>
          
          <button
            onClick={() => setCurrentView(AppView.CHAT)}
            className={`flex flex-col items-center p-3 rounded-2xl transition-all w-16 ${currentView === AppView.CHAT ? 'text-emerald-600 bg-emerald-50 font-semibold scale-105' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <MessageCircle size={22} strokeWidth={currentView === AppView.CHAT ? 2.5 : 2} />
            <span className="text-[10px] mt-1">Voice</span>
          </button>

          <button
            onClick={() => setCurrentView(AppView.NUTRITION)}
            className={`flex flex-col items-center p-3 rounded-2xl transition-all w-16 ${currentView === AppView.NUTRITION ? 'text-emerald-600 bg-emerald-50 font-semibold scale-105' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Apple size={22} strokeWidth={currentView === AppView.NUTRITION ? 2.5 : 2} />
            <span className="text-[10px] mt-1">Food</span>
          </button>

          <button
            onClick={() => setCurrentView(AppView.PROFILE)}
            className={`flex flex-col items-center p-3 rounded-2xl transition-all w-16 ${currentView === AppView.PROFILE ? 'text-emerald-600 bg-emerald-50 font-semibold scale-105' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <UserIcon size={22} strokeWidth={currentView === AppView.PROFILE ? 2.5 : 2} />
            <span className="text-[10px] mt-1">Me</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default App;