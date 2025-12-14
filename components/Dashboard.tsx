import React, { useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  ReferenceLine 
} from 'recharts';
import { Plus, Activity, Droplet, Sun, Moon, Coffee, AlertCircle, Quote } from 'lucide-react';
import { VitalLog, UserProfile } from '../types';

interface DashboardProps {
  vitals: VitalLog[];
  onAddVital: (vital: Omit<VitalLog, 'id'>) => void;
  userProfile: UserProfile;
}

const TIPS = [
  "Walking for just 10 minutes after a meal can help improve blood sugar levels.",
  "Stay hydrated! Water helps your kidneys flush out excess sugar through urine.",
  "Fiber is your friend. Vegetables and whole grains help slow sugar absorption.",
  "Consistency is key. Try to eat at similar times each day to keep levels stable."
];

const Dashboard: React.FC<DashboardProps> = ({ vitals, onAddVital, userProfile }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReading, setNewReading] = useState({
    level: '',
    context: 'Random' as 'Fasting' | 'Post-Meal' | 'Random',
    notes: ''
  });

  // Dynamic greeting
  const hour = new Date().getHours();
  let greeting = "Hello";
  let Icon = Sun;
  if (hour < 12) { greeting = "Good Morning"; Icon = Coffee; }
  else if (hour < 18) { greeting = "Good Afternoon"; Icon = Sun; }
  else { greeting = "Good Evening"; Icon = Moon; }

  const randomTip = TIPS[new Date().getDate() % TIPS.length];

  // Calculate stats
  const latestVital = vitals.length > 0 ? vitals[vitals.length - 1] : null;
  const avgSugar = vitals.length > 0 
    ? Math.round(vitals.reduce((acc, v) => acc + v.bloodSugar, 0) / vitals.length) 
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReading.level) return;
    
    onAddVital({
        timestamp: Date.now(),
        bloodSugar: parseInt(newReading.level),
        context: newReading.context,
        notes: newReading.notes
    });
    setNewReading({ level: '', context: 'Random', notes: '' });
    setShowAddModal(false);
  };

  const getStatusColor = (level: number) => {
      if (level < 70) return 'text-rose-600 bg-rose-50 border-rose-100';
      if (level > 180) return 'text-amber-600 bg-amber-50 border-amber-100';
      return 'text-emerald-600 bg-emerald-50 border-emerald-100';
  };

  const getStatusText = (level: number) => {
      if (level < 70) return 'Low';
      if (level > 180) return 'High';
      return 'Normal';
  };

  // Prepare data for chart (last 7 readings)
  const chartData = vitals.slice(-7).map(v => ({
      time: new Date(v.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      value: v.bloodSugar
  }));

  return (
    <div className="p-4 space-y-6 pb-24 overflow-y-auto h-full bg-slate-50">
      {/* Header Summary */}
      <div className="flex justify-between items-center pt-2">
         <div>
            <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mb-1">
                <Icon size={16} />
                <span>{greeting}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{userProfile.name}</h1>
         </div>
         <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-bold">
             {userProfile.name.charAt(0)}
         </div>
      </div>

      {/* Main Stats Card */}
      <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <div className="flex justify-between items-start mb-6">
              <div>
                  <span className="text-slate-500 text-sm font-medium">Latest Reading</span>
                  <div className="flex items-baseline gap-2 mt-1">
                     <span className={`text-4xl font-bold ${latestVital ? getStatusColor(latestVital.bloodSugar).split(' ')[0] : 'text-slate-300'}`}>
                        {latestVital?.bloodSugar || '--'}
                     </span>
                     <span className="text-slate-400 text-sm">mg/dL</span>
                  </div>
              </div>
              {latestVital && (
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(latestVital.bloodSugar)}`}>
                      {getStatusText(latestVital.bloodSugar)}
                  </span>
              )}
          </div>
          
          <div className="h-40 w-full -ml-2">
            {vitals.length > 1 ? (
                <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                    <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="time" tick={{fontSize: 10, fill: '#94a3b8'}} tickLine={false} axisLine={false} />
                    <Tooltip 
                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    />
                    <ReferenceLine y={70} stroke="#f43f5e" strokeDasharray="3 3" />
                    <ReferenceLine y={180} stroke="#f59e0b" strokeDasharray="3 3" />
                    <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2 border-2 border-dashed border-slate-100 rounded-2xl">
                    <Activity className="w-6 h-6 opacity-50" />
                    <span className="text-sm">Log readings to see your trend</span>
                </div>
            )}
          </div>
      </div>

      {/* Daily Motivation */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex gap-4 items-start">
         <Quote className="w-8 h-8 text-indigo-400 shrink-0 fill-indigo-100" />
         <div>
            <h3 className="font-semibold text-indigo-900 text-sm mb-1">Daily Tip</h3>
            <p className="text-indigo-800 text-sm leading-relaxed opacity-90">{randomTip}</p>
         </div>
      </div>

      {/* Quick Add Button (FAB-like) */}
      <button 
        onClick={() => setShowAddModal(true)}
        className="w-full bg-slate-900 text-white p-5 rounded-2xl shadow-xl shadow-slate-200 flex items-center justify-center gap-3 hover:bg-slate-800 transition-transform active:scale-95 group"
      >
          <div className="bg-white/20 p-1 rounded-full group-hover:rotate-90 transition-transform">
            <Plus className="w-5 h-5" />
          </div>
          <span className="font-semibold text-lg">Log Blood Sugar</span>
      </button>

      {/* History Preview */}
      <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
             <h2 className="text-lg font-semibold text-slate-800">Recent History</h2>
             <span className="text-xs text-slate-400 font-medium">AVG: {avgSugar || 0}</span>
          </div>
          
          <div className="space-y-3">
            {vitals.slice().reverse().slice(0, 5).map(vital => (
                <div key={vital.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center transition-colors hover:border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getStatusColor(vital.bloodSugar)}`}>
                            <Droplet size={20} className="fill-current" />
                        </div>
                        <div>
                            <div className="font-bold text-slate-800 text-lg">{vital.bloodSugar} <span className="text-xs font-normal text-slate-400">mg/dL</span></div>
                            <div className="text-xs text-slate-400">{new Date(vital.timestamp).toLocaleString(undefined, {weekday: 'short', hour: 'numeric', minute: '2-digit'})}</div>
                        </div>
                    </div>
                    <span className="text-xs font-medium px-3 py-1 bg-slate-50 text-slate-500 rounded-full border border-slate-100">
                        {vital.context}
                    </span>
                </div>
            ))}
            {vitals.length === 0 && (
                <p className="text-slate-400 text-center py-8 text-sm bg-white rounded-2xl border border-dashed border-slate-200">
                    No records yet. Start by logging your first reading.
                </p>
            )}
          </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
              <div className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-6 animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 shadow-2xl">
                  <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-6 sm:hidden"></div>
                  <h3 className="text-xl font-bold mb-6 text-center text-slate-800">Log New Reading</h3>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-500 ml-1">Blood Sugar Level</label>
                          <div className="relative">
                            <input 
                                type="number" 
                                autoFocus
                                required
                                value={newReading.level}
                                onChange={e => setNewReading({...newReading, level: e.target.value})}
                                className="w-full text-center p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:bg-white focus:border-emerald-500 outline-none text-3xl font-bold text-slate-900 placeholder:text-slate-200 transition-all"
                                placeholder="000" 
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">mg/dL</span>
                          </div>
                      </div>
                      
                      <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-500 ml-1">Context</label>
                          <div className="grid grid-cols-3 gap-2">
                              {['Fasting', 'Random', 'Post-Meal'].map(ctx => (
                                  <button
                                    key={ctx}
                                    type="button"
                                    onClick={() => setNewReading({...newReading, context: ctx as any})}
                                    className={`py-3 px-2 rounded-xl text-xs font-bold border-2 transition-all ${
                                        newReading.context === ctx 
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-500' 
                                        : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
                                    }`}
                                  >
                                      {ctx}
                                  </button>
                              ))}
                          </div>
                      </div>

                      <div className="flex gap-3 mt-8">
                          <button 
                            type="button" 
                            onClick={() => setShowAddModal(false)}
                            className="flex-1 p-4 rounded-2xl bg-slate-100 font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                          >
                              Cancel
                          </button>
                          <button 
                            type="submit"
                            className="flex-1 p-4 rounded-2xl bg-slate-900 text-white font-bold shadow-lg hover:bg-slate-800 transition-colors"
                          >
                              Save Log
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default Dashboard;