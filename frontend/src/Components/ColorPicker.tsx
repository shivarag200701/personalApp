import { Check } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface ColorPickerProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
  onClose: () => void;
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
}

const ColorPicker = ({ selectedColor, onColorSelect, onClose, buttonRef }: ColorPickerProps) => {

  const getInitialPosition = () => {
    if (buttonRef?.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      return {
        left: rect.left,
        top: rect.top + rect.height,
      };
    }
    return { left: 0, top: 0 };
  };
  const [position, setPosition] = useState(getInitialPosition);
  const pickerRef = useRef<HTMLDivElement>(null);



  // Calculate position based on button
  useEffect(() => {
    const updatePosition = () => {
      if (buttonRef?.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        
        setPosition({
          left: rect.left,
          top: rect.top + rect.height,
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

  const colors = [
    // Reds
    { color: "bg-red-600" },   // bright red
    { color: "bg-rose-400" },  // soft red / salmon

    // Oranges / Yellows
    { color: "bg-orange-500" },
    { color: "bg-yellow-400" },

    // Greens
    { color: "bg-emerald-400" },
    { color: "bg-green-700" },

    // Blues
    { color: "bg-sky-500" },
    { color: "bg-blue-600" },

    // Purples
    { color: "bg-indigo-400" },
    { color: "bg-purple-600" },

    // Grey
    { color: "bg-neutral-600" },
  ];

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      {/* Priority Picker */}
      <div
        ref={pickerRef}
        className="absolute bg-card border border-border rounded-md shadow-2xl z-50 w-[50px]"
        style={{
          left: `${position.left}px`,
          top: `${position.top}px`,
        }}
      >
        <div className="grid grid-cols-2">
          {colors.map((color) => {
            const isSelected = selectedColor === color.color;
            
            return (
              <button
                key={color.color}
                onClick={() => {
                  onColorSelect(color.color);
                  onClose();
                }}
                className={`w-full flex items-center justify-center p-0.5 rounded-lg transition-colors cursor-pointer hover:bg-muted`}
              >
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${color.color}`}>
                    {isSelected && (
                        <Check className="w-4 h-4 text-black" />
                    )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>,
    document.body,
  );
};

export default ColorPicker;

