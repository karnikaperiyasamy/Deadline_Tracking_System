import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Clock,
  BrainCircuit,
  ListTree,
  ArrowRight,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header / Navigation */}
      <nav className="border-b border-slate-800/80 px-6 py-4 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              Life<span className="text-blue-500">OS</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-lg shadow-blue-500/25 active:scale-95"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-24 overflow-hidden border-b border-slate-900">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/20 blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            Next-Gen Personal Productivity System
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-100 leading-tight">
            Master Every Deadline with <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Real Groq Artificial Intelligence
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto font-normal leading-relaxed">
            Centralized deadline tracking for assignments, exams, projects, hackathons, and career applications. LifeOS analyzes your real database schedule to answer: <em>"What should I work on next?"</em>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-base rounded-2xl transition-all shadow-xl shadow-blue-500/30 flex items-center justify-center gap-3 group"
            >
              Start Organizing Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold text-base rounded-2xl transition-colors flex items-center justify-center"
            >
              Sign In to Account
            </Link>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="px-6 py-20 bg-slate-950 border-b border-slate-900">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-extrabold text-white">Intelligent Command Dashboard</h2>
            <p className="text-slate-400 text-base max-w-2xl mx-auto">
              Visual urgency badges, productivity metrics, automated risk calculation, and real-time deadline counts.
            </p>
          </div>

          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
                <span className="text-xs text-slate-400 font-semibold">Total Tasks</span>
                <p className="text-3xl font-extrabold text-white mt-1">24</p>
              </div>
              <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
                <span className="text-xs text-slate-400 font-semibold">Overdue Risk</span>
                <p className="text-3xl font-extrabold text-rose-400 mt-1">2</p>
              </div>
              <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
                <span className="text-xs text-slate-400 font-semibold">Due Today</span>
                <p className="text-3xl font-extrabold text-amber-400 mt-1">3</p>
              </div>
              <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
                <span className="text-xs text-slate-400 font-semibold">Productivity Score</span>
                <p className="text-3xl font-extrabold text-emerald-400 mt-1">88%</p>
              </div>
            </div>

            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-blue-300">AI Daily Recommendation</h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Focus on "DBMS Midterm Preparation" during morning hours. It requires 4 estimated hours and carries a High Deadline Risk.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="px-6 py-20 bg-slate-900/50">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-extrabold text-white">Built for High Achievers</h2>
            <p className="text-slate-400 text-base max-w-2xl mx-auto">
              Everything you need to manage academic, career, and personal goals effortlessly.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Real AI Assistant</h3>
              <p className="text-sm text-slate-400">
                Queries your actual database tasks via server-side AI integration to generate daily plans, breakdown complex projects, and estimate risk levels.
              </p>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Visual Urgency System</h3>
              <p className="text-sm text-slate-400">
                Instant color-coded urgency indicators for overdue, due today, 3-day warnings, and 7-day attention items. Never get surprised by a due date.
              </p>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                <ListTree className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">1-Click Subtask Breakdown</h3>
              <p className="text-sm text-slate-400">
                Turn overwhelming titles like "Build Final Year Project" into actionable step-by-step subtasks with explicit user confirmation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 px-6 py-8 bg-slate-950 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span className="font-bold text-slate-300">LifeOS — AI-Powered Life Management</span>
          </div>
          <p>&copy; {new Date().getFullYear()} LifeOS Systems Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
