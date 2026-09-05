import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileApi } from '../api/profile.api';
import { User, Lock, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passMsg, setPassMsg] = useState('');
  const [passError, setPassError] = useState('');
  const [updatingPass, setUpdatingPass] = useState(false);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileError('');
    setUpdatingProfile(true);

    try {
      await profileApi.updateProfile({ name });
      await refreshUser();
      setProfileMsg('Profile updated successfully!');
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg('');
    setPassError('');

    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match');
      return;
    }

    setUpdatingPass(true);
    try {
      await profileApi.updatePassword({ currentPassword, newPassword });
      setPassMsg('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPassError(err.message || 'Failed to update password.');
    } finally {
      setUpdatingPass(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
          <User className="w-6 h-6 text-blue-400" />
          Account Profile & Security
        </h1>
        <p className="text-sm text-slate-400">Manage your user identity and security credentials</p>
      </div>

      {/* Account Info Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-4 pb-4 border-b border-slate-800">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'US'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">{user?.name}</h3>
            <p className="text-xs text-slate-400">{user?.email}</p>
            <span className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Member since:{' '}
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>

        {/* Update Name Form */}
        <form onSubmit={handleUpdateName} className="space-y-4">
          {profileMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{profileMsg}</span>
            </div>
          )}
          {profileError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{profileError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Email Address (Verified)
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800/50 rounded-xl text-sm text-slate-500 cursor-not-allowed"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Email changes are restricted for security verification compliance.
            </p>
          </div>

          <button
            type="submit"
            disabled={updatingProfile}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
          >
            {updatingProfile ? 'Saving...' : 'Update Name'}
          </button>
        </form>
      </div>

      {/* Password Change Form */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Lock className="w-4 h-4 text-slate-400" />
          Change Account Password
        </h3>

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          {passMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{passMsg}</span>
            </div>
          )}
          {passError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{passError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={updatingPass}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
          >
            {updatingPass ? 'Changing Password...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};
