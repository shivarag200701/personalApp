import React, { type ReactNode } from "react";

interface InputBoxProps {
  label: string;
  placeholder?: string;
  value: string;
  children: ReactNode;
  Type: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputBox = ({
  label,
  placeholder,
  value,
  onChange,
  children,
  Type,
}: InputBoxProps) => {
  return (
    <div className="flex flex-col  my-8 justify-start w-full relative ">
      <p className="mb-2 font-regular">{label}</p>
      {children}
      <input
        value={value}
        onChange={onChange}
        type={Type}
        placeholder={placeholder}
        className="pl-10 p-2 border-2 border-gray-300 placeholder:text-gray-600 rounded-md h-10"
      />
    </div>
  );
};

export default InputBox;
