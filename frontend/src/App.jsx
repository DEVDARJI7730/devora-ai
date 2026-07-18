import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { useChatStore } from './store/useChatStore';

// Import Pages
import LandingPage from './pages/LandingPage';
import { LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage } from './pages/AuthPages';

// Import Components
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ChatWindow from './components/ChatWindow';
import ImageGenWindow from './components/ImageGenWindow';
import AIToolsWindow from './components/AIToolsWindow';

// Icons
import { X, RefreshCw, Save, ShieldAlert, Key, User as UserIcon, LogOut } from 'lucide-react';
import axios from 'axios';

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05070f] text-brand-primary">
        <RefreshCw className="animate-spin" size={32} />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// ----------------------------------------------------
// SETTINGS / CONTROL CENTER DIALOG COMPONENT
// ----------------------------------------------------
function SettingsModal({ isOpen, onClose }) {
  const { user, updateProfile, changePassword, deleteAccount } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');

  // Profile forms
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  // Passwords form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Status indicators
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [isError, setIsError] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMsg('');
    const success = await updateProfile({ fullName, username, email, avatar });
    setIsSaving(false);
    
    if (success) {
      setMsg('Profile details updated successfully!');
      setIsError(false);
    } else {
      setMsg('Failed to update profile. Username/Email may be taken.');
      setIsError(true);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setMsg('Please fill in both password fields.');
      setIsError(true);
      return;
    }
    
    setIsSaving(true);
    setMsg('');
    const success = await changePassword(currentPassword, newPassword);
    setIsSaving(false);

    if (success) {
      setMsg('Password updated successfully!');
      setIsError(false);
      setCurrentPassword('');
      setNewPassword('');
    } else {
      setMsg('Password update failed. Verify current credentials.');
      setIsError(true);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('WARNING: Are you sure you want to permanently delete your Devora AI account? This action is irreversible.')) {
      await deleteAccount();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#0b0e1a] border border-brand-border rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[500px]">
        
        {/* Settings Navigation Sidebar */}
        <div className="w-full md:w-48 border-b md:border-b-0 md:border-r border-brand-border p-4 bg-brand-dark/20 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible shrink-0">
          <button 
            onClick={() => { setActiveTab('profile'); setMsg(''); }}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold text-left shrink-0 transition-colors ${activeTab === 'profile' ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20' : 'text-gray-400 hover:bg-white/5'}`}
          >
            Edit Profile
          </button>
          <button 
            onClick={() => { setActiveTab('security'); setMsg(''); }}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold text-left shrink-0 transition-colors ${activeTab === 'security' ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20' : 'text-gray-400 hover:bg-white/5'}`}
          >
            Security & Keys
          </button>
          <button 
            onClick={() => { setActiveTab('danger'); setMsg(''); }}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold text-left shrink-0 transition-colors ${activeTab === 'danger' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'text-gray-400 hover:bg-white/5'}`}
          >
            Danger Zone
          </button>
        </div>

        {/* Settings Canvas Pane */}
        <div className="flex-1 p-6 flex flex-col justify-between overflow-y-auto relative">
          <div>
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-lg font-bold text-white uppercase tracking-tight">Control Settings</h3>
              <button onClick={onClose} className="p-1 rounded bg-white/5 text-gray-500 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Notifications */}
            {msg && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 mb-4 border ${isError ? 'bg-red-500/15 border-red-500/20 text-red-400' : 'bg-brand-secondary/15 border-brand-secondary/20 text-brand-secondary'}`}>
                <ShieldAlert size={14} className="shrink-0" />
                <span>{msg}</span>
              </div>
            )}

            {/* Profile Panel */}
            {activeTab === 'profile' && (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Full Name</label>
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-brand-dark/50 border border-brand-border focus:border-brand-primary text-xs text-gray-200 outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Username</label>
                    <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-brand-dark/50 border border-brand-border focus:border-brand-primary text-xs text-gray-200 outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Email Address</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-brand-dark/50 border border-brand-border focus:border-brand-primary text-xs text-gray-200 outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Avatar Image URL</label>
                  <input 
                    type="text" 
                    value={avatar}
                    placeholder="https://example.com/pic.jpg"
                    onChange={(e) => setAvatar(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-brand-dark/50 border border-brand-border focus:border-brand-primary text-xs text-gray-200 outline-none"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white text-xs font-bold flex items-center gap-1.5 shadow-glow-primary ml-auto active:scale-95 transition-transform disabled:opacity-50"
                >
                  <Save size={13} />
                  {isSaving ? 'Saving...' : 'Save Profile'}
                </button>
              </form>
            )}

            {/* Security Panel */}
            {activeTab === 'security' && (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Current Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-brand-dark/50 border border-brand-border focus:border-brand-primary text-xs text-gray-200 outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">New Password</label>
                  <input 
                    type="password" 
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-brand-dark/50 border border-brand-border focus:border-brand-primary text-xs text-gray-200 outline-none"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white text-xs font-bold flex items-center gap-1.5 shadow-glow-primary ml-auto active:scale-95 transition-transform disabled:opacity-50"
                >
                  <Key size={13} />
                  {isSaving ? 'Updating...' : 'Change Password'}
                </button>
              </form>
            )}

            {/* Danger Zone Panel */}
            {activeTab === 'danger' && (
              <div className="p-4 border border-red-500/20 bg-red-500/5 rounded-2xl space-y-4">
                <div className="flex gap-3">
                  <ShieldAlert size={20} className="text-red-400 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Delete Account Permanent</h4>
                    <p className="text-[11px] text-brand-muted mt-1 leading-normal">
                      Once deleted, all your profile details, chat memory logs, generated templates, and Cloudinary references will be permanently destroyed.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="py-2 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-colors active:scale-95"
                >
                  Delete Account Permanently
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// ----------------------------------------------------
// PROTECTED DASHBOARD CONTAINER
// ----------------------------------------------------
function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('chat'); // 'chat' | 'image-generator' | 'tools'
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="h-screen w-screen flex bg-[#05070f] overflow-hidden text-gray-100">
      
      {/* Sidebar Navigation */}
      <Sidebar 
        isOpen={sidebarOpen} 
        toggleSidebar={toggleSidebar}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        openSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Panel Content Router */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Dynamic Nav Header */}
        <Navbar 
          toggleSidebar={toggleSidebar}
          sidebarOpen={sidebarOpen}
          activeSection={activeSection}
          openSettings={() => setIsSettingsOpen(true)}
        />

        {/* Panel sections mapping */}
        <main className="flex-1 overflow-hidden relative">
          {activeSection === 'chat' && <ChatWindow />}
          {activeSection === 'image-generator' && <ImageGenWindow />}
          {activeSection === 'tools' && <AIToolsWindow />}
        </main>
      </div>

      {/* Control Center Popup */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

// ----------------------------------------------------
// APP INITIAL ROUTER
// ----------------------------------------------------
export default function App() {
  const { checkAuth, token } = useAuthStore();

  useEffect(() => {
    // Fired on boot up to restore session token state
    checkAuth();
  }, [token]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing Pages */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Public Auth Pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Protected Dashboard Route */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          } 
        />

        {/* Fallback redirector */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
