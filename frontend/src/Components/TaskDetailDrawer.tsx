import { useMemo } from "react";
import type { Todo } from "./Modal";
import { Button } from "./ui/button";
import {
  AlarmClock,
  Bell,
  Calendar,
  Check,
  CheckCircle2,
  Clock4,
  Copy,
  Play,
  Repeat,
  Tag,
  Trash2,
  X,
  Pencil,
} from "lucide-react";
import { formatCompleteAt } from "@shiva200701/todotypes";

interface TaskDetailDrawerProps {
  todo: Todo | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (todo: Todo) => void;
  onToggleComplete: (todoId: string | number) => void;
  onDelete: (todoId: string | number) => void;
}

const labelClass = "text-xs uppercase tracking-wide text-gray-400";

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  return date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const TaskDetailDrawer = ({
  todo,
  isOpen,
  onClose,
  onEdit,
  onToggleComplete,
  onDelete,
}: TaskDetailDrawerProps) => {
  const priorityTone = useMemo(() => {
    if (!todo) {
      return { text: "text-white", bg: "bg-white/10" };
    }
    const dictionary: Record<string, { text: string; bg: string }> = {
      high: { text: "text-[#DC2828]", bg: "bg-[#DC282833]" },
      medium: { text: "text-[#F39C12]", bg: "bg-[#F39C1233]" },
      low: { text: "text-[#28A745]", bg: "bg-[#28A74533]" },
    };
    return dictionary[todo.priority?.toLowerCase()] ?? dictionary.low;
  }, [todo]);

  const metadata = useMemo(() => {
    if (!todo) return [];
    return [
      {
        label: "Due",
        value: formatCompleteAt(todo.completeAt),
        icon: Calendar,
      },
      {
        label: "Completed at",
        value: todo.completedAt ? formatDateTime(todo.completedAt) : "—",
        icon: CheckCircle2,
      },
      {
        label: "Category",
        value: todo.category || "Uncategorized",
        icon: Tag,
      },
      {
        label: "Recurring",
        value: todo.isRecurring
          ? `${todo.recurrenceInterval ?? 1} ${todo.recurrencePattern}`
          : "Does not repeat",
        icon: Repeat,
      },
      {
        label: "Next occurrence",
        value: todo.nextOccurrence
          ? formatCompleteAt(todo.nextOccurrence)
          : todo.isRecurring
          ? "Auto-scheduling on complete"
          : "—",
        icon: AlarmClock,
      },
      {
        label: "Recurrence end",
        value: todo.recurrenceEndDate
          ? formatDateTime(todo.recurrenceEndDate)
          : todo.isRecurring
          ? "No end date"
          : "—",
        icon: Bell,
      },
    ];
  }, [todo]);

  if (!todo) {
    return null;
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-100 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] lg:w-[480px] transform transition-transform duration-300 bg-[#131316] border-l border-white/10 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!isOpen}
      >
        <div className="flex h-full flex-col overflow-hidden">
          <div className="flex items-start justify-between border-b border-white/10 p-6">
            <div>
              <p className="text-sm text-gray-400">Task focus</p>
              <h2 className="mt-1 text-2xl font-semibold text-white">
                {todo.title}
              </h2>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityTone.text} ${priorityTone.bg}`}
                >
                  {todo.priority}
                </span>
                <span className="rounded-full bg-[#1F1F22] px-3 py-1 text-xs text-gray-200">
                  {todo.category || "Uncategorized"}
                </span>
                {todo.isRecurring && todo.recurrencePattern && (
                  <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs text-purple-200">
                    {todo.recurrencePattern} · every{" "}
                    {todo.recurrenceInterval ?? 1}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {todo.id && (
                <button
                  className="rounded-full border border-white/10 p-2 text-gray-400 transition hover:text-white cursor-pointer"
                  onClick={() => onToggleComplete(todo.id!)}
                  title="Toggle completion"
                >
                  <Check className="h-4 w-4" />
                </button>
              )}
              <button
                className="rounded-full border border-white/10 p-2 text-gray-400 transition hover:text-white cursor-pointer"
                onClick={() => onEdit(todo)}
                title="Edit task"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                className="rounded-full border border-white/10 p-2 text-gray-400 transition hover:text-red-400 cursor-pointer"
                onClick={() => todo.id && onDelete(todo.id)}
                title="Delete task"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                className="rounded-full border border-white/10 p-2 text-gray-400 transition hover:text-white cursor-pointer"
                onClick={onClose}
                title="Close details"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {todo.description && (
              <section className="rounded-2xl bg-[#1B1B1E] p-5 shadow-inner shadow-black/20">
                <p className={labelClass}>Description</p>
                <p className="mt-3 text-sm text-gray-200 leading-relaxed">
                  {todo.description}
                </p>
              </section>
            )}

            <section className="rounded-2xl bg-[#1B1B1E] p-5">
              <p className={labelClass}>Metadata</p>
              <div className="mt-4 grid grid-cols-1 gap-4 text-sm text-gray-200 sm:grid-cols-2">
                {metadata.map(({ label, value, icon: Icon }) => (
                  <div
                    key={label}
                    className="rounded-xl border border-white/5 bg-[#131315] p-3"
                  >
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-gray-400">
                      <Icon className="h-3 w-3" />
                      {label}
                    </div>
                    <p className="mt-2 text-base text-white">{value}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl bg-[#1B1B1E] p-5">
              <p className={labelClass}>Progress & reminders</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  { label: "Reminder", active: !!todo.completeAt },
                  { label: "Snoozed", active: false },
                  { label: "Notifications", active: todo.completed },
                ].map((chip) => (
                  <span
                    key={chip.label}
                    className={`rounded-full px-3 py-1 text-xs ${
                      chip.active
                        ? "bg-purple-500/20 text-purple-200"
                        : "bg-[#111114] text-gray-500"
                    }`}
                  >
                    {chip.label}
                  </span>
                ))}
              </div>
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/20 text-purple-200">
                    <Clock4 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm text-white">
                      Due {formatCompleteAt(todo.completeAt)}
                    </p>
                    {todo.completedAt && (
                      <p className="text-xs text-gray-400">
                        Completed {formatDateTime(todo.completedAt)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="border-t border-white/10 p-6">
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                className="border border-white/10 bg-transparent text-gray-200 hover:bg-white/5"
              >
                <Bell className="mr-2 h-4 w-4" /> Add Reminder
              </Button>
              <Button
                variant="ghost"
                className="bg-[#1B1B1E] text-white hover:bg-[#222227]"
              >
                <Copy className="mr-2 h-4 w-4" /> Duplicate
              </Button>
              <Button className="flex-1 justify-center bg-purple-600 text-white hover:bg-purple-500">
                <Play className="mr-2 h-4 w-4" /> Start Focus Session
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default TaskDetailDrawer;
