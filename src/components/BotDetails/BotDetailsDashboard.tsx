'use client';

import React, { useState } from 'react';
import { ArrowLeft, MessageSquare, Zap, Users, AlertCircle, Database, Clock, BarChart2, Brain, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import ResolutionRateChart from './Charts/ResolutionRateChart';
import CSATChart from './Charts/CSATChart';
import EscalationRateChart from './Charts/EscalationRateChart';
import KnowledgeBaseChart from './Charts/KnowledgeBaseChart';
import ResponseTimeChart from './Charts/ResponseTimeChart';
import SessionVolumeChart from './Charts/SessionVolumeChart';
import SentimentTrendsChart from './Charts/SentimentTrendsChart';
import TrainingCoverageChart from './Charts/TrainingCoverageChart';
import UnrecognizedQueriesChart from './Charts/UnrecognizedQueriesChart';
import LeadGenerationChart from './Charts/LeadGenerationChart';

// Explicitly define the interface
export interface BotDetailsProps {
  bot: {
    id: string;
    name: string;
    description?: string | null;
    model_type: string;
    created_at: Date;
    appearance?: {
      bot_avatar?: string | null;
      company_logo?: string | null;
      accent_color?: string | null;
    } | null;
  };
}

// Use a named function export
export function BotDetailsDashboard({ bot }: BotDetailsProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  
  // Convert model type to a more readable format
  const formatModelType = (modelType: string) => {
    return modelType.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  // Consistent date formatting
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <div className="space-y-6">
      {/* Header with back button and bot info */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard" className="p-2 rounded-full hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden mr-4">
              {bot.appearance?.bot_avatar ? (
                <Image
                  src={bot.appearance.bot_avatar}
                  alt={`${bot.name} avatar`}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              ) : (
                <MessageSquare className="w-6 h-6 text-gray-700" />
              )}
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{bot.name}</h1>
              <div className="text-sm text-gray-500 flex items-center space-x-2">
                <span>{formatModelType(bot.model_type)}</span>
                <span>•</span>
                <span>Created {formatDate(bot.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Time range selector */}
        <div className="bg-white rounded-lg shadow flex overflow-hidden">
          {['7d', '30d', '90d'].map((range) => (
            <button
              key={range}
              className={`py-2 px-4 text-sm font-medium ${
                timeRange === range 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setTimeRange(range as '7d' | '30d' | '90d')}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
      
      {/* First row of visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-blue-500" />
            Resolution Rate
          </h2>
          <ResolutionRateChart timeRange={timeRange}  botId={bot.id}/>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-green-500" />
            CSAT (Admin)
          </h2>
          <CSATChart timeRange={timeRange} botId={bot.id} />
          </div>
      </div>
      
      {/* Second row of visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
            Escalation Rate
          </h2>
          <EscalationRateChart timeRange={timeRange} botId={bot.id} />
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4 flex items-center">
            <Database className="w-5 h-5 mr-2 text-blue-500" />
            Knowledge Base Utilization
          </h2>
          <KnowledgeBaseChart timeRange={timeRange} botId={bot.id} />
        </div>
      </div>

      {/* Third row of visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-yellow-500" />
            Average Response Time
          </h2>
          <ResponseTimeChart timeRange={timeRange} />
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4 flex items-center">
            <BarChart2 className="w-5 h-5 mr-2 text-purple-500" />
            Session Volume
          </h2>
          <SessionVolumeChart timeRange={timeRange} />
        </div>
      </div>

      {/* Fourth row of visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
            Sentiment Trends
          </h2>
          <SentimentTrendsChart timeRange={timeRange} />
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4 flex items-center">
            <Brain className="w-5 h-5 mr-2 text-purple-500" />
            Training Coverage
          </h2>
          <TrainingCoverageChart timeRange={timeRange} />
        </div>
      </div>

      {/* Fifth row of visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-orange-500" />
            Unrecognized Queries
          </h2>
          <UnrecognizedQueriesChart timeRange={timeRange} />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-pink-500" />
            Lead Generation
          </h2>
          <LeadGenerationChart timeRange={timeRange} />
        </div>
      </div>

          
      
    </div>

    
  );
}

// Add a default export as a fallback
export default BotDetailsDashboard;