import React, { Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ConversationMode = React.lazy(() => import('../components/ConversationMode'));

const Loading = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

const ChatPage = () => {
  const { topic, level, sessionId } = useParams<{ topic: string; level: string; sessionId: string }>();
  const navigate = useNavigate();

  // Fallback defaults if params are missing (though they shouldn't be with the route definition)
  const safeTopic = decodeURIComponent(topic || 'General Conversation');
  const safeLevel = level || 'beginner';

  return (
    <div className="chat-page">
      <Suspense fallback={<Loading />}>
        <ConversationMode 
          topic={safeTopic}
          level={safeLevel}
          onBack={() => navigate('/')}
        />
      </Suspense>
    </div>
  );
};

export default ChatPage;
