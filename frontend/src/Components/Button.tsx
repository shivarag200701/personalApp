import React from "react";

interface ButtonProps {
  isSubmitting: boolean;
}

const Button = ({ isSubmitting }: ButtonProps) => {
  return (
    <div className="flex items-center justify-center bg-linear-to-r from-purple-500 to-pink-400 rounded-md hover:opacity-90 transition-opacity ">
      <button type="submit" className="cursor-pointer" disabled={isSubmitting}>
        <div className="py-2 text-white">
          {isSubmitting ? "Creating Account" : "Create Account"}
        </div>
      </button>
    </div>
  );
};

export default Button;
