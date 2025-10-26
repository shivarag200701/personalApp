import type { LucideIcon } from "lucide-react";
import { ListTodo } from "lucide-react";

interface statsProps {
  label: string;
  icon: LucideIcon;
  value: number;
  trend: string;
}

const StatsCard = ({ label, icon, value, trend }: statsProps) => {
  return (
    <div className=" grid grid-cols-2 w-full border border-gray-800 shadow-md p-6 rounded-xl bg-[#1B1B1E] hover:opacity-90 transition-opacity">
      <div className="flex-col">
        <div className="text-[#A2A2A9]">{label}</div>
        <div className="text-[#F2F2F2] text-4xl font-bold">{value}</div>
        <div className="text-[#A2A2A9] text-[12px]">{trend}</div>
      </div>
      <div className="flex justify-center items-center relative">
        <div className="bg-gradient-to-b from-[#4b3a75] text-blue-500 to-[#2a243a] p-3 rounded-2xl flex absolute top-0 right-0 ">
          <ListTodo />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
