import React, { useState } from 'react';
import {
  BotMessageSquare,
  Send,
  Sparkles,
  User,
  ShieldCheck,
  AlertCircle,
  FileText,
  Pill,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { PatientProfile, Prescription, CopilotMessage } from '../../types';
import { askHealthCopilot } from '../../lib/api';

interface HealthCopilotProps {
  patientProfile: PatientProfile;
  prescriptions: Prescription[];
}

const QUICK_PROMPTS = [
  'Summarize my active medications & daily timings',
  'Do any of my medications clash or interact negatively?',
  'Explain my latest HbA1c 6.8% and fasting glucose lab report',
  'Why is Penicillin completely blocked for me?',
];

export const HealthCopilot: React.FC<HealthCopilotProps> = ({
  patientProfile,
  prescriptions,
}) => {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'msg_initial',
      sender: 'assistant',
      content: `Hello ${patientProfile.fullName}. I am your **DawaVerify X Clinical Copilot**, synchronized with your active prescriptions, Chughtai pathology lab reports, and allergy profile.\n\n* **Active Regimen:** Lisinopril 10mg, Metformin 850mg BID, Atorvastatin 20mg, CoQ10 100mg.\n* **Critical Guardrail:** Life-Threatening Penicillin Anaphylaxis protection enabled.\n\nHow can I assist your health management today?`,
      timestamp: 'Just now',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (textToSend = inputMessage) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: CopilotMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    const activeMedsList = prescriptions.flatMap((p) => p.medicines.map((m) => `${m.brandName} (${m.dosage})`));

    try {
      const replyText = await askHealthCopilot(textToSend, patientProfile, activeMedsList);

      const assistantMsg: CopilotMessage = {
        id: `msg_ai_${Date.now()}`,
        sender: 'assistant',
        content: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 h-[calc(100vh-10rem)] min-h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
              GEMINI 3.8 FLASH CLINICAL AGENT
            </span>
            <span className="text-xs text-slate-400">Context Memory Window: Active Records</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">AI Health Copilot</h2>
        </div>

        {/* Clinical Guardrail Indicator */}
        <div className="flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-800/40 font-medium">
          <ShieldCheck className="w-4 h-4" />
          <span>Patient Vault Context Attached</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-3xl ${
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold ${
                msg.sender === 'user'
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                  : 'bg-gradient-to-br from-cyan-500 to-teal-600 text-white shadow-md shadow-cyan-500/20'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <BotMessageSquare className="w-4 h-4" />}
            </div>

            <div className="space-y-1">
              <div
                className={`p-4 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-teal-600 text-white font-medium rounded-tr-none'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm'
                }`}
              >
                <div className="whitespace-pre-line prose prose-invert max-w-none text-xs">
                  {msg.content}
                </div>
              </div>
              <div
                className={`text-[10px] text-slate-400 font-mono px-1 ${
                  msg.sender === 'user' ? 'text-right' : 'text-left'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 max-w-3xl mr-auto">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center animate-pulse">
              <BotMessageSquare className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-400" />
              <span>Synthesizing pharmacological knowledge & patient history...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
        <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0">Quick Queries:</span>
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            disabled={isLoading}
            className="text-[11px] whitespace-nowrap px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-teal-500/40 text-slate-300 hover:text-white transition-all disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="relative shrink-0">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask anything about your medicines, lab values, side effects, or drug interactions..."
          className="w-full text-xs pr-12 pl-4 py-3.5 rounded-2xl bg-slate-900 border border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-slate-100 outline-none shadow-lg transition-all"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={!inputMessage.trim() || isLoading}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 flex items-center justify-center transition-all disabled:opacity-40 disabled:hover:bg-teal-500"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Safety Disclaimer */}
      <div className="text-[10px] text-slate-400 text-center shrink-0">
        ⚠️ <strong>Clinical Notice:</strong> DawaVerify X Copilot is an AI decision-support platform designed to assist and explain. It does not supersede direct medical orders from your licensed attending physician.
      </div>
    </div>
  );
};
