import type { LucideIcon } from "lucide-react";

interface statsProps {
  label: string;
  icon: LucideIcon;
  value: string;
  trend: string;
}

const StatsCard = ({ label, icon: Icon, value, trend }: statsProps) => {
  return (
    <div className="grid grid-cols-2 w-full border border-gray-800 shadow-lg sm:p-6 p-4 rounded-2xl bg-[#1B1B1E] hover:border-purple-500/30 hover:shadow-xl transition-all">
      <div className="flex-col">
        <div className="text-[#A2A2A9] text-sm font-medium mb-3">{label}</div>
        <div className="text-white sm:text-3xl text-2xl font-bold mb-2">{value}</div>
        <div className="text-[#6B6B75] text-xs">{trend}</div>
      </div>
      <div className="flex justify-center items-center relative">
        <div className="bg-linear-to-r from-purple-500 to-pink-400 p-3 rounded-xl flex absolute top-0 right-0 shadow-md">
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
