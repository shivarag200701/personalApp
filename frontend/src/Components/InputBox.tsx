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
    <div className="flex flex-col my-6 justify-start w-full relative">
      <p className="mb-2 font-regular text-white">{label}</p>
      {children}
      <input
        {...register}
        placeholder={placeholder}
        type={Type}
        className="pl-10 p-2 border border-white/10 bg-white/5 backdrop-blur-sm text-white placeholder:text-[#9EA0BB] rounded-xl h-10 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
      />
    </div>
  );
};

export default InputBox;
