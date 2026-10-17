import React from 'react';
import { RoutineBlock } from '../types/schedule';
import { ROUTINE_CATEGORIES } from '../data/categories';
import {
  Sun,
  Brain,
  Coffee,
  Moon,
  Clock,
  Bell,
  CheckCircle,
  Flame,
  Edit2,
  Trash2,
} from 'lucide-react';

interface CardsViewProps {
  blocks: RoutineBlock[];
  onEditBlock: (block: RoutineBlock) => void;
  onDeleteBlock: (blockId: string) => void;
}

export const CardsView: React.FC<CardsViewProps> = ({
  blocks,
  onEditBlock,
  onDeleteBlock,
}) => {
  const timeToMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const format12Hour = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH}:${String(m).padStart(2, '0')} ${period}`;
  };

  // Group into phases
  const phases = [
    {
      title: 'Morning Foundation',
      subtitle: 'Hydration, movement, breakfast & workspace setup',
      icon: Sun,
      color: 'text-amber-500',
      bgHeader: 'bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-300',
      filter: (b: RoutineBlock) => timeToMinutes(b.startTime) < 8 * 60,
    },
    {
      title: 'Deep Focus & Study Blocks',
      subtitle: 'Hardest tasks first, high cognitive energy & 10-min alerts',
      icon: Brain,
      color: 'text-indigo-500',
      bgHeader: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-800 dark:text-indigo-300',
      filter: (b: RoutineBlock) =>
        timeToMinutes(b.startTime) >= 8 * 60 && timeToMinutes(b.startTime) < 12 * 60 + 15,
    },
    {
      title: 'Afternoon Flow & Execution',
      subtitle: 'Lunch rest, classes, meetings, correspondence & errands',
      icon: Coffee,
      color: 'text-teal-500',
      bgHeader: 'bg-teal-500/10 border-teal-500/20 text-teal-800 dark:text-teal-300',
      filter: (b: RoutineBlock) =>
        timeToMinutes(b.startTime) >= 12 * 60 + 15 && timeToMinutes(b.startTime) < 17 * 60,
    },
    {
      title: 'Evening Renewal & Sleep',
      subtitle: 'Free time, dinner, planning tomorrow & screen-free sleep',
      icon: Moon,
      color: 'text-sky-500',
      bgHeader: 'bg-sky-500/10 border-sky-500/20 text-sky-800 dark:text-sky-300',
      filter: (b: RoutineBlock) => timeToMinutes(b.startTime) >= 17 * 60,
    },
  ];

  return (
    <div className="space-y-6">
      {phases.map((phase) => {
        const phaseBlocks = blocks
          .filter(phase.filter)
          .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

        if (phaseBlocks.length === 0) return null;

        const IconComponent = phase.icon;

        return (
          <div
            key={phase.title}
            className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50 sm:p-5"
          >
            {/* Phase Header */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${phase.bgHeader}`}
              >
                <IconComponent className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {phase.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {phase.subtitle}
                </p>
              </div>
            </div>

            {/* Blocks Grid */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {phaseBlocks.map((block) => {
                const category = ROUTINE_CATEGORIES[block.category] || ROUTINE_CATEGORIES.morning;
                const isDeep = block.category === 'deep-work';

                return (
                  <div
                    key={block.id}
                    className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs transition hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-800"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${category.bgClass} ${category.textClass}`}
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: category.hex }}
                          />
                          {category.label}
                        </span>

                        <div className="flex items-center gap-1">
                          {block.has10MinReminder && (
                            <span
                              className="flex items-center gap-0.5 rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                              title="10m alert"
                            >
                              <Bell className="h-2.5 w-2.5" />
                              10m
                            </span>
                          )}
                          <button
                            onClick={() => onEditBlock(block)}
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <span>{format12Hour(block.startTime)} – {format12Hour(block.endTime)}</span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {block.title}
                      </h4>

                      {block.notes && (
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                          {block.notes}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-400 dark:border-slate-700/60">
                      <span>{block.days.join(', ')}</span>
                      <span className="flex items-center gap-1">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: category.hex }}
                        />
                        {category.colorName}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
