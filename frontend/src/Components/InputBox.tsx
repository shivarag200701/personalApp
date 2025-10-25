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
      <p className="mb-2 font-regular">{label}</p>
      {children}
      <input
        {...register}
        placeholder={placeholder}
        type={Type}
        className="pl-10 p-2 border-2 border-gray-300 placeholder:text-gray-600 rounded-md h-10"
      />
    </div>
  );
};

export default InputBox;
