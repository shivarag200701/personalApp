import React, { useState, type ReactNode } from "react";
import { Button } from "./ui/button";
import { AlertCircle, Tag } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

const Modal = ({ isOpen, onClose }: ModalProps) => {
  const [title, setTitle] = useState("");
  const [timeSelection, setTimeSelection] = useState("today");
  const [priority, setPriority] = useState("high");

  const handleClick = () => {
    setTitle("");
    onclose();
  };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-transparent bg-opacity-30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="bg-[#131315] p-6 rounded-lg shadow-lg bg-opacity-30 relative w-11/12 md:w-1/3">
        <button
          onClick={handleClick}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl cursor-pointer"
        >
          &times;
        </button>
        <div className="flex-col">
          <div className="text-white text-center md:text-left text-2xl mb-8">
            Add New Task
          </div>
          <div className="text-white text-md font-extralight mb-3">
            Task Title
          </div>
          <div className="mb-6">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="bg-[#141415] rounded-sm p-2 pl-4 placeholder:text-[#A2A2A9] placeholder:font-extralight border-[0.1px] border-gray-600 w-full"
            />
          </div>
          <div className="text-white text-md font-extralight mb-3">
            Description (Optional)
          </div>
          <div className="mb-6">
            <textarea
              className="text-[#A2A2A9] border-[0.1px] rounded-sm border-gray-600 w-full font-extralight p-3"
              rows={3}
            >
              Add more details...
            </textarea>
          </div>

          <div className="text-white text-md font-extralight mb-3">When?</div>
          <div className="flex gap-2 mb-6">
            {(["today", "tomorrow", "someday"] as const).map((time) => (
              <Button
                key={time}
                variant={time == timeSelection ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeSelection(time)}
                className="flex-1 capitalize"
              >
                {time}
              </Button>
            ))}
          </div>
          <div className="text-white text-md font-extralight mb-3">
            Priority
          </div>
          <div className="flex gap-2 mb-6">
            {(["high", "medium", "low"] as const).map((p) => (
              <Button
                key={p}
                variant={p == priority ? "default" : "outline"}
                size="sm"
                onClick={() => setPriority(p)}
                className="flex-1 capitalize"
              >
                {p === "high" && <AlertCircle className="w-3 h-3 mr-1" />}
                {p}
              </Button>
            ))}
          </div>
          <div className="text-white text-md font-extralight mb-3">
            Category (Optional)
          </div>
          <div className="mb-6 relative">
            <Tag className="absolute text-gray-500 top-3 left-3 w-5 h-5" />
            <input
              type="text"
              placeholder="e.g., Work, Personal, Health"
              className="bg-[#141415] rounded-sm p-2 pl-10 placeholder:text-[#A2A2A9] placeholder:font-extralight border-[0.1px] border-gray-600 w-full"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleClick}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button disabled={!title}>Add Task</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
