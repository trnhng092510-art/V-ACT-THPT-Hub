import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Sparkles,
  Flame,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { DailyTask } from '../types';
import { StorageService } from '../services/storage';
import confetti from 'canvas-confetti';

interface Props {
  streakDays?: number;
}

export const DailyTasksWidget: React.FC<Props> = ({ streakDays = 3 }) => {
  const [tasks, setTasks] = useState<DailyTask[]>(() => StorageService.getDailyTasks());
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Toán học');
  const [newColor, setNewColor] = useState('indigo');
  const [isAdding, setIsAdding] = useState(false);

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const handleToggle = (taskId: string) => {
    const isNowCompleted = StorageService.toggleDailyTask(taskId);
    setTasks(StorageService.getDailyTasks());

    if (isNowCompleted) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {}
      // Record study streak progress
      StorageService.recordStudyStreakDay();
    }
  };

  const handleDelete = (taskId: string) => {
    StorageService.deleteDailyTask(taskId);
    setTasks(StorageService.getDailyTasks());
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const task: DailyTask = {
      id: `task-${Date.now()}`,
      title: newTitle.trim(),
      subject: newSubject,
      color: newColor,
      completed: false,
      createdAt: Date.now(),
    };

    StorageService.addDailyTask(task);
    setTasks(StorageService.getDailyTasks());
    setNewTitle('');
    setIsAdding(false);
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'rose':
        return 'border-rose-500/30 bg-rose-950/20 text-rose-300';
      case 'emerald':
        return 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300';
      case 'purple':
        return 'border-purple-500/30 bg-purple-950/20 text-purple-300';
      case 'amber':
        return 'border-amber-500/30 bg-amber-950/20 text-amber-300';
      case 'cyan':
        return 'border-cyan-500/30 bg-cyan-950/20 text-cyan-300';
      default:
        return 'border-indigo-500/30 bg-indigo-950/20 text-indigo-300';
    }
  };

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-white/10 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/25">
            <CheckSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <span>✅ Mục Tiêu Hôm Nay (Daily Study Tasks)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                {completedCount}/{tasks.length} Đã Xong
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Chia nhỏ mục tiêu rèn luyện mỗi ngày để duy trì chuỗi học tập bền vững
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow flex items-center gap-1.5 self-start sm:self-auto whitespace-nowrap shrink-0 cursor-pointer transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Thêm mục tiêu</span>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-slate-400 font-medium">
          <span>Tiến độ hoàn thành</span>
          <span className="font-mono text-emerald-400 font-bold">{progressPercent}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Add Task Quick Form */}
      {isAdding && (
        <form onSubmit={handleAddTask} className="p-3.5 rounded-2xl bg-slate-900/80 border border-indigo-500/30 space-y-3 animate-in fade-in text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Mục tiêu cần hoàn thành hôm nay:</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="VD: Làm 1 đề Toán 2026, Thuộc 15 từ vựng, Đọc 1 bài đọc hiểu..."
              className="w-full px-3 py-2 rounded-xl glass-input text-white border border-white/10"
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-300 mb-1">Phân môn:</label>
              <select
                value={newSubject}
                onChange={(e) => {
                  setNewSubject(e.target.value);
                  if (e.target.value === 'Toán học') setNewColor('indigo');
                  else if (e.target.value === 'Tiếng Anh') setNewColor('emerald');
                  else if (e.target.value === 'ĐGNL V-ACT') setNewColor('purple');
                  else if (e.target.value === 'Ngữ văn') setNewColor('rose');
                  else setNewColor('amber');
                }}
                className="w-full px-3 py-1.5 rounded-xl glass-input text-white border border-white/10 bg-slate-900"
              >
                <option value="Toán học">Toán học</option>
                <option value="Tiếng Anh">Tiếng Anh</option>
                <option value="ĐGNL V-ACT">ĐGNL V-ACT</option>
                <option value="Ngữ văn">Ngữ văn</option>
                <option value="Vật lý">Vật lý</option>
                <option value="Hóa học">Hóa học</option>
                <option value="Sinh học">Sinh học</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Màu thẻ:</label>
              <select
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl glass-input text-white border border-white/10 bg-slate-900"
              >
                <option value="indigo">Xanh Indigo</option>
                <option value="emerald">Xanh Ngọc (Emerald)</option>
                <option value="purple">Tím Mộng Mơ (Purple)</option>
                <option value="rose">Hồng Quyết Tâm (Rose)</option>
                <option value="amber">Vàng Cam (Amber)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 rounded-xl text-slate-400 hover:text-white"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold shadow"
            >
              Lưu Mục Tiêu
            </button>
          </div>
        </form>
      )}

      {/* Task List */}
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {tasks.map((task) => (
          <div
            key={task.id}
            onClick={() => handleToggle(task.id)}
            className={`p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition select-none ${getColorClasses(
              task.color
            )} ${task.completed ? 'opacity-60 bg-slate-950/40 line-through' : 'hover:scale-[1.01]'}`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggle(task.id);
                }}
                className={`p-1 rounded-lg transition ${
                  task.completed ? 'text-emerald-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                {task.completed ? (
                  <CheckSquare className="w-5 h-5 fill-emerald-500/20 text-emerald-400" />
                ) : (
                  <Square className="w-5 h-5" />
                )}
              </button>
              <div className="min-w-0">
                <span className={`font-semibold text-xs sm:text-sm block truncate ${task.completed ? 'text-slate-400' : 'text-white'}`}>
                  {task.title}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {task.subject}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(task.id);
              }}
              className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition shrink-0"
              title="Xóa mục tiêu"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="text-center py-6 text-xs text-slate-400">
            Chưa có mục tiêu nào hôm nay. Bấm "+ Thêm mục tiêu" để khởi đầu ngày mới đầy năng lượng!
          </div>
        )}
      </div>
    </div>
  );
};
