import React, { useState, useEffect } from 'react';
import { settingsApi } from '../api/settings.api';
import { UserSettings } from '../types';
import { Skeleton } from '../components/ui/Skeleton';
import { Settings as SettingsIcon, CheckCircle2, Moon, Globe, Bell, Sparkles } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const [theme, setTheme] = useState('dark');
  const [timezone, setTimezone] = useState('UTC');
  const [notificationEmail, setNotificationEmail] = useState(true);

  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await settingsApi.getSettings();
        setSettings(res);
        setTheme(res.theme || 'dark');
        setTimezone(res.timezone || 'UTC');
        setNotificationEmail(res.notificationEmail);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    setSaving(true);

    try {
      const updated = await settingsApi.updateSettings({
        theme,
        timezone,
        notificationEmail,
      });
      setSettings(updated);
      setMsg('Settings saved successfully!');
    } catch (err: any) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-slate-400" />
          System & Preference Configuration
        </h1>
        <p className="text-sm text-slate-400">Settings persisted directly in PostgreSQL</p>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-6">
        {msg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{msg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Theme Preference */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Moon className="w-4 h-4 text-blue-400" />
              Interface Theme
            </label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="dark">Dark SaaS Mode (Default)</option>
              <option value="light">Light Mode</option>
              <option value="system">Sync with Operating System</option>
            </select>
          </div>

          {/* Timezone Preference */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-400" />
              Application Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="UTC">UTC (Coordinated Universal Time)</option>
              <option value="America/New_York">America/New_York (EST)</option>
              <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
            </select>
          </div>

          {/* Notification Preferences */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-400" />
              Notification Subscriptions
            </label>
            <div className="flex items-center gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
              <input
                type="checkbox"
                id="emailNotif"
                checked={notificationEmail}
                onChange={(e) => setNotificationEmail(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-900 border-slate-800 text-blue-600 focus:ring-0"
              />
              <label htmlFor="emailNotif" className="text-xs text-slate-200 cursor-pointer">
                Receive automated deadline risk email digests
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
          >
            {saving ? 'Saving Preferences...' : 'Save Settings'}
          </button>
        </form>
      </div>
    </div>
  );
};
