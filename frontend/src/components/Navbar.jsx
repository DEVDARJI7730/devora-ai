import React from 'react';
import { useChatStore } from '../store/useChatStore';
import { Menu, Cpu, Sparkles, Zap, Plus, Trash2 } from 'lucide-react';

export default function Navbar({ toggleSidebar, sidebarOpen, activeSection, openSettings }) {
  const { selectedModel, setSelectedModel, activeChat, createChat, clearAllChats } = useChatStore();

  const handleResetChat = () => {
    createChat('New Chat');
  };

  const getSectionTitle = () => {
    switch(activeSection) {
      case 'chat':
        return activeChat ? activeChat.title : 'AI Reasoning Chat';
      case 'image-generator':
        return 'Stable Diffusion Image Generator';
      case 'tools':
        return 'Productivity AI Tools Hub';
      default:
        return 'Devora AI Dashboard';
    }
  };

  return (
    <nav className="glass-panel border-b border-brand-border h-16 px-4 md:px-6 flex items-center justify-between shrink-0 z-20">
      <div className="flex items-center gap-3">
        <button 
          onClick={toggleSidebar}
          className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
        >
          <Menu size={20} />
        </button>
        <span className="text-sm font-semibold text-gray-200 hidden md:inline-block max-w-[240px] truncate">
          {getSectionTitle()}
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Model Selector (Visible in Chat Section) */}
        {activeSection === 'chat' && (
          <div className="flex items-center gap-2">
            <Cpu size={15} className="text-brand-primary" />
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-brand-dark/60 border border-brand-border text-gray-300 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:border-brand-primary outline-none cursor-pointer"
            >
              <option value="gemini">♊ Gemini 2.5 Flash (Free)</option>
              <option value="openai">🤖 OpenAI GPT-4o (Simulated)</option>
              <option value="claude">🧠 Claude 3.5 Sonnet (Simulated)</option>
            </select>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          {activeSection === 'chat' && (
            <button 
              onClick={handleResetChat}
              className="p-2 text-gray-400 hover:text-white hover:bg-brand-primary/10 hover:text-brand-primary rounded-xl border border-brand-border hover:border-brand-primary/20 transition-all text-xs flex items-center gap-1.5"
              title="Start New Chat"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">New Chat</span>
            </button>
          )}

          <button
            onClick={openSettings}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 border border-brand-border rounded-xl transition-all text-xs"
          >
            Control Center
          </button>
        </div>
      </div>
    </nav>
  );
}
