import React, { useState, useRef, useEffect } from "react";
import { Flag, Check } from "lucide-react";

interface PriorityPickerProps {
  selectedPriority: "high" | "medium" | "low" | null;
  onPrioritySelect: (priority: "high" | "medium" | "low" | null) => void;
  onClose: () => void;
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
}

const PriorityPicker = ({ selectedPriority, onPrioritySelect, onClose, buttonRef }: PriorityPickerProps) => {
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const pickerRef = useRef<HTMLDivElement>(null);

  // Calculate position based on button
  useEffect(() => {
    const updatePosition = () => {
      if (buttonRef?.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const spacing = 8;
        
        
        setPosition({
          left: rect.left,
          top: rect.bottom + spacing,
        });
      }
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [buttonRef]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current && 
        !pickerRef.current.contains(event.target as Node) &&
        buttonRef?.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, buttonRef]);

  const priorities = [
    {
      label: "High",
      value: "high" as const,
      color: "text-red-500",
      iconColor: "#DC2828",
    },
    {
      label: "Medium",
      value: "medium" as const,
      color: "text-blue-500",
      iconColor: "#3B82F6",
    },
    {
      label: "Low",
      value: "low" as const,
      color: "text-green-500",
      iconColor: "#28A745",
    },
    {
      label: "None",
      value: null,
      color: "text-gray-500",
      iconColor: "none",
    }
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      {/* Priority Picker */}
      <div
        ref={pickerRef}
        className="fixed bg-[#1B1B1E] border border-gray-800 rounded-md shadow-2xl z-50 w-[200px]"
        style={{
          left: `${position.left}px`,
          top: `${position.top}px`,
        }}
      >
        <div className="p-2 space-y-1">
          {priorities.map((priority) => {
            const isSelected = selectedPriority === priority.value;
            
            return (
              <button
                key={priority.value}
                onClick={() => {
                  onPrioritySelect(priority.value);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#27272B] transition-colors cursor-pointer ${
                  isSelected ? "bg-[#27272B]" : ""
                }`}
              >
                <Flag 
                  className={`w-4 h-4 ${priority.color}`}
                  style={{ fill: isSelected ? priority.iconColor : 'none' }}
                />
                <div className="flex-1 text-left">
                  <div className={`text-sm ${isSelected ? "text-white" : "text-[#A2A2A9]"}`}>
                    {priority.label}
                  </div>
                </div>
                {isSelected && (
                  <Check className="w-4 h-4 text-red-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default PriorityPicker;

