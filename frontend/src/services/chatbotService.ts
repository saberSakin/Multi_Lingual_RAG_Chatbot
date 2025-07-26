import { Message, ChatSession } from '../types';

import axios from 'axios';

const STORAGE_KEY = 'chatbot_sessions';
const API_BASE_URL = 'http://localhost:8000/api';

interface ChatResponse {
  answer: string;
  context: string | null;
  sessionId: string;
  timestamp: number;
}

class ChatbotService {
  private sessions: ChatSession[] = [];
  private axios = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30 second timeout
  });

  constructor() {
    this.loadSessions();
    this.checkBackendHealth();
  }

  private async checkBackendHealth(): Promise<void> {
    try {
      await this.axios.get('/health');
      console.log('Backend is healthy');
    } catch (error) {
      console.error('Backend health check failed:', error);
    }
  }

  private loadSessions(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.sessions = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load chat sessions:', error);
    }
  }

  private saveSessions(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.sessions));
    } catch (error) {
      console.error('Failed to save chat sessions:', error);
    }
  }

  async sendMessage(message: string, sessionId?: string): Promise<{ userMessage: Message; botResponse: Message; sessionId: string }> {
    try {
      const now = new Date();
      const hardcodedSessionId = "default"; // <-- Use this everywhere
      
      // Create user message
      const userMessage: Message = {
        id: `msg_${Date.now()}_user`,
        content: message,
        isUser: true,
        timestamp: now
      };

      // Send request to backend
      const response = await this.axios.post<ChatResponse>('/chat', {
        message,
        sessionId: hardcodedSessionId // <-- Always use "default"
      });

      // Create bot message from response
      const botMessage: Message = {
        id: `msg_${Date.now()}_bot`,
        content: response.data.answer,
        isUser: false,
        timestamp: new Date(response.data.timestamp * 1000),
        context: response.data.context
      };

      // Update or create session
      const currentSessionId = hardcodedSessionId
      const existingSession = this.sessions.find(s => s.id === currentSessionId);
      
      if (existingSession) {
        existingSession.messages.push(userMessage, botMessage);
      } else {
        this.sessions.unshift({
          id: currentSessionId,
          title: this.generateSessionTitle(message),
          messages: [userMessage, botMessage]
        });
      }

      this.saveSessions();
      
      return {
        userMessage,
        botResponse: botMessage,
        sessionId: currentSessionId
      };
      
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  private generateBotResponse(userMessage: string): string {
    const responses = [
      "That's an interesting question! Let me think about that...",
      "I understand what you're asking. Here's my perspective:",
      "Great question! Based on what I know:",
      "I'd be happy to help you with that!",
      "That's a thoughtful inquiry. Let me share some insights:",
      "I see what you're getting at. Here's what I think:",
      "Thanks for asking! I'd suggest considering:",
      "That's a complex topic. Here's how I'd approach it:"
    ];

    const topics = {
      'hello': 'Hello! I\'m your AI assistant. How can I help you today?',
      'how are you': 'I\'m doing well, thank you for asking! I\'m here and ready to help you with any questions or tasks you might have.',
      'weather': 'I don\'t have access to real-time weather data, but I\'d recommend checking a reliable weather service for current conditions in your area.',
      'time': `The current time is ${new Date().toLocaleTimeString()}. Is there anything specific you\'d like to schedule or plan?`,
      'help': 'I\'m here to assist you with a wide variety of tasks including answering questions, helping with creative projects, providing explanations, and much more. What would you like help with?'
    };

    const lowerMessage = userMessage.toLowerCase();
    
    for (const [keyword, response] of Object.entries(topics)) {
      if (lowerMessage.includes(keyword)) {
        return response;
      }
    }

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    const elaborations = [
      "Feel free to ask me more specific questions if you need clarification.",
      "Is there a particular aspect you'd like me to explore further?",
      "Would you like me to elaborate on any part of this?",
      "Let me know if you need more details about anything!",
      "I'm here if you have any follow-up questions."
    ];

    return `${randomResponse} ${elaborations[Math.floor(Math.random() * elaborations.length)]}`;
  }

  private generateSessionTitle(firstMessage: string): string {
    const words = firstMessage.split(' ').slice(0, 4);
    return words.join(' ') + (firstMessage.split(' ').length > 4 ? '...' : '');
  }

  getSessions(): ChatSession[] {
    return [...this.sessions];
  }

  getSession(sessionId: string): ChatSession | undefined {
    return this.sessions.find(s => s.id === sessionId);
  }

  clearSessions(): void {
    this.sessions = [];
    this.saveSessions();
  }
}

export const chatbotService = new ChatbotService();