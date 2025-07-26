import React from 'react';
import { Button } from '../common/Button';
import { ChatSession } from '../../types';
import { authService } from '../../services/authService';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  onNewChat: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  currentSessionId,
  onSessionSelect,
  onNewChat,
  isOpen,
  onClose
}) => {
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div>
          <h2 className="sidebar-title">Chat History</h2>
          {user && <p style={{ fontSize: '14px', color: '#888' }}>{user.name}</p>}
        </div>
        <Button 
          onClick={handleLogout}
          className="logout-btn"
          size="small"
        >
          Logout
        </Button>
      </div>
      
      <div style={{ padding: '20px', borderBottom: '1px solid #3d3d3d' }}>
        <Button onClick={onNewChat} style={{ width: '100%' }}>
          New Chat
        </Button>
      </div>

      <div className="chat-history">
        {!authService.isAuthenticated() ? (
          <div className="empty-history">
            Please log in to view chat history
          </div>
        ) : sessions.length === 0 ? (
          <div className="empty-history">
            No chat sessions yet. Start a conversation!
          </div>
        ) : (
          sessions.map(session => (
            <div
              key={session.id}
              className={`chat-history-item ${session.id === currentSessionId ? 'active' : ''}`}
              onClick={() => {
                onSessionSelect(session.id);
                onClose();
              }}
            >
              <div className="chat-history-title">{session.title}</div>
              <div className="chat-history-preview">
                {session.messages[session.messages.length - 1]?.content.substring(0, 50)}...
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};