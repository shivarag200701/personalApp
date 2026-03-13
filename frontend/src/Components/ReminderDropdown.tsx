import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom"
import { ClockPlus } from 'lucide-react';

interface ReminderDropdownProps {
    buttonRef?: React.RefObject<HTMLButtonElement | null>;
    onClose: () => void
    setReminder: (reminder:boolean) => void
}

const ReminderDropdown = ({buttonRef,onClose,setReminder}:ReminderDropdownProps) => {

    const pickerRef = useRef<HTMLDivElement>(null)

    const getInitialPosition = () => {
        if (buttonRef?.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            return {
                left: rect.left,
                top: rect.top + rect.height ,
            };
        }
        return { left: 0, top: 0 };
    }
    const [position, setPosition] = useState(getInitialPosition);
    useEffect(() => {
        if (buttonRef?.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setPosition({
                left: rect.left,
                top: rect.top + rect.height ,
            });
        }
    }, [buttonRef]);

  return createPortal(<>
  <div className="fixed inset-0 z-80" onClick={onClose} />
        <div ref={pickerRef} className="fixed bg-card border border-border rounded-md shadow-2xl z-90 w-[290px]" style={{
            left: `${position.left}px`,
            top: `${position.top}px`,
        }}>
            <div className="p-4">
                <div className="text-foreground font-semibold pb-4">
                    Reminders
                </div>
                <div className="p-1 border border-border rounded-sm">
                    <div className="flex gap-2">
                        <div className="flex items-center justify-center">
                            <ClockPlus size={18}/>
                        </div>
                    <div>
                        At time of task
                    </div>
                    </div>
                </div>
                <div className="text-xs mt-4 font-light text-muted-foreground">
                Get a notification when it’s time for this task.
                </div>
                <div className="flex justify-end mt-4">
                    <button className="py-2 px-3 bg-accent rounded-sm text-white cursor-pointer text-xs"
                    onClick={() => {
                        setReminder(true)
                        onClose()
                    }}
                    >Add Reminder</button>
                </div>
            </div>
            
        </div>
  </>,document.body)
}

export default ReminderDropdown
