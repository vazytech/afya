import React, { useState } from 'react';
import { UserProfile, DiabetesType, Gender } from '../types';
import { Save } from 'lucide-react';

interface ProfileSettingsProps {
  profile: UserProfile;
  onSave: (p: UserProfile) => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ profile, onSave }) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [tempMed, setTempMed] = useState('');

  const handleChange = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addMed = () => {
    if (tempMed.trim()) {
      setFormData(prev => ({
        ...prev,
        medications: [...prev.medications, tempMed.trim()]
      }));
      setTempMed('');
    }
  };

  const removeMed = (index: number) => {
    setFormData(prev => ({
        ...prev,
        medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(formData);
  };

  return (
    <div className="p-4 pb-24 h-full overflow-y-auto bg-slate-50">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Health Profile</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Info */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                <h3 className="font-semibold text-slate-800 border-b pb-2">Personal Details</h3>
                
                <div>
                    <label className="block text-sm text-slate-500 mb-1">Full Name</label>
                    <input 
                        className="w-full p-3 bg-slate-50 rounded-xl border outline-none focus:ring-2 focus:ring-emerald-500"
                        value={formData.name}
                        onChange={e => handleChange('name', e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-slate-500 mb-1">Age</label>
                        <input 
                            type="number"
                            className="w-full p-3 bg-slate-50 rounded-xl border outline-none focus:ring-2 focus:ring-emerald-500"
                            value={formData.age}
                            onChange={e => handleChange('age', parseInt(e.target.value))}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-500 mb-1">Gender</label>
                        <select 
                            className="w-full p-3 bg-slate-50 rounded-xl border outline-none focus:ring-2 focus:ring-emerald-500"
                            value={formData.gender}
                            onChange={e => handleChange('gender', e.target.value)}
                        >
                            {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Medical Info */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                <h3 className="font-semibold text-slate-800 border-b pb-2">Diabetes Condition</h3>
                
                <div>
                    <label className="block text-sm text-slate-500 mb-1">Type</label>
                    <select 
                        className="w-full p-3 bg-slate-50 rounded-xl border outline-none focus:ring-2 focus:ring-emerald-500"
                        value={formData.diabetesType}
                        onChange={e => handleChange('diabetesType', e.target.value)}
                    >
                        {Object.values(DiabetesType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm text-slate-500 mb-1">Medications</label>
                    <div className="flex gap-2 mb-2">
                        <input 
                            className="flex-1 p-2 bg-slate-50 rounded-xl border outline-none text-sm"
                            placeholder="Add medication (e.g. Metformin)"
                            value={tempMed}
                            onChange={e => setTempMed(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addMed())}
                        />
                        <button 
                            type="button" 
                            onClick={addMed}
                            className="bg-slate-200 text-slate-700 px-4 rounded-xl text-sm font-medium"
                        >Add</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {formData.medications.map((med, idx) => (
                            <span key={idx} className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                {med}
                                <button type="button" onClick={() => removeMed(idx)} className="hover:text-emerald-900">&times;</button>
                            </span>
                        ))}
                    </div>
                </div>
            </div>

             {/* Emergency Contact */}
             <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                <h3 className="font-semibold text-rose-600 border-b pb-2">Emergency Contact</h3>
                
                <div>
                    <label className="block text-sm text-slate-500 mb-1">Contact Name</label>
                    <input 
                        className="w-full p-3 bg-slate-50 rounded-xl border outline-none focus:ring-2 focus:ring-rose-500"
                        value={formData.emergencyContactName}
                        onChange={e => handleChange('emergencyContactName', e.target.value)}
                    />
                </div>
                 <div>
                    <label className="block text-sm text-slate-500 mb-1">Phone Number</label>
                    <input 
                        type="tel"
                        className="w-full p-3 bg-slate-50 rounded-xl border outline-none focus:ring-2 focus:ring-rose-500"
                        value={formData.emergencyContactPhone}
                        onChange={e => handleChange('emergencyContactPhone', e.target.value)}
                    />
                </div>
            </div>

            <button 
                type="submit"
                className="w-full bg-emerald-600 text-white p-4 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors"
            >
                <Save className="w-5 h-5" />
                Save Profile
            </button>
        </form>
    </div>
  );
};

export default ProfileSettings;
