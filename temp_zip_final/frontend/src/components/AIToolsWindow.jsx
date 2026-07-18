import React, { useState } from 'react';
import { 
  FileText, Languages, Mail, Database, Terminal, 
  Sparkles, Clipboard, Check, ChevronLeft, Send, ArrowRight, BookOpen,
  RefreshCw
} from 'lucide-react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

export default function AIToolsWindow() {
  const [selectedTool, setSelectedTool] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [extraContext, setExtraContext] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);

  const tools = [
    {
      id: 'grammar_checker',
      name: 'Grammar Checker',
      description: 'Find spelling errors, fix grammar, and polish sentence structure.',
      icon: <BookOpen className="text-brand-primary" size={20} />,
      placeholder: 'Enter text with typos here...',
      extraPlaceholder: 'Optional instructions (e.g., Make it sound British)...'
    },
    {
      id: 'translator',
      name: 'Language Translator',
      description: 'Translate paragraphs into French, Spanish, German, Japanese, etc.',
      icon: <Languages className="text-brand-secondary" size={20} />,
      placeholder: 'Enter sentences to translate...',
      extraPlaceholder: 'Target Language (e.g. French, Spanish, Japanese)...'
    },
    {
      id: 'email_writer',
      name: 'Email Writer',
      description: 'Draft professional business, sales, or personal email layouts.',
      icon: <Mail className="text-brand-primary" size={20} />,
      placeholder: 'Explain what email is about (e.g., requesting budget update)...',
      extraPlaceholder: 'Context (e.g. Professional tone, keep it short)...'
    },
    {
      id: 'resume_builder',
      name: 'Resume Polisher',
      description: 'Style job experiences action-words to impress recruiters.',
      icon: <FileText className="text-brand-secondary" size={20} />,
      placeholder: 'Paste your draft job duties or achievements here...',
      extraPlaceholder: 'Industry or role focus (e.g., Software Engineer)...'
    },
    {
      id: 'sql_generator',
      name: 'SQL Query Builder',
      description: 'Convert natural language prompts into optimized SQL syntax.',
      icon: <Database className="text-brand-primary" size={20} />,
      placeholder: 'Request query (e.g., select users who logged in last 7 days)...',
      extraPlaceholder: 'SQL Dialect (e.g. PostgreSQL, MySQL, SQLite)...'
    },
    {
      id: 'regex_generator',
      name: 'Regex Generator',
      description: 'Compile matching patterns for emails, phone numbers, codes.',
      icon: <Terminal className="text-brand-secondary" size={20} />,
      placeholder: 'Describe matching criteria (e.g., match valid emails)...',
      extraPlaceholder: 'Language syntax (e.g., JavaScript, Python)...'
    },
    {
      id: 'prompt_generator',
      name: 'Prompt Engineer',
      description: 'Enrich simple prompts into detailed generative art instructions.',
      icon: <Sparkles className="text-brand-primary" size={20} />,
      placeholder: 'Enter a basic prompt idea...',
      extraPlaceholder: 'Style target (e.g., Stable Diffusion 3D character)...'
    }
  ];

  const handleRunTool = async () => {
    if (!userInput.trim()) return;

    setIsLoading(true);
    setResult('');
    try {
      // Hit FastAPI tools route
      const response = await axios.post('/api/ai/tools', {
        tool_name: selectedTool.id,
        user_input: userInput,
        extra_context: extraContext
      });

      if (response.data.success) {
        setResult(response.data.result);
      }
    } catch (error) {
      console.error('AI tool execution failed:', error);
      setResult('Failed to compile output. Verify FastAPI connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBack = () => {
    setSelectedTool(null);
    setUserInput('');
    setExtraContext('');
    setResult('');
  };

  return (
    <div className="flex-1 p-5 md:p-8 overflow-y-auto bg-[#05070f] h-full">
      {!selectedTool ? (
        /* Tools Selection Menu */
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="text-brand-primary animate-pulse" size={20} />
              Productivity AI Tools Hub
            </h2>
            <p className="text-xs text-brand-muted mt-1">
              Select a specialized micro-assistant to speed up text composition, coding tasks, or data transformations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setSelectedTool(tool)}
                className="p-5 rounded-2xl glass-card hover:bg-white/5 border border-brand-border hover:border-brand-primary/20 text-left transition-all active:scale-[0.98] group flex flex-col justify-between min-h-[160px]"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 group-hover:bg-brand-primary/10 transition-colors flex items-center justify-center">
                    {tool.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white leading-snug">{tool.name}</h3>
                    <p className="text-xs text-brand-muted mt-1 leading-relaxed">{tool.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-brand-primary group-hover:text-white transition-colors mt-4 self-end">
                  Open Tool
                  <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Focused Tool Workspace */
        <div className="max-w-3xl mx-auto space-y-6">
          <button 
            onClick={handleBack}
            className="flex items-center gap-2 text-xs font-semibold text-brand-muted hover:text-white transition-colors border border-brand-border bg-white/5 px-3.5 py-1.5 rounded-lg active:scale-95"
          >
            <ChevronLeft size={14} /> Back to Tools
          </button>

          <div className="flex items-center gap-3.5 pb-4 border-b border-brand-border">
            <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center">
              {selectedTool.icon}
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">{selectedTool.name}</h2>
              <p className="text-xs text-brand-muted mt-0.5">{selectedTool.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Input Side */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Source Content</label>
                <textarea
                  placeholder={selectedTool.placeholder}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  disabled={isLoading}
                  rows={8}
                  className="w-full p-4 rounded-2xl bg-brand-dark/50 border border-brand-border focus:border-brand-primary text-sm text-gray-200 placeholder-gray-600 outline-none transition-colors resize-none disabled:opacity-50"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Secondary Instructions / Variables</label>
                <input
                  type="text"
                  placeholder={selectedTool.extraPlaceholder}
                  value={extraContext}
                  onChange={(e) => setExtraContext(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-xl bg-brand-dark/50 border border-brand-border focus:border-brand-primary text-xs text-gray-200 placeholder-gray-600 outline-none transition-colors disabled:opacity-50"
                />
              </div>

              <button
                onClick={handleRunTool}
                disabled={isLoading || !userInput.trim()}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 disabled:opacity-30 text-white font-bold flex items-center justify-center gap-2 shadow-glow-primary active:scale-[0.98] transition-all disabled:pointer-events-none"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="animate-spin" size={16} />
                    Processing variables...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Run Generator
                  </>
                )}
              </button>
            </div>

            {/* Output Display Side */}
            <div className="flex flex-col gap-2 min-h-[300px]">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center justify-between">
                Generated Result
                {result && (
                  <button 
                    onClick={handleCopy}
                    className="p-1 hover:text-white flex items-center gap-1 transition-colors text-[10px]"
                  >
                    {copied ? <Check size={12} className="text-brand-secondary" /> : <Clipboard size={12} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                )}
              </label>

              <div className="flex-1 p-4 border border-brand-border rounded-2xl bg-brand-dark/20 overflow-y-auto text-sm text-gray-200 leading-relaxed max-h-[420px]">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-brand-muted">
                    <RefreshCw className="animate-spin text-brand-primary" size={24} />
                    <span className="text-xs">Thinking...</span>
                  </div>
                ) : result ? (
                  <div className="prose prose-invert max-w-none text-xs">
                    <ReactMarkdown>{result}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center text-xs text-brand-muted p-4">
                    Wait for output... Output is structured as clean Markdown block.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
