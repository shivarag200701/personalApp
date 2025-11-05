import type { LucideIcon } from "lucide-react";
import Button from "./Button";

interface NoTodoProps {
  icon: LucideIcon;
  heading: string;
  description: string;
  button: string;
}

const NoTodo = ({ icon: Icon, heading, description, button }: NoTodoProps) => {
  return (
    <div className="flex-col items-center justify-center py-12 md:py-16">
      <div className="flex justify-center mb-6">
        <div className="flex justify-center items-center bg-linear-to-r from-purple-500 to-pink-400 p-4 rounded-2xl w-20 h-20 md:w-24 md:h-24 shadow-lg">
          <Icon className="w-10 h-10 md:w-12 md:h-12 text-white" />
        </div>
      </div>
      <div className="text-center text-white text-xl md:text-2xl font-semibold mb-3">
        {heading}
      </div>
      <div className="flex items-center justify-center">
        <div className="flex items-center justify-center text-sm md:text-base text-[#A2A2A9] mb-8 max-w-md text-center leading-relaxed">
          {description}
        </div>
      </div>
      <div className="flex items-center justify-center">
        <div className="min-w-50">
          <Button Initial={button} />
        </div>
      </div>
    </div>
  );
};

export default NoTodo;
