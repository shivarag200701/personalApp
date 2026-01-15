import { Sparkles, Plus } from "lucide-react";

interface NewSectionProps {
  onClick: () => void;
}

const NewSection = ({ onClick }: NewSectionProps) => {
  return (
      <div 
        className="text-white mb-8 bg-card border border-border hover:border-accent/50 p-6 rounded-2xl cursor-pointer transition-all hover:bg-muted" 
        onClick={onClick}
      >
        <div className="flex justify-between items-center">
          <div className="flex gap-4 items-center">
            <div className="bg-linear-to-r from-purple-500 to-pink-400 w-12 h-12 flex items-center justify-center rounded-xl shadow-lg">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
              <div className="text-muted-foreground font-medium items-center justify-center text-base sm:text-lg">
                <span className="hidden sm:inline">What needs to be done?</span>
                <span className="sm:hidden">Add new task</span>
              </div>
              <div className="text-[#6B6B75] font-light items-center justify-center text-sm sm:text-base">
                <span className="hidden sm:inline">Click to add details...</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <Sparkles className="text-purple-400 animate-pulse w-5 h-5" />
          </div>
        </div>
      </div>
  );
};

export default NewSection;
