import React, { Suspense } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

const ConversationMode = React.lazy(() => import('../components/ConversationMode'));

const Loading = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

const ChatPage = () => {
  const { topic, level, sessionId } = useParams<{ topic: string; level: string; sessionId: string }>();
  const navigate = useNavigate();
  // Allow passing state via navigation as fallback if params aren't used in URL
  const location = useLocation();
  const state = location.state as { topic?: string; level?: string; sessionId?: string } | null;

  const activeTopic = decodeURIComponent(topic || state?.topic || 'General Conversation');
  const activeLevel = level || state?.level || 'beginner';
  // Use provided session ID or generate one
  const activeSessionId = sessionId || state?.sessionId || `session_${Date.now()}`;

  return (
    <div className="chat-page">
      <Suspense fallback={<Loading />}>
        <ConversationMode 
          topic={activeTopic}
          level={activeLevel}
          onBack={() => navigate('/')}
        />
      </Suspense>
    </div>
  );
};

export default ChatPage;
