import React from 'react';
import { Message } from '../../types';

interface ChatBubbleProps {
  message: Message;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const formatTime = (timestamp: Date | number | string) => {
    const date = typeof timestamp === 'object'
      ? timestamp
      : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`message ${message.isUser ? 'user' : ''}`}>
      <div className="message-avatar">
        {message.isUser ? 'U' : 'AI'}
      </div>
      <div className="message-content">
        <div className="message-bubble">
          {message.content}
        </div>
        {!message.isUser && message.context && (
          <div className="message-context">
            <div className="context-label">Source context:</div>
            <div className="context-content">
              {message.context}
            </div>
          </div>
        )}
        <div className="message-time">
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
};