import { useLayoutEffect, useRef, useState } from "react";
import {createPortal} from "react-dom";

interface TimePickerProps {
    onClose: () => void;
    buttonRef?: React.RefObject<HTMLButtonElement | null>;
    selectedTime: TimeOption;
    onTimeSelect: (time: string) => void;
    setIsAllDay: (isAllDay: boolean) => void;
}
interface TimeOption {
    value: string;
    label: string;
}

interface TimeOptionProps {
    onTimeSelect: (time: string) => void;
    onClose: () => void;
    buttonRef: React.RefObject<HTMLButtonElement | null>;
}
const TimePicker = ({ onClose, buttonRef, selectedTime, onTimeSelect, setIsAllDay }: TimePickerProps) => {

    const pickerRef = useRef<HTMLDivElement>(null);
    const timeOptionButtonRef = useRef<HTMLButtonElement>(null);
    const [isTimeOptionOpen, setIsTimeOptionOpen] = useState(false);

    
    const getInitialPosition = () => {
        if (buttonRef?.current){
            const rect = buttonRef.current.getBoundingClientRect();
            return {
                left: rect.left + rect.width/2,
                top: rect.top,
            };  
        }
        return { left: 0, top: 0 };
    }
    const [position, setPosition] = useState(getInitialPosition);
    useLayoutEffect(() => {
        if (buttonRef?.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setPosition({
                left: rect.left + rect.width/2,
                top: rect.top,
            });
        }
    }, [buttonRef]);



  
  
  return createPortal(
    <>
    <div
    className="fixed inset-0 z-60"
    onClick={onClose}
    />
    <div
    ref={pickerRef}
    className="fixed bg-card border border-border rounded-md shadow-2xl z-70 w-[300px]"
    style={{
        left: `${position.left}px`,
        top: `${position.top}px`,
        transform: 'translateY(-100%) translateX(-50%)',
        marginTop: '-4px'
    }}
    onClick={(e) => e.stopPropagation()}
    >
        <div className="flex flex-col gap-2 p-3">
            <div className="grid grid-cols-[1fr_2fr] gap-2">
            <div className="text-foreground text-sm font-light">Time</div>
            <button ref={timeOptionButtonRef} className="w-full p-1 border-[0.5px] border-border flex items-center  text-center gap-2 rounded-sm cursor-pointer 
            hover:border-[0.5px]
            hover:border-white/40 transition-colors duration-300" onClick={() => setIsTimeOptionOpen(!isTimeOptionOpen)}>
                <div className="text-foreground text-sm font-light text-left">{selectedTime.label}</div>
            </button>
            </div>
            <div className="grid grid-cols-[1fr_2fr] gap-2">
            <div className="text-foreground text-sm font-light">Duration</div>
            <button className="w-full p-1 border-[0.5px] border-border flex items-center  text-center gap-2 rounded-sm cursor-pointer 
            hover:border-[0.5px]
            hover:border-white/40 transition-colors duration-300" >
                <div className="text-foreground text-sm font-light text-left">No duration</div>
            </button>
            </div>
        </div>
        <div className="h-px w-full bg-gray-700"/>
        <div className="flex flex-col gap-2 p-3">
            <div className="grid grid-cols-[1fr_2fr] gap-2">
            <div className="text-foreground text-sm font-light">Time zone</div>
            </div>
        </div>
        <div className="h-px w-full bg-gray-700"/>
        <div className="flex justify-end">
        <div className=" flex justify-between p-3.5 gap-2">
            <button className="w-full py-1.5 px-4  bg-muted hover:bg-muted flex items-center  text-center gap-2 rounded-sm cursor-pointer transition-colors duration-300" onClick={() => {onClose(); setIsAllDay(true);}}>
                <div className="text-foreground text-xs font-light text-left">Cancel</div>
            </button>
            <button className="w-full py-1.5 px-4 bg-red-600 hover:bg-red-500 flex items-center  text-center gap-2 rounded-sm cursor-pointer
            transition-colors duration-300" onClick={() => {onClose(); setIsAllDay(false);}}>
                <div className="text-white text-xs font-light text-left">Save</div>
            </button>
        </div>
        </div>
    </div>
    {isTimeOptionOpen && (
        <TimeOption 
        onTimeSelect={(time: string) => {
          onTimeSelect(time);
          setIsTimeOptionOpen(false);
        }} 
        onClose={() => setIsTimeOptionOpen(false)}
         buttonRef={timeOptionButtonRef} />
    )}
    </>
    ,document.body);
}

const TimeOption = ({ onTimeSelect, onClose, buttonRef }: TimeOptionProps) => {
    const getInitialPosition = () => {
        if (buttonRef?.current){
            const rect = buttonRef.current.getBoundingClientRect();
            return {
                left: rect.left,
                top: rect.bottom,
                width: rect.width*0.8,
            };
        }
        return { left: 0, top: 0 };
    }
    const [position, setPosition] = useState(getInitialPosition);
    useLayoutEffect(() => {
        if (buttonRef?.current){
            const rect = buttonRef.current.getBoundingClientRect();
            setPosition({
                left: rect.left,
                top: rect.bottom,
                width: rect.width*0.8,
            });
        }
    }, [buttonRef]);
    const generateTimeOptions = (): TimeOption[] => {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const currentMinutes = hours*60 + minutes;
        const timeOptions: TimeOption[] = [];
        for (let i = currentMinutes; i< currentMinutes + 24*60; i++) {
            let hours = Math.floor(i/60);
            const minutes = i % 60;
            if (minutes % 15 !== 0) continue;
            if (hours > 23){
                hours = hours - 24;
            }
            const value = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const hours12 = hours % 12 || 12;
            const label = `${hours12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
            timeOptions.push({ value, label });
        }
        return timeOptions;
      }
      let timeOptions: TimeOption[] = generateTimeOptions();
      return (
        <>
        <div className="fixed inset-0 z-80"
        onClick={onClose}
        />
        <div className="fixed bg-card border border-border rounded-md shadow-2xl z-90 max-h-[200px] overflow-y-auto"
        style={{
            left: `${position.left}px`,
            top: `${position.top}px`,
            marginTop: '4px',
            width: position.width,
        }}
        onClick={(e) => e.stopPropagation()}
        >
            {timeOptions.map((time) => <button key={time.value} className="w-full p-2.5  flex text-left gap-2 rounded-sm cursor-pointer hover:border-border transition-colors duration-300 text-foreground text-sm font-light hover:bg-muted" onClick={(e) => {
              onTimeSelect(time.value);
              e.stopPropagation();
            }}>{time.label}</button>)}
        </div>
        </>
      )

};

export default TimePicker;

