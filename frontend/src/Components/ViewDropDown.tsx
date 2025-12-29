import { CalendarDays, SquareKanban } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ViewDropDownProps {
    viewType: string;
    setViewType: (viewType: string) => void;
    buttonRef: React.RefObject<HTMLButtonElement | null>;
    setShowViewDropdown: (showViewDropdown: boolean) => void;
    setViewTypeActive: (viewTypeActive: boolean) => void;
}

export const ViewDropDown = ({viewType, setViewType, buttonRef, setShowViewDropdown, setViewTypeActive}: ViewDropDownProps) => {
    const initialPosition = () => {
        if (buttonRef?.current){
            const rect = buttonRef.current.getBoundingClientRect();
            return {
                left: rect.right,
                bottom: rect.bottom,
            }
        }
        return {left:0,bottom:0}
    }
    const [position, setPosition] = useState(initialPosition)
    useEffect(() => {
        if (buttonRef?.current){
            const rect = buttonRef.current.getBoundingClientRect();
            setPosition({
                left: rect.right,
                bottom: rect.bottom,
            });
        }
    }, [buttonRef]);
    console.log("position", position);
    
  return (
    <>
    <div className='fixed inset-0 z-40 ' onClick={() => {setShowViewDropdown(false)
        setViewTypeActive(false)
    }}/>
    <div className="absolute bg-[#101018] border border-white/10 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-50 min-w-[160px]" style={{top: position.bottom, left: position.left, transform: "translateX(-100%)" }}>
                    <div className="text-white text-sm font-semibold px-4 pt-2">Layout</div>
                    <div className="p-2">
                    <div className="flex gap-2 p-1 rounded-lg bg-white/5 min-w-[200px] max-w-[200px]">
                    <button
                      onClick={() => {
                        setViewType("board");
                      }}
                      className={`w-full px-4 py-2.5 text-sm text-center transition-colors flex-col items-center justify-center gap-3 cursor-pointer rounded-lg ${
                        viewType === "board"
                          ? "bg-purple-500/20 text-purple-400"
                          : "text-[#A2A2A9] hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center justify-center">
                      <SquareKanban className="w-4 h-4" />
                      </div>
                      <span>Board</span>
                    </button>
                    <button
                      onClick={() => {
                        setViewType("calendar");
                      }}
                      className={`w-full px-4 py-2.5 text-sm text-center transition-colors flex-col items-center justify-center gap-3 cursor-pointer rounded-lg ${
                        viewType === "calendar"
                          ? "bg-purple-500/20 text-purple-400"
                          : "text-[#A2A2A9] hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center justify-center">
                      <CalendarDays className="w-4 h-4" />
                      </div>
                        <span>Calendar</span>
                      </button>
                    </div>
                    </div>
                  </div>
                  </>
  )
}
