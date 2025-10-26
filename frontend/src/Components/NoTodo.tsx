import React from "react";
import { Clock } from "lucide-react";
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
    <div className="flex-col items-center justify-center py-20">
      <div className="flex justify-center mb-6">
        <div className="flex justify-center items-center bg-gradient-to-b from-[#4b3a75] text-blue-500 to-[#2a243a] p-3 rounded-2xl w-24 h-24 ">
          <Icon className="w-12 h-12" />
        </div>
      </div>
      <div className="text-center text-white text-2xl font-light mb-4">
        {heading}
      </div>
      <div className="flex items-center justify-center">
        <div className="flex items-center justify-center text-md text-[#A2A2A9] mb-8 max-w-sm text-center">
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
