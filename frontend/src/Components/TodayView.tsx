import { useMemo } from "react";
import { CalendarDays, CheckCircle2, Flame, ListTodo, TrendingUp } from "lucide-react";
import type { Todo } from "./Modal";
import StatsCard from "./StatsCard";
import TaskCard from "./TaskCard";
import Day from "./Day";
import NoTodo from "./NoTodo";
import NewSection from "./NewSection";
import LoadingSkeleton from "./LoadingSkeleton";
import { isToday } from "@shiva200701/todotypes";
import { calculateStreak } from "@/utils/calculateStreak";

interface TodayViewProps {
  todos: Todo[];
  loading: boolean;
  onToggleComplete: (todoId: string | number) => void;
  onDelete: (todoId: string | number) => void;
  onEdit: (todo: Todo) => void;
  onAddTask: () => void;
  onViewDetails: (todo: Todo) => void;
}

const TodayView = ({
  todos,
  loading,
  onToggleComplete,
  onDelete,
  onEdit,
  onAddTask,
  onViewDetails,
}: TodayViewProps) => {
  const todayTodos = useMemo(() => {
    return todos.filter(
      (todo) => isToday(todo?.completeAt) && todo?.completed == false
    );
  }, [todos]);

  const todayCompletedTodos = useMemo(() => {
    return todos.filter(
      (todo) => todo?.completed == true && isToday(todo?.completeAt)
    );
  }, [todos]);

  const completedTodos = useMemo(() => {
    return todos.filter((todo) => todo?.completed === true);
  }, [todos]);

  const notCompletedTodos = useMemo(() => {
    return todos.filter((todo) => todo.completed == false);
  }, [todos]);

  const percentage = useMemo(() => {
    if (todos.length == 0) {
      return 0;
    }
    let percentage = (completedTodos.length / todos.length) * 100;
    let roundedPercentage = Math.round(percentage);
    return roundedPercentage;
  }, [completedTodos, todos]);

  const completedDates = useMemo(() => {
    return completedTodos
      .map((todo) => todo.completedAt)
      .filter((date) => date != null)
      .map((date) => new Date(date));
  }, [completedTodos]);

  const currentStreak = useMemo(() => {
    return calculateStreak(completedDates);
  }, [completedDates]);

  return (
    <div className="flex-col space-y-8">
      <NewSection onClick={onAddTask} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatsCard
          value={todos.length.toString()}
          label="Total Tasks"
          trend={`${notCompletedTodos?.length.toString()} actives`}
          icon={ListTodo}
        />
        <StatsCard
          value={todayCompletedTodos.length.toString()}
          trend={`${todayTodos?.length.toString()} today`}
          label="Completed Today"
          icon={CheckCircle2}
        />
        <StatsCard
          label="Streak"
          value={`${currentStreak}d`}
          trend="Keep it up!"
          icon={Flame}
        />
        <StatsCard
          label="Completion"
          value={`${percentage} %`}
          trend="Overall"
          icon={TrendingUp}
        />
      </div>
      <Day
        icon={CalendarDays}
        heading="Today"
        tasks={`${todayTodos?.length.toString()} tasks`}
      />
      {loading ? (
        <LoadingSkeleton />
      ) : todayTodos.length != 0 ? (
        <TaskCard
          todos={todayTodos}
          onToggleComplete={onToggleComplete}
          onDelete={onDelete}
          onEdit={onEdit}
          onViewDetails={onViewDetails}
        />
      ) : (
        <NoTodo
          icon={CheckCircle2}
          heading="All done for today!"
          description="You've completed all your tasks. Take a moment to relax or plan ahead for tomorrow."
          button="Add New Task"
          onClick={onAddTask}
        />
      )}
    </div>
  );
};

export default TodayView;
