import { useMemo } from "react";
import { CheckCircle2 } from "lucide-react";
import type { Todo } from "./Modal";
import TaskCard from "./TaskCard";
import Day from "./Day";
import NoTodo from "./NoTodo";
import LoadingSkeleton from "./LoadingSkeleton";

interface CompletedViewProps {
  todos: Todo[];
  loading: boolean;
  onToggleComplete: (todoId: string | number) => void;
  onDelete: (todoId: string | number) => void;
  onEdit: (todo: Todo) => void;
  onAddTask: () => void;
  onViewDetails: (todo: Todo) => void;
}

const CompletedView = ({
  todos,
  loading,
  onToggleComplete,
  onDelete,
  onEdit,
  onAddTask,
  onViewDetails,
}: CompletedViewProps) => {
  const completedTodos = useMemo(() => {
    return todos.filter((todo) => todo?.completed === true);
  }, [todos]);

  return (
    <div className="flex-col space-y-8">
      <Day
        icon={CheckCircle2}
        heading="Completed"
        tasks={`${completedTodos?.length.toString()} tasks`}
      />
      {loading ? (
        <LoadingSkeleton />
      ) : completedTodos.length != 0 ? (
        <TaskCard
          todos={completedTodos}
          onToggleComplete={onToggleComplete}
          onDelete={onDelete}
          onEdit={onEdit}
          onViewDetails={onViewDetails}
        />
      ) : (
        <NoTodo
          icon={CheckCircle2}
          heading="No completed tasks yet"
          description="Complete your tasks to see them here. Keep up the great work!"
          button="Add New Task"
          onClick={onAddTask}
        />
      )}
    </div>
  );
};

export default CompletedView;
