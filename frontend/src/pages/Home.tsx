import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/home/Sidebar';
import { ChatWindow } from '../components/home/ChatWindow';
import { chatbotService } from '../services/chatbotService';
import { authService } from '../services/authService';
import { ChatSession } from '../types';

export const Home: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadSessions = () => {
    if (authService.isAuthenticated()) {
      const loadedSessions = chatbotService.getSessions();
      setSessions(loadedSessions);
    } else {
      setSessions([]);
      setCurrentSessionId(null);
      setCurrentSession(null);
    }
  };

  const loadCurrentSession = () => {
    if (currentSessionId) {
      const session = chatbotService.getSession(currentSessionId);
      setCurrentSession(session || null);
    }
  };

  useEffect(() => {
  loadSessions();
  // Always set currentSessionId to "default" if session exists
  const defaultSession = chatbotService.getSession("default");
  if (defaultSession) {
    setCurrentSessionId("default");
  }
}, []);

  useEffect(() => {
    loadCurrentSession();
  }, [currentSessionId]);

  const handleSessionSelect = (sessionId: string) => {
    setCurrentSessionId(sessionId);
  };

  const handleNewChat = () => {
    chatbotService.clearSessions();
    setCurrentSessionId("default");
    setCurrentSession(null);
  };

  const handleSessionUpdate = () => {
    loadSessions();
    setCurrentSessionId("default");
    loadCurrentSession();
  };

  const handleNewSession = (sessionId: string) => {
  setCurrentSessionId(sessionId);
  setTimeout(() => {
    loadSessions();
    loadCurrentSession();
  }, 0);
};

  return (
    <div className="home-container">
      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSessionSelect={handleSessionSelect}
        onNewChat={handleNewChat}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      <div className="chat-container">
        <div className="chat-header">
          <button 
            className="mobile-menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <h1 className="chat-title">AI Assistant</h1>
        </div>
        
        <ChatWindow
          currentSession={currentSession}
          onSessionUpdate={handleSessionUpdate}
          onNewSession={handleNewSession}
        />
      </div>
    </div>
  );
};