import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom';
import { type RecurrencePattern } from '@shiva200701/todotypes';
interface ReccurencePickerProps {
    buttonRef?: React.RefObject<HTMLButtonElement | null>;
    onClose: () => void
    onRecurringSelect?: (config: {
        isRecurring: boolean;
        recurrencePattern?: "daily" | "weekly" | "monthly" | "yearly";
        recurrenceInterval?: number;
        recurrenceEndDate?: string | null;
      }) => void;
    onDateSelect: (date: string) => void;
    selectedDate: string
}

interface RecurrenceOption {
    id: string;
    primary: string;
    secondary: string;
    recurrencePattern: RecurrencePattern;
    recurrenceInterval: number;
    recurrenceEndDate: string | null;
}

const ReccurencePicker = ({buttonRef, onClose, onRecurringSelect,selectedDate}: ReccurencePickerProps) => {
    const pickerRef = useRef<HTMLDivElement>(null)
    const getInitialPosition = () => {
        if (buttonRef?.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            return {
                left: rect.left,
                top: rect.top ,
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
                top: rect.top ,
            });
        }
    }, [buttonRef]);
    const getOrdinal = (n: number) => {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
      };

    const date = new Date(selectedDate)
    const Day = date.toLocaleDateString('en-US', { weekday: 'long' });
    const DayOrdinal = getOrdinal(date.getDate());
    const Month = date.toLocaleDateString('en-US', { month: 'long' });

    const options: RecurrenceOption[] = [
        {
            id:"daily",
            primary: 'Every Day',
            secondary: '',
            recurrencePattern: "daily",
            recurrenceInterval: 1,
            recurrenceEndDate: null,
        },
        {
            id:"weekly",
            primary: 'Every Week',
            secondary: `on ${Day}`,
            recurrencePattern: "weekly",
            recurrenceInterval: 1,
            recurrenceEndDate: null,
        },
        {
            id:"monthly",
            primary: 'Every Month',
            secondary: `on the ${DayOrdinal}`,
            recurrencePattern: "monthly",
            recurrenceInterval: 1,
            recurrenceEndDate: null,
        },
        {
            id:"yearly",
            primary: 'Every Year',
            secondary: `on ${Month} ${DayOrdinal}`,
            recurrencePattern: "yearly",
            recurrenceInterval: 1,
            recurrenceEndDate: null,
        }
        
    ]

    const handleClick = (option: RecurrenceOption) => () => {
        if (onRecurringSelect) {            
            // onDateSelect(formatDate(today));
            onRecurringSelect({
                isRecurring: true,
                recurrencePattern: option.recurrencePattern,
                recurrenceInterval: option.recurrenceInterval,
                recurrenceEndDate: option.recurrenceEndDate,
            });
        }
        onClose();
    }
    return createPortal(
        <>
        <div className="fixed inset-0 z-80" onClick={onClose} />
        <div ref={pickerRef} className="fixed bg-card border border-border rounded-md shadow-2xl z-90 w-[250px]" style={{
            left: `${position.left}px`,
            top: `${position.top}px`,
            transform: 'translateY(-100%)',
        }}>
            <div className="px-2 py-2">
                <div className='flex flex-col gap-1'>
                    {options.map((option) => (
                        <button key={option.id} onClick={handleClick(option)} >
                            <div className='text-foreground text-xs text-left font-light cursor-pointer hover:bg-muted transition-colors duration-300 rounded-sm py-2 pl-8'>{option.primary} <span className='text-muted-foreground text-xs text-left font-light'>{option.secondary}</span></div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
        </>
        ,document.body)
}

export default ReccurencePicker