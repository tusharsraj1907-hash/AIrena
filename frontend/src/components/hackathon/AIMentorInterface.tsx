import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Send, Sparkles, CheckCircle2, AlertCircle, Lightbulb, FileText, Upload } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card3D } from '../ui/Card3D';
import { Button3D } from '../ui/Button3D';
import { api } from '../../utils/api';
import { toast } from 'sonner';

export function AIMentorInterface() {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: 'Hello! I\'m your AI Mentor. I can help you with hackathon rules, submission requirements, and provide real-time feedback on your project. How can I assist you today?',
      timestamp: new Date(),
    },
  ]);

  const capabilities = [
    { icon: FileText, label: 'Guide Through Rules', color: 'from-blue-500 to-cyan-500' },
    { icon: CheckCircle2, label: 'Submission Checklist', color: 'from-green-500 to-emerald-500' },
    { icon: AlertCircle, label: 'Validation Tips', color: 'from-yellow-500 to-orange-500' },
    { icon: Upload, label: 'Upload Guidance', color: 'from-purple-500 to-pink-500' },
  ];

  const quickActions = [
    'Review my project requirements',
    'Check submission completeness',
    'Suggest improvements',
    'Explain evaluation criteria',
  ];

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage = message.trim();
    const userMessageObj = {
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };

    // Add user message to chat first
    const updatedMessages = [...messages, userMessageObj];
    setMessages(updatedMessages);
    setMessage('');
    setIsTyping(true);

    try {
      // Prepare conversation history (last 10 messages for context, including the new user message)
      const conversationHistory = updatedMessages
        .slice(-10)
        .map(msg => ({
          role: msg.role === 'ai' ? 'assistant' : 'user',
          content: msg.content,
          timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp,
        }));

      // Call AI Mentor API
      const response = await api.mentorChat({
        message: userMessage,
        conversationHistory,
      });

      // Add AI response to chat
      setMessages(prev => [...prev, {
        role: 'ai',
        content: response.response,
        timestamp: new Date(response.timestamp || new Date()),
      }]);
    } catch (error: any) {
      console.error('AI Mentor error:', error);
      
      // Check if it's a connection error
      const isConnectionError = error.message?.includes('ECONNREFUSED') || 
                               error.message?.includes('Failed to fetch') ||
                               error.message?.includes('Network Error');
      
      if (isConnectionError) {
        toast.error('AI service is not running. Please start the AI service on port 8000.');
      } else {
        toast.error(error.message || 'Failed to get AI response. Please try again.');
      }
      
      // The backend should return a helpful fallback response, but if it doesn't, show this
      // Only show error if backend didn't return a response at all
      if (!error.response) {
        setMessages(prev => [...prev, {
          role: 'ai',
          content: 'I apologize, but I encountered an error connecting to the AI service. Please ensure the AI service is running on port 8000, or try again later.',
          timestamp: new Date(),
        }]);
      }
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">AI Mentor</h1>
            <p className="text-white">Your intelligent hackathon assistant</p>
          </div>
          <div className="ml-auto">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
              Online
            </Badge>
          </div>
        </div>
      </div>

      {/* Capabilities */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 perspective-3d">
        {capabilities.map((cap) => (
          <Card3D key={cap.label} intensity={15}>
            <motion.div whileHover={{ y: -5 }}>
              <Card className="p-4 bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-700/50 text-center glass shadow-3d h-full">
                <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${cap.color} flex items-center justify-center glow-animated`}>
                  <cap.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-semibold text-white">{cap.label}</p>
              </Card>
            </motion.div>
          </Card3D>
        ))}
      </div>

      {/* Chat Interface */}
      <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-700/50 backdrop-blur-sm">
        {/* Messages */}
        <div className="h-96 overflow-y-auto p-6 space-y-4" data-scrollable>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'ai' && (
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                  <Brain className="w-5 h-5 text-white" />
                </div>
              )}
              <motion.div
                className={`max-w-md px-4 py-3 rounded-2xl transform-3d ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-3d'
                    : 'bg-slate-800 shadow-3d'
                }`}
                whileHover={{ scale: 1.02, y: -2 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <p className="text-sm text-white whitespace-pre-wrap">{msg.content}</p>
                <p className="text-xs text-white/90 mt-1">
                  {msg.timestamp instanceof Date 
                    ? msg.timestamp.toLocaleTimeString() 
                    : new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              </motion.div>
            </motion.div>
          ))}

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
                  <div className="bg-slate-800 px-4 py-3 rounded-2xl">
                    <div className="flex gap-1">
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                        className="w-2 h-2 bg-blue-500 rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        className="w-2 h-2 bg-blue-500 rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                        className="w-2 h-2 bg-blue-500 rounded-full"
                      />
                    </div>
                  </div>
            </motion.div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="px-6 pb-4 border-t border-slate-700">
          <p className="text-xs text-white mb-3 mt-4 font-semibold">Quick Actions:</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {quickActions.map((action) => (
              <Badge
                key={action}
                onClick={() => setMessage(action)}
                className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-white"
              >
                {action}
              </Badge>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-6 pt-0">
          <div className="flex gap-3">
            <Input
              placeholder="Ask me anything about your hackathon..."
              className="flex-1 bg-slate-800 border-slate-600 focus:border-blue-400 text-white placeholder:text-slate-400"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button3D
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
              onClick={handleSend}
            >
              <Send className="w-5 h-5" />
            </Button3D>
          </div>
        </div>
      </Card>

      {/* Info Cards */}
      <div className="grid md:grid-cols-2 gap-6 mt-6 perspective-3d">
        <Card3D intensity={15}>
          <Card className="p-6 bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-500/30 glass shadow-3d">
            <div className="flex items-center gap-3 mb-3">
              <Lightbulb className="w-6 h-6 text-blue-400" />
              <h3 className="font-bold text-white">Pro Tip</h3>
            </div>
          <p className="text-sm text-white">
            Ask me to review your project against the hackathon requirements. I can provide a detailed analysis with improvement suggestions.
          </p>
        </Card>
        </Card3D>

        <Card3D intensity={15}>
          <Card className="p-6 bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30 glass shadow-3d">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="w-6 h-6 text-purple-400" />
              <h3 className="font-bold text-white">AI-Powered</h3>
            </div>
            <p className="text-sm text-white">
              I use advanced AI to understand context and provide personalized guidance based on your specific hackathon and project.
            </p>
          </Card>
        </Card3D>
      </div>
    </motion.div>
  );
}
