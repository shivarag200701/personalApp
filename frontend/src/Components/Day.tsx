import type { LucideIcon } from "lucide-react";

interface DayProps {
  icon: LucideIcon;
  heading: string;
  tasks: string;
}

const Day = ({ icon: Icon, heading, tasks }: DayProps) => {
  return (
    <div className="flex justify-between items-center gap-4 mb-6 pb-4 border-b border-gray-800">
      <div className="flex gap-4 items-center">
        <div className="bg-linear-to-r from-purple-500 to-pink-400 p-3 rounded-xl w-12 h-12 flex items-center justify-center shadow-md">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="text-white flex items-center justify-center text-xl md:text-2xl font-semibold">
          {heading}
        </div>
      </div>
      <div className="text-[#A2A2A9] text-sm md:text-base flex items-center font-medium">{tasks}</div>
    </div>
  );
};

export default Day;
