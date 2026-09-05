import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AppLayout } from '../components/layout/AppLayout';

import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { DashboardPage } from '../pages/DashboardPage';
import { TasksPage } from '../pages/TasksPage';
import { CalendarPage } from '../pages/CalendarPage';
import { AIAssistantPage } from '../pages/AIAssistantPage';
import { AIDailyPlannerPage } from '../pages/AIDailyPlannerPage';
import { AITaskBreakdownPage } from '../pages/AITaskBreakdownPage';
import { AnalyticsPage } from '../pages/AnalyticsPage';
import { NotificationsPage } from '../pages/NotificationsPage';
import { ProfilePage } from '../pages/ProfilePage';
import { SettingsPage } from '../pages/SettingsPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/ai-chat" element={<AIAssistantPage />} />
          <Route path="/ai-planner" element={<AIDailyPlannerPage />} />
          <Route path="/ai-breakdown" element={<AITaskBreakdownPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
