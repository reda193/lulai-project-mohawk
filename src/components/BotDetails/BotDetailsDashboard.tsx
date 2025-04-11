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
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* Header with back button and bot info - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <Link href="/dashboard" className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 flex-shrink-0">
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
          
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden mr-3 sm:mr-4 flex-shrink-0">
              {bot.appearance?.bot_avatar ? (
                <Image
                  src={bot.appearance.bot_avatar}
                  alt={`${bot.name} avatar`}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              ) : (
                <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
              )}
            </div>
            
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{bot.name}</h1>
              <div className="text-xs sm:text-sm text-gray-500 flex flex-wrap items-center gap-1 sm:gap-2">
                <span className="truncate">{formatModelType(bot.model_type)}</span>
                <span className="hidden sm:inline">•</span>
                <span className="truncate">Created {formatDate(bot.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Time range selector - Responsive */}
        <div className="bg-white rounded-lg shadow flex overflow-hidden self-start sm:self-center">
          {['7d', '30d', '90d'].map((range) => (
            <button
              key={range}
              className={`py-1.5 sm:py-2 px-3 sm:px-4 text-xs sm:text-sm font-medium ${
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
      
      {/* Grid layout for charts - Responsive */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full">
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 w-full">
          <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-4 flex items-center">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 text-blue-500 flex-shrink-0" />
            <span className="truncate">Resolution Rate</span>
          </h2>
          <div className="w-full overflow-hidden">
            <ResolutionRateChart timeRange={timeRange} botId={bot.id}/>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 w-full">
          <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-4 flex items-center">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 text-green-500 flex-shrink-0" />
            <span className="truncate">CSAT (Admin)</span>
          </h2>
          <div className="w-full overflow-hidden">
            <CSATChart timeRange={timeRange} botId={bot.id} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 w-full">
          <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-4 flex items-center">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 text-red-500 flex-shrink-0" />
            <span className="truncate">Escalation Rate</span>
          </h2>
          <div className="w-full overflow-hidden">
            <EscalationRateChart timeRange={timeRange} botId={bot.id} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 w-full">
          <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-4 flex items-center">
            <Database className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 text-blue-500 flex-shrink-0" />
            <span className="truncate">Knowledge Base Utilization</span>
          </h2>
          <div className="w-full overflow-hidden">
            <KnowledgeBaseChart timeRange={timeRange} botId={bot.id} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 sm:p-6 w-full">
          <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-4 flex items-center">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 text-yellow-500 flex-shrink-0" />
            <span className="truncate">Average Response Time</span>
          </h2>
          <div className="w-full overflow-hidden">
            <ResponseTimeChart timeRange={timeRange} botId={bot.id}/>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 w-full">
          <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-4 flex items-center">
            <BarChart2 className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 text-purple-500 flex-shrink-0" />
            <span className="truncate">Session Volume</span>
          </h2>
          <div className="w-full overflow-hidden">
            <SessionVolumeChart timeRange={timeRange} botId={bot.id}/>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 sm:p-6 w-full">
          <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-4 flex items-center">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 text-green-500 flex-shrink-0" />
            <span className="truncate">Sentiment Trends</span>
          </h2>
          <div className="w-full overflow-hidden">
            <SentimentTrendsChart timeRange={timeRange} botId={bot.id}/>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 w-full">
          <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-4 flex items-center">
            <Brain className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 text-purple-500 flex-shrink-0" />
            <span className="truncate">Training Coverage</span>
          </h2>
          <div className="w-full overflow-hidden">
            <TrainingCoverageChart timeRange={timeRange} botId={bot.id}/>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 sm:p-6 w-full">
          <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-4 flex items-center">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 text-orange-500 flex-shrink-0" />
            <span className="truncate">Unrecognized Queries</span>
          </h2>
          <div className="w-full overflow-hidden">
            <UnrecognizedQueriesChart timeRange={timeRange} botId={bot.id}/>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 sm:p-6 w-full">
          <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-4 flex items-center">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 text-pink-500 flex-shrink-0" />
            <span className="truncate">Lead Generation</span>
          </h2>
          <div className="w-full overflow-hidden">
            <LeadGenerationChart timeRange={timeRange} botId={bot.id}/>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add a default export as a fallback
export default BotDetailsDashboard;