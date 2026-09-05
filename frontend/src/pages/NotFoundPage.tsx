import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
        <Sparkles className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-100 mb-2">404 — Page Not Found</h1>
      <p className="text-sm text-slate-400 max-w-sm mb-6">
        The route you requested does not exist or has been moved.
      </p>
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-blue-500/20"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>
    </div>
  );
};
