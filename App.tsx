import { useState } from 'react';
import Layout from './components/Layout';
import ChatInterface from './components/ChatInterface';
import DocGenerator from './components/DocGenerator';
import KnowledgeBase from './components/KnowledgeBase';
import { AppView } from './types';

function App() {
  const [currentView, setCurrentView] = useState<AppView>(AppView.CHAT);

  const renderContent = () => {
    switch (currentView) {
      case AppView.CHAT:
        return <ChatInterface />;
      case AppView.DOC_GENERATOR:
        return <DocGenerator />;
      case AppView.KNOWLEDGE_BASE:
        return <KnowledgeBase />;
      default:
        return <ChatInterface />;
    }
  };

  return (
    <Layout currentView={currentView} setCurrentView={setCurrentView}>
      {renderContent()}
    </Layout>
  );
}

export default App;