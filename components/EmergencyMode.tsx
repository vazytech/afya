import React, { useEffect, useState } from 'react';
import { Phone, AlertTriangle, ShieldAlert, X, Volume2, VolumeX } from 'lucide-react';
import { UserProfile } from '../types';

interface EmergencyModeProps {
  userProfile: UserProfile;
  onExit: () => void;
}

const EmergencyMode: React.FC<EmergencyModeProps> = ({ userProfile, onExit }) => {
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    // Voice guidance logic
    const text = `Emergency mode active. Stay calm. If you have severe symptoms like confusion or fainting, please call emergency services immediately. If your blood sugar is low, consume 15 grams of sugar now.`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1;
    
    if (!isMuted) {
        window.speechSynthesis.cancel(); // Cancel any previous speech
        window.speechSynthesis.speak(utterance);
    }

    return () => {
        window.speechSynthesis.cancel();
    };
  }, [isMuted]);

  return (
    <div className="fixed inset-0 bg-rose-600 z-50 flex flex-col text-white animate-in fade-in duration-300">
      <div className="flex justify-between items-center p-6">
        <div className="flex items-center gap-3">
           <ShieldAlert className="w-8 h-8 animate-pulse" />
           <span className="text-2xl font-bold tracking-wider">EMERGENCY</span>
        </div>
        <div className="flex gap-4">
            <button 
                onClick={() => setIsMuted(!isMuted)}
                className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors"
            >
                {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            </button>
            <button 
                onClick={onExit}
                className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors"
                aria-label="Exit Emergency Mode"
            >
                <X className="w-6 h-6" />
            </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center px-6 gap-6 overflow-y-auto pt-4">
        
        <div className="text-center space-y-4 max-w-md">
            <div className="bg-white/10 p-4 rounded-full w-fit mx-auto backdrop-blur-md">
                <AlertTriangle className="w-16 h-16 text-yellow-300" />
            </div>
            <h2 className="text-3xl font-bold leading-tight">Need Help?</h2>
            <p className="text-rose-100 text-lg leading-relaxed">
                If you feel confused, faint, or have severe chest pain, 
                <strong> do not wait.</strong>
            </p>
        </div>

        <div className="w-full max-w-md space-y-4 mt-4">
            <a 
                href="tel:911" 
                className="group flex items-center justify-center gap-4 w-full bg-white text-rose-600 p-6 rounded-3xl font-bold text-2xl shadow-xl hover:bg-gray-50 transition-all active:scale-95"
            >
                <div className="bg-rose-100 p-3 rounded-full group-hover:bg-rose-200 transition-colors">
                    <Phone className="w-8 h-8 fill-current" />
                </div>
                Call 911
            </a>

            {userProfile.emergencyContactPhone && (
                 <a 
                 href={`tel:${userProfile.emergencyContactPhone}`}
                 className="flex items-center justify-center gap-4 w-full bg-rose-800 border-2 border-rose-400/50 text-white p-6 rounded-3xl font-bold text-xl shadow-lg hover:bg-rose-700 transition-all active:scale-95"
             >
                 <Phone className="w-6 h-6" />
                 Call {userProfile.emergencyContactName}
             </a>
            )}
        </div>

        <div className="bg-rose-800/40 p-6 rounded-2xl w-full max-w-md backdrop-blur-sm border border-rose-500/30 mt-4">
            <h3 className="font-semibold text-rose-200 mb-4 uppercase text-xs tracking-widest text-center">Medical ID Card</h3>
            <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-rose-500/30 pb-2">
                    <span className="text-rose-200 text-sm">Patient</span>
                    <span className="font-bold text-lg">{userProfile.name}</span>
                </div>
                <div className="flex justify-between items-center border-b border-rose-500/30 pb-2">
                    <span className="text-rose-200 text-sm">Condition</span>
                    <span className="font-bold text-lg">{userProfile.diabetesType}</span>
                </div>
                <div>
                    <span className="block text-rose-200 text-sm mb-1">Medications</span>
                    <span className="font-medium bg-rose-900/50 px-2 py-1 rounded text-sm">
                        {userProfile.medications.length > 0 ? userProfile.medications.join(', ') : 'None listed'}
                    </span>
                </div>
            </div>
        </div>
      </div>
      
      <div className="p-6 text-center text-rose-200/80 text-xs">
        AFYA supports you, but cannot replace emergency medical care.
      </div>
    </div>
  );
};

export default EmergencyMode;