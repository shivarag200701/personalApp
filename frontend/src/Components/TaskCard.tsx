import type { Todo } from "./Modal";
import { Tag, Calendar, Trash, Pencil, Repeat } from "lucide-react";
import { Checkbox } from "../Components/ui/checkbox";
import { formatCompleteAt } from "@shiva200701/todotypes";

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
  onToggleComplete: (todoId: string | number) => void; // 🔑 NEW PROP
  onDelete: (todoId: string | number) => void;
  onEdit?: (todo: Todo) => void; 
};

const TaskCard = ({ todos, onToggleComplete, onDelete, onEdit }: TaskCardProps) => {
  return (
    <div className="w-full flex-col ">
      {todos.map((todo) => {
        const colors =
          priorityColors[
            todo.priority.toString().toLowerCase() as PriorityKey
          ] || priorityColors.low;
          const handleDelete = async () => {
            if (!todo.id) {
              return;
            }
            onDelete(todo.id);
          }
        const handleComplete = () => {
          if (!todo.id) {
            return;
          }
          onToggleComplete(todo.id);
        };
        const handleEdit = () =>{
          if (onEdit){
            onEdit(todo);
          }
        }
        console.log(todo);
        
        return (
          <div
            key={todo.id}
            className={`p-5 border border-gray-800 relative  bg-[#1B1B1E] my-4  rounded-2xl ${
              todo.completed ? "brightness-80" : ""
            }`}
          >
             <div className="absolute top-2 right-2 flex gap-2">
              <button 
                className="text-gray-500 hover:text-purple-400 text-xl cursor-pointer transition-colors" 
                onClick={handleEdit}
                title="Edit task"
              >
                <Pencil className="w-5 h-5" />
              </button>
              <button 
                className="text-gray-500 hover:text-gray-700 text-xl cursor-pointer hover:animate-jiggle" 
                onClick={handleDelete}
                title="Delete task"
              >
                <Trash className="w-5 h-5" />
              </button>
            </div>
            <div className="flex gap-5">
              <div className="">
                <Checkbox
                  className="p-3 border-blue-600 flex items-center justify-center cursor-pointer transform transition-transform duration-100 hover:scale-[1.1]"
                  defaultChecked={todo.completed}
                  onClick={handleComplete}
                />
              </div>
              <div className="flex-col">
                <div
                  className={`text-white text-md font-medium ${
                    todo.completed ? "line-through" : ""
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
                  {todo.isRecurring && (
                    <div className="py-1 px-2 text-white bg-[#27272B] rounded-md text-xs flex gap-1">
                      <div className="flex justify-center items-center">
                        <Repeat className="w-3 h-3" />
                      </div>
                      <div>{todo.recurrencePattern}</div>
                    </div>
                  )}
                  <div className="py-1 px-2 text-white bg-[#27272B] rounded-md text-xs flex gap-1">
                    <div className="flex justify-center items-center">
                      <Calendar className="w-3 h-3" />
                    </div>
                    <div>{formatCompleteAt(todo.completeAt)}</div>
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
