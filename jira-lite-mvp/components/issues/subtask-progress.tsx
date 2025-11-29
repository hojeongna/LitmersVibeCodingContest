interface SubtaskProgressProps {
  completed: number;
  total: number;
}

export function SubtaskProgress({ completed, total }: SubtaskProgressProps) {
  if (total === 0) return null;

  const percentage = (completed / total) * 100;
  const isComplete = completed === total;

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            isComplete ? 'bg-green-500' : 'bg-primary'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
        {completed}/{total}
      </span>
    </div>
  );
}
