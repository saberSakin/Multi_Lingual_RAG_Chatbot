import React, { useState, useRef, useEffect } from 'react';
import { ChatBubble } from '../common/ChatBubble';
import { Button } from '../common/Button';
import { Message, ChatSession } from '../../types';
import { chatbotService } from '../../services/chatbotService';
import { authService } from '../../services/authService';

interface ChatWindowProps {
  currentSession: ChatSession | null;
  onSessionUpdate: () => void;
  onNewSession: (sessionId: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  currentSession,
  onSessionUpdate,
  onNewSession
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    console.log('Current session messages:', currentSession?.messages);
    scrollToBottom();
  }, [currentSession?.messages]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      const result = await chatbotService.sendMessage(message, currentSession?.id);
      console.log('Chatbot response:', result);
      // Always reload sessions after sending a message
      onSessionUpdate();

      // If a new session was created, update current session
      if (!currentSession) {
        onNewSession(result.sessionId);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Show error to user
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  if (!currentSession) {
    return (
      <div className="chat-container">
        <div className="welcome-screen">
          <h1 className="welcome-title">Welcome to AI Chat</h1>
          <p className="welcome-description">
            Start a conversation with our AI assistant. Ask questions, get help, or just chat!
          </p>
          
          <div className="suggestion-cards">
            <div 
              className="suggestion-card"
              onClick={() => handleSuggestionClick("What can you help me with?")}
            >
              <div className="suggestion-title">Get Started</div>
              <div className="suggestion-description">Learn what I can help you with</div>
            </div>
            <div 
              className="suggestion-card"
              onClick={() => handleSuggestionClick("Tell me a fun fact")}
            >
              <div className="suggestion-title">Fun Facts</div>
              <div className="suggestion-description">Discover something interesting</div>
            </div>
            <div 
              className="suggestion-card"
              onClick={() => handleSuggestionClick("Help me brainstorm ideas")}
            >
              <div className="suggestion-title">Creative Help</div>
              <div className="suggestion-description">Let's brainstorm together</div>
            </div>
            <div 
              className="suggestion-card"
              onClick={() => handleSuggestionClick("Explain a complex topic")}
            >
              <div className="suggestion-title">Learn Something</div>
              <div className="suggestion-description">Get clear explanations</div>
            </div>
          </div>
        </div>

        <div className="chat-input-container">
          <form onSubmit={handleSubmit} className="chat-input-form">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message here..."
              className="chat-input"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="send-btn"
            >
              {isLoading ? '...' : 'Send'}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {currentSession.messages.map(message => (
          <ChatBubble key={message.id} message={message} />
        ))}
        {isLoading && (
          <div className="loading">
            <div className="message">
              <div className="message-avatar">AI</div>
              <div className="message-content">
                <div className="message-bubble">Thinking...</div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <form onSubmit={handleSubmit} className="chat-input-form">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here..."
            className="chat-input"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="send-btn"
          >
            {isLoading ? '...' : 'Send'}
          </Button>
        </form>
      </div>
    </div>
  );
};