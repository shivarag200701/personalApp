import { CalendarDays, Calendar, CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";

export type TabType = "today" | "upcoming" | "completed";

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  rightContent?: ReactNode;
}

const TabNavigation = ({ activeTab, onTabChange, rightContent }: TabNavigationProps) => {
  const tabs = [
    {
      id: "today" as TabType,
      label: "Today",
      icon: CalendarDays,
    },
    {
      id: "upcoming" as TabType,
      label: "Upcoming",
      icon: Calendar,
    },
    {
      id: "completed" as TabType,
      label: "Completed",
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="flex justify-between items-center mb-5  border-b border-gray-800">
      <div className="flex gap-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all cursor-pointer
              border-b-2 border-transparent
              ${
                isActive
                  ? "text-purple-400 border-purple-400"
                  : "text-[#A2A2A9] hover:text-white hover:border-gray-600"
              }
            `}
          >
            <Icon className={`w-4 h-4 ${isActive ? "text-purple-400" : ""}`} />
            <span>{tab.label}</span>
          </button>
        );
      })}
      </div>
      {rightContent && (
        <div className="flex items-center">
          {rightContent}
        </div>
      )}
    </div>
  );
};

export default TabNavigation;

