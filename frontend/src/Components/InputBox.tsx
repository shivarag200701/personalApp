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
  placeholder,
  children,
  Type,
  register,
}: InputBoxProps) => {
  return (
    <div className="flex flex-col my-6 justify-start w-full relative">
      {children}
      <input
        {...register}
        placeholder={placeholder}
        type={Type}
        autoComplete={Type === "password" ? "new-password" : "off"}
        className="pl-10 pr-4 py-3  h-12 bg-slate-100 backdrop-blur-sm text-slate-900 placeholder:text-[#9EA0BB] border hover:border-2 hover:shadow-md hover:border-gray-300 rounded-xl focus:border-accent focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
      />
    </div>
  );
};

export default InputBox;
