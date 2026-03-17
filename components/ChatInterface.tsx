import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, User, Bot, Eraser, BrainCircuit, ChevronDown, ChevronRight } from 'lucide-react';
import { Message, SenderType } from '../types';
import { sendMessageToGemini } from '../services/gemini';

// Helper to parse the thought process from the response
const parseMessageContent = (text: string) => {
  const thoughtMatch = text.match(/\|\|\|THOUGHT\|\|\|([\s\S]*?)\|\|\|RESPONSE\|\|\|/);
  
  if (thoughtMatch) {
    return {
      thought: thoughtMatch[1].trim(),
      response: text.replace(thoughtMatch[0], '').trim()
    };
  }
  
  return {
    thought: null,
    response: text
  };
};

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Olá! Sou seu Agente Especialista em Licitações (Lei 14.133/2021). Posso analisar casos, citar leis e orientar processos. Como posso ajudar?',
      sender: SenderType.BOT,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // State to track expanded thought processes by message ID
  const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleThought = (msgId: string) => {
    setExpandedThoughts(prev => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: SenderType.USER,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    const aiResponseText = await sendMessageToGemini(inputText);

    const botMsg: Message = {
      id: (Date.now() + 1).toString(),
      text: aiResponseText,
      sender: SenderType.BOT,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, botMsg]);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
        {
          id: '1',
          text: 'Histórico limpo. Como posso ajudar com sua nova consulta?',
          sender: SenderType.BOT,
          timestamp: new Date(),
        },
    ]);
    setExpandedThoughts({});
  }

  // Custom components for Markdown rendering (specifically for Tables)
  const markdownComponents = {
    table: (props: any) => (
      <div className="overflow-x-auto my-4 rounded-lg border border-slate-200 shadow-sm bg-white">
        <table className="w-full text-sm text-left text-slate-700 divide-y divide-slate-200" {...props} />
      </div>
    ),
    thead: (props: any) => (
      <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-600" {...props} />
    ),
    tbody: (props: any) => (
      <tbody className="divide-y divide-slate-200 bg-white" {...props} />
    ),
    tr: (props: any) => (
      <tr className="hover:bg-slate-50 transition-colors" {...props} />
    ),
    th: (props: any) => (
      <th className="px-4 py-3 whitespace-nowrap bg-slate-50 text-slate-700 font-bold border-b border-slate-200" {...props} />
    ),
    td: (props: any) => (
      <td className="px-4 py-3 align-top" {...props} />
    ),
    // Styling links to make them distinct
    a: (props: any) => (
      <a className="text-blue-600 hover:text-blue-800 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
    )
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header Area */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div>
          <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <Bot className="text-blue-600" size={24}/>
            Consultor Normativo
          </h2>
          <p className="text-sm text-slate-500">Agente especialista com raciocínio jurídico (Lei 14.133/2021).</p>
        </div>
        <button 
            onClick={clearChat}
            className="text-slate-500 hover:text-red-500 transition-colors p-2"
            title="Limpar conversa"
        >
            <Eraser className="w-5 h-5"/>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.map((msg) => {
          const { thought, response } = msg.sender === SenderType.BOT ? parseMessageContent(msg.text) : { thought: null, response: msg.text };
          
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === SenderType.USER ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  msg.sender === SenderType.USER ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
                }`}
              >
                {msg.sender === SenderType.USER ? <User size={16} /> : <Bot size={16} />}
              </div>
              
              <div className={`flex flex-col max-w-[85%] md:max-w-[70%] ${msg.sender === SenderType.USER ? 'items-end' : 'items-start'}`}>
                {/* Agent Thought Process Block */}
                {thought && (
                  <div className="mb-2 w-full">
                    <button 
                      onClick={() => toggleThought(msg.id)}
                      className="flex items-center gap-2 text-xs font-semibold text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-lg transition-colors w-full"
                    >
                      <BrainCircuit size={14} />
                      Raciocínio do Agente
                      {expandedThoughts[msg.id] ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
                    </button>
                    
                    {expandedThoughts[msg.id] && (
                      <div className="mt-1 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-slate-700 animate-fade-in">
                        <ReactMarkdown components={markdownComponents}>{thought}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                )}

                <div
                  className={`rounded-2xl px-5 py-4 shadow-sm text-sm leading-relaxed ${
                    msg.sender === SenderType.USER
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none prose prose-sm max-w-none'
                  }`}
                >
                  <ReactMarkdown components={msg.sender === SenderType.BOT ? markdownComponents : undefined}>
                    {response}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center">
              <Bot size={16} />
            </div>
            <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 animate-pulse text-emerald-600" />
              <span className="text-xs text-slate-500 font-medium">Agente analisando legislação e riscos...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-slate-200 p-4 md:p-6">
        <div className="max-w-4xl mx-auto relative flex items-end gap-2 bg-slate-50 border border-slate-300 rounded-xl p-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-shadow">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Pergunte ao Agente (ex: Posso dispensar licitação para obra de R$ 90 mil?)"
            className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[44px] py-2.5 px-3 text-slate-800 placeholder-slate-400 text-sm"
            rows={1}
            style={{ minHeight: '44px' }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            className={`p-2.5 rounded-lg mb-0.5 transition-all ${
              inputText.trim() && !isLoading
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-center text-xs text-slate-400 mt-2">
          IA pode cometer erros. Verifique as fontes (Lei 14.133/2021) citadas pelo agente.
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;