import { create } from 'zustand';
import axios from 'axios';

export const useChatStore = create((set, get) => ({
  chats: [],
  activeChatId: null,
  activeChat: null,
  selectedModel: 'gemini', // 'gemini' | 'openai' | 'claude'
  isGenerating: false,
  loadingHistory: false,
  abortController: null,

  setSelectedModel: (model) => set({ selectedModel: model }),

  fetchChats: async () => {
    set({ loadingHistory: true });
    try {
      const response = await axios.get('/api/chats');
      set({ chats: response.data, loadingHistory: false });
    } catch (err) {
      console.error('Failed to fetch chats list:', err);
      set({ loadingHistory: false });
    }
  },

  fetchChatDetails: async (id) => {
    if (!id) return;
    try {
      const response = await axios.get(`/api/chats/${id}`);
      set({ activeChat: response.data, activeChatId: id });
    } catch (err) {
      console.error('Failed to fetch chat details:', err);
    }
  },

  createChat: async (title = 'New Chat') => {
    try {
      const response = await axios.post('/api/chats', { title });
      const newChat = response.data;
      set((state) => ({
        chats: [newChat, ...state.chats],
        activeChatId: newChat._id,
        activeChat: newChat
      }));
      return newChat._id;
    } catch (err) {
      console.error('Failed to create new chat:', err);
      return null;
    }
  },

  sendMessage: async (text, attachment = null) => {
    const { activeChatId, activeChat, selectedModel } = get();
    
    // 1. If no active chat, create one
    let chatId = activeChatId;
    if (!chatId) {
      chatId = await get().createChat(text.slice(0, 30));
      if (!chatId) return;
    }

    const tempUserMsg = {
      sender: 'user',
      text,
      attachment,
      timestamp: new Date().toISOString()
    };

    // Update frontend state immediately for snappy response
    set((state) => {
      const updatedMessages = [...(state.activeChat?.messages || []), tempUserMsg];
      return {
        activeChat: {
          ...state.activeChat,
          messages: updatedMessages
        }
      };
    });

    // 2. Save user message to Node database
    try {
      await axios.post(`/api/chats/${chatId}/messages`, tempUserMsg);
    } catch (err) {
      console.error('Failed to save user message to history database:', err);
    }

    // 3. Initiate SSE Streaming from FastAPI
    const controller = new AbortController();
    set({ isGenerating: true, abortController: controller });

    // Insert empty AI message block to write stream buffer into
    const tempAiMsg = {
      sender: 'ai',
      text: '',
      mode: selectedModel,
      timestamp: new Date().toISOString()
    };

    set((state) => {
      const updatedMessages = [...(state.activeChat?.messages || []), tempAiMsg];
      return {
        activeChat: {
          ...state.activeChat,
          messages: updatedMessages
        }
      };
    });

    let fullAiResponseText = '';
    
    try {
      const chatHistoryForAI = (get().activeChat?.messages || [])
        .slice(0, -1) // skip the empty AI template block we just added
        .map(msg => ({ sender: msg.sender, text: msg.text }));

      // Call streaming backend endpoint directly via fetch to read SSE stream
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          history: chatHistoryForAI
        }),
        signal: controller.signal
      });

      if (!response.body) {
        throw new Error('Streaming response body is empty');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        
        if (value) {
          const chunkStr = decoder.decode(value, { stream: true });
          const lines = chunkStr.split('\n');
          
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data: ')) continue;
            
            const rawData = trimmed.replace('data: ', '');
            if (rawData === '[DONE]') {
              done = true;
              break;
            }

            try {
              const payload = JSON.parse(rawData);
              if (payload.error) {
                fullAiResponseText += `\n*Error: ${payload.error}*`;
              } else {
                const delta = payload.choices?.[0]?.delta?.content || '';
                fullAiResponseText += delta;
              }

              // Update the last message in activeChat list
              set((state) => {
                const currentMsgs = [...(state.activeChat?.messages || [])];
                if (currentMsgs.length > 0) {
                  currentMsgs[currentMsgs.length - 1].text = fullAiResponseText;
                }
                return {
                  activeChat: {
                    ...state.activeChat,
                    messages: currentMsgs
                  }
                };
              });
            } catch (jsonErr) {
              // Partial JSON, safe to skip or wait for complete frame
            }
          }
        }
      }
    } catch (streamErr) {
      if (streamErr.name === 'AbortError') {
        console.log('Stream generation aborted by user');
      } else {
        console.error('Streaming connection error:', streamErr);
        fullAiResponseText += '\n\n*Connection error. Please try again.*';
        set((state) => {
          const currentMsgs = [...(state.activeChat?.messages || [])];
          if (currentMsgs.length > 0) {
            currentMsgs[currentMsgs.length - 1].text = fullAiResponseText;
          }
          return { activeChat: { ...state.activeChat, messages: currentMsgs } };
        });
      }
    } finally {
      set({ isGenerating: false, abortController: null });
    }

    // 4. Save finished AI response to Node database
    try {
      await axios.post(`/api/chats/${chatId}/messages`, {
        sender: 'ai',
        text: fullAiResponseText,
        mode: selectedModel
      });
      // Refresh chats list to update titles/timestamps in sidebar
      get().fetchChats();
      // Reload details to make sure mongo IDs align correctly
      get().fetchChatDetails(chatId);
    } catch (err) {
      console.error('Failed to log final AI response to history database:', err);
    }
  },

  stopGenerating: () => {
    const { abortController } = get();
    if (abortController) {
      abortController.abort();
      set({ isGenerating: false, abortController: null });
    }
  },

  renameChat: async (id, title) => {
    try {
      await axios.put(`/api/chats/${id}/rename`, { title });
      set((state) => ({
        chats: state.chats.map((c) => (c._id === id ? { ...c, title } : c)),
        activeChat: state.activeChat?._id === id ? { ...state.activeChat, title } : state.activeChat
      }));
    } catch (err) {
      console.error('Failed to rename chat:', err);
    }
  },

  togglePinChat: async (id) => {
    try {
      const response = await axios.put(`/api/chats/${id}/pin`);
      const updated = response.data;
      set((state) => ({
        chats: state.chats.map((c) => (c._id === id ? { ...c, isPinned: updated.isPinned } : c)).sort((a, b) => b.isPinned - a.isPinned)
      }));
    } catch (err) {
      console.error('Failed to toggle pin:', err);
    }
  },

  deleteChat: async (id) => {
    try {
      await axios.delete(`/api/chats/${id}`);
      set((state) => {
        const remainingChats = state.chats.filter((c) => c._id !== id);
        const nextActive = state.activeChatId === id ? (remainingChats[0]?._id || null) : state.activeChatId;
        return {
          chats: remainingChats,
          activeChatId: nextActive,
          activeChat: nextActive ? state.activeChat : null
        };
      });
      const activeId = get().activeChatId;
      if (activeId) {
        get().fetchChatDetails(activeId);
      }
    } catch (err) {
      console.error('Failed to delete chat:', err);
    }
  },

  clearAllChats: async () => {
    try {
      await axios.delete('/api/chats');
      set({ chats: [], activeChatId: null, activeChat: null });
    } catch (err) {
      console.error('Failed to clear chats:', err);
    }
  }
}));
