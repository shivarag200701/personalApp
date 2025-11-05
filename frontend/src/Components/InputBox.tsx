import { type ReactNode } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

interface InputBoxProps {
  label: string;
  placeholder?: string;
  children: ReactNode;
  Type: string;
  register: UseFormRegisterReturn;
}

const InputBox = ({
  label,
  placeholder,
  children,
  Type,
  register,
}: InputBoxProps) => {
  return (
    <div className="flex flex-col  my-6 justify-start w-full relative ">
      <p className="mb-2 font-regular text-white">{label}</p>
      {children}
      <input
        {...register}
        placeholder={placeholder}
        type={Type}
        className="pl-10 p-2 border-2 border-gray-700 bg-[#0f0f11] text-white placeholder:text-gray-500 rounded-md h-10 focus:border-purple-500 focus:outline-none transition-colors"
        style={{ backgroundColor: '#0f0f11' }}
      />
    </div>
  );
};

export default InputBox;
