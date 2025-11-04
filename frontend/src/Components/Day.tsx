import type { LucideIcon } from "lucide-react";

interface DayProps {
  icon: LucideIcon;
  heading: string;
  tasks: string;
}

const Day = ({ icon: Icon, heading, tasks }: DayProps) => {
  return (
    <div className="my-10 flex justify-between gap-4">
      <div className="flex gap-4">
        <div className="bg-linear-to-r from-[#4b3a75] text-blue-500 to-[#2a243a] p-3 rounded-2xl w-12 h-12 flex items-center justify-center">
          <Icon className="w-6 h-6" />
        </div>
        <div className="text-white flex items-center justify-center text-2xl font-semibold">
          {heading}
        </div>
      </div>
      <div className="text-[#A2A2A9] flex items-center">{tasks}</div>
    </div>
  );
};

export default Day;
