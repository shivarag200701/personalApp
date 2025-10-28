import React from "react";
import type { Todo } from "./Modal";
import { Tag, Calendar } from "lucide-react";
import { Checkbox } from "../Components/ui/checkbox";

const priorityColors = {
  high: {
    text: "text-[#DC2828]",
    bg: "bg-[#DC282833]",
  },
  medium: {
    text: "text-[#F39C12]",
    bg: "bg-[#F39C1233]",
  },
  low: {
    text: "text-[#28A745]",
    bg: "bg-[#28A74533]",
  },
};

type PriorityKey = keyof typeof priorityColors;

type TaskCardProps = {
  todos: Todo[];
  completed?: boolean;
  onToggleComplete: (todoId: string | number) => void; // 🔑 NEW PROP
};

const TaskCard = ({
  todos,
  completed = false,
  onToggleComplete,
}: TaskCardProps) => {
  return (
    <div className="w-full flex-col ">
      {todos.map((todo, index) => {
        const colors =
          priorityColors[
            todo.priority.toString().toLowerCase() as PriorityKey
          ] || priorityColors.low;
        const handleComplete = () => {
          if (!todo.id) {
            return;
          }
          onToggleComplete(todo.id);
        };
        return (
          <div
            key={index}
            className={`p-5 border border-gray-800  bg-[#1B1B1E] my-4  rounded-2xl ${
              completed ? "brightness-80" : ""
            }`}
          >
            <div className="flex gap-5">
              <div className="">
                <Checkbox
                  className="p-3 border-blue-600 flex items-center justify-center cursor-pointer transform transition-transform duration-100 hover:scale-[1.1]"
                  defaultChecked={completed}
                  onClick={handleComplete}
                />
              </div>
              <div className="flex-col">
                <div
                  className={`text-white text-md font-medium ${
                    completed ? "line-through" : ""
                  }`}
                >
                  {todo.title}
                </div>
                <div className="mt-1 text-[#A2A2A9] text-sm">
                  {todo.description}
                </div>
                <div className="flex mt-3 gap-2">
                  <div
                    className={`py-1 px-2 ${colors.bg} ${colors.text} rounded-md text-xs`}
                  >
                    {todo.priority}
                  </div>
                  <div className="py-1 px-2 text-white bg-[#27272B] rounded-md text-xs flex gap-1">
                    <div className="flex justify-center items-center">
                      <Tag className="w-3 h-3" />
                    </div>
                    <div>{todo.category}</div>
                  </div>
                  <div className="py-1 px-2 text-white bg-[#27272B] rounded-md text-xs flex gap-1">
                    <div className="flex justify-center items-center">
                      <Calendar className="w-3 h-3" />
                    </div>
                    <div>{todo.completeAt}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskCard;
