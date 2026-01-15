import { Tag } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface MoreOptionsPickerProps {
  onClose: () => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  onCategoryClick: () => void;
}

const MoreOptionsPicker = ({ onClose, buttonRef, onCategoryClick }: MoreOptionsPickerProps) => {
  // Calculate initial position synchronously to avoid flash at (0, 0)
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

  const handleCategoryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onCategoryClick(); // Notify parent to show CategoryPicker
    onClose(); // Close MoreOptionsPicker
  };

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onMouseDown={(e) => {
          // Don't close if clicking on the picker or button
          if (
            pickerRef.current?.contains(e.target as Node) ||
            buttonRef?.current?.contains(e.target as Node)
          ) {
            return;
          }
          onClose();
        }}
      />
      {/* More Options Picker */}
      <div
        ref={pickerRef}
        className="fixed bg-card border border-border rounded-md shadow-2xl z-50 w-[150px] md:w-[200px]"
        style={{
          left: `${position.left}px`,
          top: `${position.top}px`,
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-2 space-y-1">
          <button 
            onClick={handleCategoryClick}
            onMouseDown={(e) => e.stopPropagation()}
            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer text-muted-foreground text-sm"
          >
            <Tag className="w-4 h-4" />
            <span>Category</span>
          </button>
        </div>
      </div>
    </>,
    document.body
  )
}

interface CategoryPickerProps {
  onClose: () => void;
  onCategorySelect: (category: string) => void;
  selectedCategory?: string;
  titleInputRef?: React.RefObject<HTMLInputElement | null>;
}

const CategoryPicker = ({ onClose, onCategorySelect, selectedCategory, titleInputRef }: CategoryPickerProps) => {
  // Calculate initial position synchronously to avoid flash at (0, 0)
  const getInitialPosition = () => {
    if (titleInputRef?.current) {
      const rect = titleInputRef.current.getBoundingClientRect();
      return {
        left: rect.left,
        top: rect.top + rect.height,
        width: rect.width,
      };
    }
    return { left: 0, top: 0, width: 250 };
  };

  const [position, setPosition] = useState(getInitialPosition);
  const [customCategory, setCustomCategory] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const presetCategories = ["Work", "Personal", "Health"];

  // Calculate position and width based on title input and form
  useEffect(() => {
    const updatePosition = () => {
      if (titleInputRef?.current) {
        const rect = titleInputRef.current.getBoundingClientRect();
        setPosition({
          left: rect.left,
          top: rect.top + rect.height,
          width: rect.width,
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
  }, [titleInputRef]);

  // Focus input when custom input is shown
  useEffect(() => {
    if (showCustomInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showCustomInput]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current && 
        !pickerRef.current.contains(event.target as Node) &&
        titleInputRef?.current &&
        !titleInputRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, titleInputRef]);

  const handlePresetCategorySelect = (category: string) => {
    onCategorySelect(category);
  };

  const handleCreateLabel = () => {
    setShowCustomInput(true);
  };

  const handleCustomCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customCategory.trim()) {
      onCategorySelect(customCategory.trim());
      setCustomCategory("");
      setShowCustomInput(false);
    }
  };

  return createPortal(
    <>
      {/* Backdrop - only closes CategoryPicker, not parent */}
      <div
        className="fixed inset-0 z-[45px]"
        onMouseDown={(e) => {
          // Don't close if clicking on the picker or title input
          if (
            pickerRef.current?.contains(e.target as Node) ||
            titleInputRef?.current?.contains(e.target as Node)
          ) {
            return;
          }
          onClose();
        }}
      />
      <div>
  
  {/* Category Picker / Dropdown Menu */}
  <div className='bg-card fixed z-10' style={{ top: `${position.top}px`, left: `${position.left}px`, width: `${position.width}px` }}> {/* This acts as the page background */}
      
      {/* The dropdown arrow now matches the menu's background color */}
      <div 
        className="dropdown-arrow absolute w-3 h-3 bg-secondary border border-border z-40" 
        style={{ 
          left: `50%`, 
          top: `-5px`,
          transform: 'translateX(-50%) rotate(45deg)',
        }}
      ></div>
      
      {/* Category Picker (Now with lighter gray background and padding) */}
      <div
        ref={pickerRef}
        className="relative bg-secondary border border-border rounded-xs shadow-2xl z-50 p-1.5" /* Added p-2 padding and lighter background */
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-1 bg-card rounded-xs">
          {presetCategories.map((category, index) => {
            const isSelected = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePresetCategorySelect(category);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className={`w-full flex items-center gap-3 p-2 ${index === 0 ? "rounded-t-xs" : ""} hover:bg-muted transition-colors cursor-pointer ${
                  isSelected ? "bg-muted" : "" /* Subtle color change for selected */
                }`}
              >
                <Tag className="w-5 h-5 text-muted-foreground " />
                <span className={`text-sm ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                  {category}
                </span>
              </button>
            );
          })}
          {showCustomInput ? (
            <div className='p-2'>
              <input
                ref={inputRef}
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Category name"
                className="w-full bg-card border border-border rounded-md px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:outline-none focus:ring-2 focus:ring-accent/20"
                onBlur={() => {
                  if (!customCategory.trim()) {
                    setShowCustomInput(false);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCustomCategorySubmit(e);
                  }
                }}
              />
              </div>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCreateLabel();
              }}
              onMouseDown={(e) => e.stopPropagation()}
              className="w-full flex items-center gap-3 p-2 rounded-b-xs hover:bg-muted transition-colors cursor-pointer text-muted-foreground text-sm"
            >
              <span>Create label</span>
            </button>
          )}
        </div>
      </div>
</div>
</div>
    </>,
    document.body,
  );
};

export { CategoryPicker };
export default MoreOptionsPicker;