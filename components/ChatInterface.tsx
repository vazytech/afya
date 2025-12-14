import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Loader2, Info, Sparkles, Mic, Volume2, VolumeX } from 'lucide-react';
import { ChatMessage, UserProfile, VitalLog } from '../types';
import { sendMessageToAfya, initializeChat } from '../services/geminiService';

interface ChatInterfaceProps {
  userProfile: UserProfile;
  vitals: VitalLog[];
}

const SUGGESTIONS = [
  "Suggest a diabetic-friendly breakfast",
  "I feel a bit shaky and dizzy",
  "Can I exercise right now?",
  "How can I lower my stress?"
];

// Augment window for SpeechRecognition types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ userProfile, vitals }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Hello ${userProfile.name}, I'm AFYA. I'm here to listen. \n\nYou can type or speak to me.`,
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeChat(userProfile, vitals);
  }, [userProfile, vitals]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const speakText = (text: string) => {
    if (!voiceEnabled) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    // Try to find a nice voice
    const voices = window.speechSynthesis.getVoices();
    const friendlyVoice = voices.find(v => v.name.includes("Female") || v.name.includes("Google US English")) || voices[0];
    if (friendlyVoice) utterance.voice = friendlyVoice;
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      handleSend(transcript); // Auto-send when speaking finishes
    };

    recognition.start();
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await sendMessageToAfya(text, userProfile, vitals);
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);
      speakText(responseText);
    } catch (error) {
       console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  return (
    <div className="flex flex-col h-full bg-teal-50/50 relative">
      {/* Voice Toggle Header */}
      <div className="absolute top-2 right-4 z-10">
          <button 
            onClick={() => {
                setVoiceEnabled(!voiceEnabled);
                window.speechSynthesis.cancel();
            }}
            className={`p-2 rounded-full shadow-sm transition-colors ${voiceEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}
          >
              {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-40" id="chat-container">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
          >
            <div className={`flex max-w-[85%] md:max-w-[70%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white text-emerald-600 border border-emerald-100'}`}>
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              
              <div className={`p-4 rounded-2xl shadow-sm text-[15px] leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
           <div className="flex justify-start w-full animate-pulse">
               <div className="flex gap-2 bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm items-center">
                   <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                   <span className="text-slate-400 text-sm font-medium">AFYA is thinking...</span>
               </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {/* Quick Suggestions */}
        {messages.length < 3 && !isLoading && (
            <div className="px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
                {SUGGESTIONS.map((suggestion, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleSend(suggestion)}
                        className="flex-shrink-0 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-xs font-medium border border-emerald-100 hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
                    >
                        <Sparkles size={12} />
                        {suggestion}
                    </button>
                ))}
            </div>
        )}

        <div className="p-4 max-w-4xl mx-auto">
            <div className="flex gap-2 items-end bg-slate-50 p-2 rounded-3xl border border-slate-200 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 transition-all shadow-inner">
                <textarea 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type or tap the mic to speak..."
                    className="flex-1 p-3 bg-transparent border-none outline-none text-slate-800 resize-none max-h-32 min-h-[44px]"
                    rows={1}
                />
                
                {/* Microphone Button */}
                <button
                    onClick={startListening}
                    disabled={isLoading || isListening}
                    className={`p-3 rounded-full transition-all shadow-sm mb-0.5 ${
                        isListening 
                        ? 'bg-rose-500 text-white animate-pulse' 
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                >
                    <Mic size={18} />
                </button>

                {/* Send Button */}
                <button 
                    onClick={() => handleSend(input)}
                    disabled={isLoading || !input.trim()}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-full transition-all shadow-md active:scale-95 mb-0.5"
                >
                    <Send size={18} />
                </button>
            </div>
            <div className="text-center mt-2">
                <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                    <Info size={10} />
                    Voice data is processed by your browser.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;