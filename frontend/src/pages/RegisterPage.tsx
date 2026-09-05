import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth.api';
import { Sparkles, Lock, Mail, User as UserIcon, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const pending = await registerAuth(data.name, data.email, data.password);
      setPendingEmail(pending.email);
      setSuccessMsg(`6-Digit Verification Code sent to ${pending.email}!`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed.');
    }
  };

  const verifyCode = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsVerifying(true);
    try {
      const response = await authApi.verifyRegistration({ email: pendingEmail, code: verificationCode });
      localStorage.setItem('lifeos_token', response.token);
      setSuccessMsg('Email Verified Successfully! Account Created. Redirecting...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  const resendCode = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsResending(true);
    try {
      await authApi.resendRegistrationOtp(pendingEmail);
      setSuccessMsg(`New verification OTP code sent to ${pendingEmail}!`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not resend the verification code.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center space-y-3">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="font-bold text-2xl text-slate-100">
              Life<span className="text-blue-500">OS</span>
            </span>
          </Link>
          <h2 className="text-2xl font-extrabold text-slate-100">Create Account</h2>
          <p className="text-sm text-slate-400">Join LifeOS to organize your deadlines automatically</p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          {successMsg && (
            <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-emerald-400 text-xs font-semibold animate-fade-in">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {pendingEmail ? (
            <form onSubmit={verifyCode} className="space-y-4">
              <p className="text-sm text-slate-300">We sent a 6-digit verification code to <strong>{pendingEmail}</strong>.</p>
              <input
                value={verificationCode}
                onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000000"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-center text-xl tracking-[0.5em] text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500"
                required
              />
              <button type="submit" disabled={isVerifying || verificationCode.length !== 6} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl disabled:opacity-50">
                {isVerifying ? 'Verifying...' : 'Verify Email'}
              </button>
              <button type="button" onClick={resendCode} disabled={isResending} className="w-full text-xs text-blue-400 hover:underline disabled:opacity-50">
                {isResending ? 'Sending...' : 'Resend code'}
              </button>
            </form>
          ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  {...register('name')}
                  type="text"
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="you@domain.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  {...register('password')}
                  type="password"
                  placeholder="At least 8 chars, 1 uppercase & 1 number"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              {errors.password && <p className="text-xs text-rose-400 mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  {...register('confirmPassword')}
                  type="password"
                  placeholder="Re-enter password"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-rose-400 mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Sending Verification Code...' : 'Register'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
          )}

          <div className="text-center pt-2 border-t border-slate-800 text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
