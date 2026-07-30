import React, { useState } from 'react';
import { motion } from 'framer-motion';

import LandingPage from './components/LandingPage';
import ExecutiveSummaryHeader from './components/ExecutiveSummaryHeader';
import CustomerSegmentsCard from './components/CustomerSegmentsCard';
import HeroPredictionSandbox from './components/HeroPredictionSandbox';
import DemandForecastCard from './components/DemandForecastCard';
import SeasonalTrendsCard from './components/SeasonalTrendsCard';
import CustomerBehaviorCard from './components/CustomerBehaviorCard';
import ExternalFactorsCard from './components/ExternalFactorsCard';
import ProductRecommendationCard from './components/ProductRecommendationCard';
import ActionableRecommendationsCard from './components/ActionableRecommendationsCard';
import ModelEvaluationMatrixCard from './components/ModelEvaluationMatrixCard';
import DeveloperDiagnosticsCollapsible from './components/DeveloperDiagnosticsCollapsible';
import DownloadFab from './components/DownloadFab';
import { LayoutDashboard, TrendingUp, Users, Package, ArrowLeft, Sparkles } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [activeTab, setActiveTab] = useState('overview');

  const handleEnterDashboard = (tab) => {
    setActiveTab(tab || 'overview');
    setCurrentView('dashboard');
  };

  if (currentView === 'landing') {
    return <LandingPage onEnterDashboard={handleEnterDashboard} />;
  }

  const tabs = [
    { id: 'overview',  label: 'Customer Overview', icon: LayoutDashboard },
    { id: 'demand',    label: 'Demand Forecast',   icon: TrendingUp },
    { id: 'customers', label: 'Recommendations',   icon: Users },
    { id: 'inventory', label: 'Inventory Actions',  icon: Package },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E1A] via-[#0E1222] to-[#12172B] text-slate-100 font-sans pb-24 selection:bg-indigo-500/30 selection:text-indigo-200">

      {/* ── Top Navigation Bar ── */}
      <nav className="border-b border-white/[0.08] sticky top-0 z-50 bg-[#0A0E1A]/80 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentView('landing')}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors font-mono"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Home
            </button>
            <span className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white">
                <Sparkles className="w-3 h-3 fill-current" />
              </div>
              <span className="text-sm font-bold text-white tracking-tight">QuantumRetail</span>
            </div>
          </div>

          {/* Indigo-Violet Active Option Tabs */}
          <div className="flex items-center gap-2">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'btn-primary-quantum'
                      : 'btn-secondary-quantum'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* ── KPIs Banner ── */}
      <div className="max-w-[1400px] mx-auto px-6 pt-6 pb-2">
        <ExecutiveSummaryHeader />
      </div>

      {/* ── Main Dashboard Views ── */}
      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="max-w-[1400px] mx-auto px-6 space-y-6"
        key={activeTab}
      >
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3"><HeroPredictionSandbox /></div>
              <div className="lg:col-span-2"><CustomerSegmentsCard /></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ModelEvaluationMatrixCard />
              <CustomerBehaviorCard />
            </div>
          </div>
        )}

        {activeTab === 'demand' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DemandForecastCard />
              <SeasonalTrendsCard />
            </div>
            <ExternalFactorsCard />
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProductRecommendationCard />
            <CustomerBehaviorCard />
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ActionableRecommendationsCard />
            <DemandForecastCard />
          </div>
        )}

        {/* Collapsible Developer Diagnostics Section */}
        <div className="pt-6">
          <DeveloperDiagnosticsCollapsible />
        </div>
      </motion.main>

      <DownloadFab />
    </div>
  );
}
