import { Sparkles, Plus } from "lucide-react";

interface NewSectionProps {
  onClick: () => void;
}

const NewSection = ({ onClick }: NewSectionProps) => {
  return (
    <button onClick={onClick} className="w-full">
      <div className="text-white my-10 bg-[#1b1a22] p-8 rounded-2xl cursor-pointer bg-opacity-100 hover:bg-transparent ring-[0.3px] ring-blue-500">
        <div className="flex justify-between">
          <div className="flex gap-5">
            <div className="bg-linear-to-r from-purple-500 to-pink-400 w-10 h-10 flex items-center justify-center p-2 rounded-sm">
              <Plus />
            </div>
            <div className="flex gap-1">
              <div className="text-gray-400 flex font-light items-center justify-center text-md sm:text-md ">
                <div className="hidden sm:block">What needs to be done?</div>
              </div>
              <div className="text-gray-400 font-light flex items-center justify-center text-md sm:text-md ">
                Click to add details...
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <Sparkles className="text-blue-500 animate-pulse" />
          </div>
        </div>
      </div>
    </button>
  );
};

export default NewSection;
