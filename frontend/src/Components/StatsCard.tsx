import type { LucideIcon } from "lucide-react";
import { ListTodo } from "lucide-react";

interface statsProps {
  label: string;
  icon: LucideIcon;
  value: string;
  trend: string;
}

const StatsCard = ({ label, icon, value, trend }: statsProps) => {
  return (
    <div className=" grid grid-cols-2 max-w-[200px] shadow-md p-6 rounded-xl bg-[#1B1B1E] hover:opacity-90 transition-opacity">
      <div className="flex-col">
        <div className="text-[#A2A2A9]">Total Tasks</div>
        <div className="text-[#F2F2F2] text-4xl font-bold">7</div>
        <div className="text-[#A2A2A9] text-[12px]">6 active</div>
      </div>
      <div className="flex justify-center items-center">
        <div className="bg-gradient-to-b from-[#4b3a75] text-blue-500 to-[#2a243a] p-4 rounded-2xl self-start flex items-center justify-center w-auto justify-self-start">
          <ListTodo />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
