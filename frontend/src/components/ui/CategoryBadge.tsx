import React from 'react';
import { TaskCategory } from '../../types';
import {
  BookOpen,
  GraduationCap,
  FolderGit2,
  Trophy,
  Briefcase,
  UserCheck,
  Award,
  Users,
  Calendar,
  User,
  Tag,
} from 'lucide-react';

interface CategoryBadgeProps {
  category: TaskCategory;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category }) => {
  const getIcon = () => {
    switch (category) {
      case 'ASSIGNMENT': return <BookOpen className="w-3 h-3 text-cyan-400" />;
      case 'EXAM': return <GraduationCap className="w-3 h-3 text-rose-400" />;
      case 'PROJECT': return <FolderGit2 className="w-3 h-3 text-emerald-400" />;
      case 'HACKATHON': return <Trophy className="w-3 h-3 text-amber-400" />;
      case 'JOB': return <Briefcase className="w-3 h-3 text-indigo-400" />;
      case 'INTERNSHIP': return <UserCheck className="w-3 h-3 text-blue-400" />;
      case 'SCHOLARSHIP': return <Award className="w-3 h-3 text-purple-400" />;
      case 'MEETING': return <Users className="w-3 h-3 text-teal-400" />;
      case 'EVENT': return <Calendar className="w-3 h-3 text-pink-400" />;
      case 'PERSONAL': return <User className="w-3 h-3 text-sky-400" />;
      default: return <Tag className="w-3 h-3 text-slate-400" />;
    }
  };

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium bg-slate-800/90 text-slate-300 border border-slate-700">
      {getIcon()}
      {category}
    </span>
  );
};
