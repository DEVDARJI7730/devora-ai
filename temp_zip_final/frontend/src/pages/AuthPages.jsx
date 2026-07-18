import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { 
  Mail, Lock, User, Eye, EyeOff, Sparkles, 
  ArrowRight, KeyRound, CheckCircle, RefreshCw, AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

// ----------------------------------------------------
// SIGN IN PAGE
// ----------------------------------------------------
export function LoginPage() {
  const navigate = useNavigate();
  const { login, googleLogin, error, clearError, loading } = useAuthStore();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleSignIn = async (e) => {
    e.preventDefault();
    setValidationError('');
    clearError();

    if (!emailOrUsername.trim() || !password.trim()) {
      setValidationError('Please enter all credentials');
      return;
    }

    const success = await login(emailOrUsername, password);
    if (success) {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.85 } });
      navigate('/dashboard');
    }
  };

  const handleMockGoogleLogin = async () => {
    // Generate a simulated google profile to trigger backend registration
    const mockProfile = {
      email: 'tester.devora@gmail.com',
      name: 'Devora Beta Tester',
      googleId: 'g_1029384756102938',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'
    };

    const success = await googleLogin(null, mockProfile);
    if (success) {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.85 } });
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#05070f] px-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/10 rounded-full blur-[100px]"></div>
      
      <div className="w-full max-w-md p-6 md:p-8 rounded-3xl glass-panel relative z-10 space-y-6 shadow-glow-primary">
        {/* Brand */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center font-extrabold text-white text-xl mx-auto mb-4">
            D
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Welcome Back</h2>
          <p className="text-xs text-brand-muted mt-1.5">Sign in to sync your intelligent workspaces</p>
        </div>

        {/* Error Banners */}
        {(error || validationError) && (
          <div className="p-3 bg-red-500/15 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0" />
            <span>{validationError || error}</span>
          </div>
        )}

        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Email or Username</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 text-gray-500" size={16} />
              <input
                type="text"
                placeholder="developer@devora.ai"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-brand-dark/40 border border-brand-border focus:border-brand-primary text-sm text-gray-200 outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Password</label>
              <Link to="/forgot-password" className="text-[10px] font-semibold text-brand-primary hover:underline">Forgot password?</Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 text-gray-500" size={16} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-brand-dark/40 border border-brand-border focus:border-brand-primary text-sm text-gray-200 outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-500 hover:text-white"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 disabled:opacity-50 text-white font-bold text-sm shadow-glow-primary active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 mt-6"
          >
            {loading ? <RefreshCw className="animate-spin" size={16} /> : 'Sign In'}
            {!loading && <ArrowRight size={15} />}
          </button>
        </form>

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-brand-border w-full"></div>
          <span className="bg-[#0c0f1b] px-3 text-[10px] text-gray-500 font-bold uppercase tracking-wider absolute">or</span>
        </div>

        {/* Google Authentication Button */}
        <button
          onClick={handleMockGoogleLogin}
          className="w-full py-3.5 px-4 rounded-xl border border-brand-border bg-white/5 hover:bg-white/10 text-white font-semibold text-xs transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 5.04c1.62 0 3.08.56 4.22 1.64l3.15-3.15C17.45 1.71 14.92 1 12 1 7.35 1 3.39 3.67 1.5 7.57l3.69 2.87C6.07 7.21 8.81 5.04 12 5.04z"/>
            <path fill="#4285F4" d="M23.49 12.27c0-.82-.07-1.61-.21-2.38H12v4.51h6.44c-.28 1.48-1.12 2.73-2.38 3.58l3.69 2.87c2.16-1.99 3.74-4.92 3.74-8.58z"/>
            <path fill="#FBBC05" d="M5.19 14.86c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29L1.5 7.41C.54 9.33 0 11.48 0 13.73s.54 4.4 1.5 6.32l3.69-2.87z"/>
            <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.69-2.87c-1.1.74-2.52 1.18-4.27 1.18-3.19 0-5.93-2.17-6.89-5.41L1.42 15.8C3.31 19.72 7.31 23 12 23z"/>
          </svg>
          Continue with Google
        </button>

        <p className="text-center text-xs text-brand-muted">
          New to Devora? <Link to="/register" className="text-brand-primary font-semibold hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// SIGN UP PAGE
// ----------------------------------------------------
export function RegisterPage() {
  const navigate = useNavigate();
  const { register, error, clearError, loading } = useAuthStore();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setValidationError('');
    clearError();

    if (!fullName.trim() || !username.trim() || !email.trim() || !password.trim()) {
      setValidationError('Please fill in all inputs');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return;
    }

    const success = await register(fullName, username, email, password);
    if (success) {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.85 } });
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#05070f] px-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/10 rounded-full blur-[100px]"></div>

      <div className="w-full max-w-md p-6 md:p-8 rounded-3xl glass-panel relative z-10 space-y-5 shadow-glow-primary my-10">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center font-extrabold text-white text-xl mx-auto mb-4">
            D
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Create Account</h2>
          <p className="text-xs text-brand-muted mt-1.5">Join the workspace for intelligence</p>
        </div>

        {(error || validationError) && (
          <div className="p-3 bg-red-500/15 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0" />
            <span>{validationError || error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-3.5">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 text-gray-500" size={16} />
              <input
                type="text"
                placeholder="Steve Jobs"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-brand-dark/40 border border-brand-border focus:border-brand-primary text-xs text-gray-200 outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Username</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 text-gray-500" size={16} />
              <input
                type="text"
                placeholder="steve_jobs"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-brand-dark/40 border border-brand-border focus:border-brand-primary text-xs text-gray-200 outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 text-gray-500" size={16} />
              <input
                type="email"
                placeholder="steve@apple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-brand-dark/40 border border-brand-border focus:border-brand-primary text-xs text-gray-200 outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 text-gray-500" size={16} />
              <input
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-brand-dark/40 border border-brand-border focus:border-brand-primary text-xs text-gray-200 outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 text-gray-500" size={16} />
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-brand-dark/40 border border-brand-border focus:border-brand-primary text-xs text-gray-200 outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 disabled:opacity-50 text-white font-bold text-xs shadow-glow-primary active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 mt-5"
          >
            {loading ? <RefreshCw className="animate-spin" size={14} /> : 'Create Account'}
            {!loading && <ArrowRight size={14} />}
          </button>
        </form>

        <p className="text-center text-xs text-brand-muted">
          Already registered? <Link to="/login" className="text-brand-primary font-semibold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// FORGOT PASSWORD PAGE
// ----------------------------------------------------
export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [devOtp, setDevOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post('/api/auth/forgot-password', { email });
      if (res.data.success) {
        setIsSent(true);
        if (res.data.devOtp) {
          setDevOtp(res.data.devOtp);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Email lookup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#05070f] px-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/10 rounded-full blur-[100px]"></div>

      <div className="w-full max-w-md p-6 md:p-8 rounded-3xl glass-panel relative z-10 space-y-6 shadow-glow-primary">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center font-extrabold text-white text-xl mx-auto mb-4">
            D
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Forgot Password</h2>
          <p className="text-xs text-brand-muted mt-1.5">Recover your access key</p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/15 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        {isSent ? (
          <div className="space-y-4">
            <div className="p-4 bg-brand-secondary/10 border border-brand-secondary/25 rounded-2xl text-center space-y-2">
              <CheckCircle className="text-brand-secondary mx-auto" size={24} />
              <p className="text-xs font-bold text-white">Reset Code Sent Successfully</p>
              <p className="text-[11px] text-brand-muted">Check your inbox for password credentials update.</p>
            </div>
            
            {devOtp && (
              <div className="p-3 bg-brand-primary/10 border border-brand-primary/20 rounded-xl text-center">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Developer Testing Code (OTP)</span>
                <span className="text-lg font-mono font-extrabold text-brand-primary tracking-widest">{devOtp}</span>
              </div>
            )}

            <div className="text-center pt-2">
              <Link 
                to={`/reset-password?email=${encodeURIComponent(email)}`}
                className="inline-flex items-center gap-1.5 text-xs text-brand-primary font-bold hover:underline"
              >
                Proceed to Reset Password
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 text-gray-500" size={16} />
                <input
                  type="email"
                  placeholder="steve@apple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-brand-dark/40 border border-brand-border focus:border-brand-primary text-sm text-gray-200 outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 disabled:opacity-50 text-white font-bold text-sm shadow-glow-primary active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 mt-6"
            >
              {isLoading ? <RefreshCw className="animate-spin" size={16} /> : 'Send Reset Link'}
            </button>
          </form>
        )}

        <p className="text-center text-xs text-brand-muted">
          Remembered your key? <Link to="/login" className="text-brand-primary font-semibold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// RESET PASSWORD PAGE
// ----------------------------------------------------
export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(new URLSearchParams(window.location.search).get('email') || '');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !newPassword.trim()) {
      setError('Please fill in email and new password');
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post('/api/auth/reset-password', { email, otp, newPassword });
      if (res.data.success) {
        setIsSuccess(true);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Password reset failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#05070f] px-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/10 rounded-full blur-[100px]"></div>

      <div className="w-full max-w-md p-6 md:p-8 rounded-3xl glass-panel relative z-10 space-y-6 shadow-glow-primary">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center font-extrabold text-white text-xl mx-auto mb-4">
            D
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Reset Password</h2>
          <p className="text-xs text-brand-muted mt-1.5">Enter new access credentials</p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/15 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        {isSuccess ? (
          <div className="space-y-4 text-center">
            <div className="p-4 bg-brand-secondary/10 border border-brand-secondary/25 rounded-2xl space-y-2">
              <CheckCircle className="text-brand-secondary mx-auto" size={24} />
              <p className="text-xs font-bold text-white font-sans">Reset Complete</p>
              <p className="text-[11px] text-brand-muted">Your new password is now active and ready.</p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold text-xs"
            >
              Sign In Now
            </button>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Email Address</label>
              <input
                type="email"
                placeholder="steve@apple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-brand-dark/40 border border-brand-border focus:border-brand-primary text-sm text-gray-200 outline-none transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">OTP Code</label>
              <input
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-brand-dark/40 border border-brand-border focus:border-brand-primary text-sm text-gray-200 outline-none transition-colors text-center font-mono tracking-widest font-extrabold"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 text-gray-500" size={16} />
                <input
                  type="password"
                  placeholder="New password (min 6 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-brand-dark/40 border border-brand-border focus:border-brand-primary text-sm text-gray-200 outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 disabled:opacity-50 text-white font-bold text-sm shadow-glow-primary active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 mt-6"
            >
              {isLoading ? <RefreshCw className="animate-spin" size={16} /> : 'Save New Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
