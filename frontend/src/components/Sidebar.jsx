import React, { useState, useEffect } from 'react';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';
import { 
  MessageSquare, Plus, Search, Trash2, Pin, PinOff, Edit2, 
  Settings, LogOut, User, FolderOpen, Menu, X, ArrowLeftRight
} from 'lucide-react';

export default function Sidebar({ isOpen, toggleSidebar, activeSection, setActiveSection, openSettings }) {
  const { chats, activeChatId, fetchChats, createChat, fetchChatDetails, deleteChat, renameChat, togglePinChat } = useChatStore();
  const { user, logout } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => {
    fetchChats();
  }, []);

  const handleCreateNewChat = () => {
    createChat();
    setActiveSection('chat');
  };

  const handleSelectChat = (id) => {
    fetchChatDetails(id);
    setActiveSection('chat');
  };

  const handleStartRename = (e, id, currentTitle) => {
    e.stopPropagation();
    setEditingChatId(id);
    setEditTitle(currentTitle);
  };

  const handleSaveRename = async (id) => {
    if (editTitle.trim()) {
      await renameChat(id, editTitle);
    }
    setEditingChatId(null);
  };

  const filteredChats = chats.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedChats = filteredChats.filter(chat => chat.isPinned);
  const recentChats = filteredChats.filter(chat => !chat.isPinned);

  return (
    <aside className={`glass-panel border-r border-brand-border h-screen flex flex-col transition-all duration-300 z-30 ${isOpen ? 'w-80' : 'w-0 overflow-hidden'}`}>
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-brand-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center font-bold text-white shadow-glow-primary">
            D
          </div>
          <span className="text-xl font-bold tracking-tight text-white bg-clip-text">
            Devora <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary font-extrabold">AI</span>
          </span>
        </div>
        <button onClick={toggleSidebar} className="lg:hidden text-gray-400 hover:text-white">
          <X size={20} />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="p-4 flex flex-col gap-3">
        <button 
          onClick={handleCreateNewChat}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 text-white font-semibold flex items-center justify-center gap-2 shadow-glow-primary transition-all active:scale-[0.98]"
        >
          <Plus size={18} />
          New Chat
        </button>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 text-gray-500" size={16} />
          <input 
            type="text" 
            placeholder="Search conversations..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-brand-dark/40 border border-brand-border focus:border-brand-primary text-sm text-gray-200 outline-none transition-colors"
          />
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="px-4 py-2 flex flex-col gap-1 border-b border-brand-border">
        <span className="text-xs font-bold text-brand-muted uppercase tracking-wider px-2 mb-1">Modules</span>
        <button 
          onClick={() => setActiveSection('chat')}
          className={`w-full py-2 px-3 rounded-lg flex items-center gap-3 text-sm font-medium transition-colors ${activeSection === 'chat' ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
        >
          <MessageSquare size={16} />
          AI Reasoning Chat
        </button>
        <button 
          onClick={() => setActiveSection('image-generator')}
          className={`w-full py-2 px-3 rounded-lg flex items-center gap-3 text-sm font-medium transition-colors ${activeSection === 'image-generator' ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
        >
          <FolderOpen size={16} />
          Image Generator
        </button>
        <button 
          onClick={() => setActiveSection('tools')}
          className={`w-full py-2 px-3 rounded-lg flex items-center gap-3 text-sm font-medium transition-colors ${activeSection === 'tools' ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
        >
          <ArrowLeftRight size={16} />
          AI Tools Page
        </button>
      </div>

      {/* Chats History List */}
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-4">
        {/* Pinned Chats */}
        {pinnedChats.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 px-3 text-xs font-semibold text-brand-secondary uppercase tracking-wider mb-2">
              <Pin size={10} className="rotate-45" />
              Pinned
            </div>
            <div className="space-y-1">
              {pinnedChats.map((chat) => (
                <ChatListItem 
                  key={chat._id} 
                  chat={chat} 
                  activeChatId={activeChatId}
                  editingChatId={editingChatId}
                  editTitle={editTitle}
                  setEditTitle={setEditTitle}
                  onSelect={handleSelectChat}
                  onStartRename={handleStartRename}
                  onSaveRename={handleSaveRename}
                  onDelete={deleteChat}
                  onTogglePin={togglePinChat}
                />
              ))}
            </div>
          </div>
        )}

        {/* Recent Chats */}
        <div>
          <div className="px-3 text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">
            Recent Conversations
          </div>
          {recentChats.length === 0 && pinnedChats.length === 0 ? (
            <div className="text-center text-xs text-brand-muted py-6">
              No conversations found.
            </div>
          ) : (
            <div className="space-y-1">
              {recentChats.map((chat) => (
                <ChatListItem 
                  key={chat._id} 
                  chat={chat} 
                  activeChatId={activeChatId}
                  editingChatId={editingChatId}
                  editTitle={editTitle}
                  setEditTitle={setEditTitle}
                  onSelect={handleSelectChat}
                  onStartRename={handleStartRename}
                  onSaveRename={handleSaveRename}
                  onDelete={deleteChat}
                  onTogglePin={togglePinChat}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* User / Settings Footer */}
      <div className="p-4 border-t border-brand-border flex flex-col gap-2 bg-brand-dark/25">
        <button 
          onClick={openSettings}
          className="w-full py-2 px-3 rounded-lg flex items-center gap-3 text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
        >
          <Settings size={16} />
          Settings & Control Center
        </button>

        {user && (
          <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center text-brand-primary font-bold shrink-0">
                {user.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                  user.fullName.charAt(0)
                )}
              </div>
              <div className="text-left overflow-hidden">
                <p className="text-xs font-semibold text-white truncate leading-tight">{user.fullName}</p>
                <p className="text-[10px] text-brand-muted truncate mt-0.5">@{user.username}</p>
              </div>
            </div>
            <button 
              onClick={logout} 
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Sign Out"
            >
              <LogOut size={15} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

function ChatListItem({ 
  chat, activeChatId, editingChatId, editTitle, setEditTitle, 
  onSelect, onStartRename, onSaveRename, onDelete, onTogglePin 
}) {
  const isEditing = editingChatId === chat._id;
  const isActive = activeChatId === chat._id;

  return (
    <div 
      onClick={() => !isEditing && onSelect(chat._id)}
      className={`group relative p-2.5 rounded-xl flex items-center justify-between gap-2 text-sm cursor-pointer transition-all border ${isActive ? 'bg-brand-primary/10 border-brand-primary/30 text-white' : 'border-transparent text-gray-400 hover:bg-white/5 hover:text-white'}`}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <MessageSquare size={15} className={isActive ? 'text-brand-primary' : 'text-gray-500'} />
        {isEditing ? (
          <input 
            type="text" 
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={() => onSaveRename(chat._id)}
            onKeyDown={(e) => e.key === 'Enter' && onSaveRename(chat._id)}
            autoFocus
            className="bg-brand-dark border border-brand-primary/50 text-white px-2 py-0.5 rounded text-xs outline-none w-full"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="truncate text-xs font-medium">{chat.title}</span>
        )}
      </div>

      {!isEditing && (
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 transition-opacity duration-150 shrink-0">
          <button 
            onClick={(e) => { e.stopPropagation(); onTogglePin(chat._id); }}
            className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
          >
            {chat.isPinned ? <PinOff size={12} /> : <Pin size={12} className="rotate-45" />}
          </button>
          <button 
            onClick={(e) => onStartRename(e, chat._id, chat.title)}
            className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
          >
            <Edit2 size={12} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(chat._id); }}
            className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
