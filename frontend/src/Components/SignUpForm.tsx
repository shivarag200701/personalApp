import { useState } from "react";
import InputBox from "./InputBox";
import LogoCard from "./LogoCard";
import { User } from "lucide-react";
import { Mail } from "lucide-react";
import { Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import Button from "./Button";

type Inputs = {
  username: string;
  email: string;
  password: string;
};

const SignUpForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = (data) => console.log(data);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex-col">
        <LogoCard />
        <div className="shadow-2xl p-8 min-w-[500px]">
          <div className="text-3xl font-semibold">Get Started</div>
          <div className="mt-2 text-gray-400">
            Create your account to start organizing
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <InputBox
              label="Name"
              placeholder="Your name"
              Type="text"
              register={register("username", {
                required: "username is required",
              })}
            >
              <User className="absolute left-3 top-13.5 -translate-y-1/2 w-4.5 h-4.5 text-gray-600" />
            </InputBox>
            {errors.username && (
              <p className="text-red-500">{errors.username.message}</p>
            )}
            <InputBox
              label="Email"
              placeholder="You@example.com"
              Type="email"
              register={register("email", { required: "email is required" })}
            >
              <Mail className="absolute left-3 top-13.5 -translate-y-1/2 w-4.5 h-4.5 text-gray-600" />
            </InputBox>
            {errors.email && (
              <p className="text-red-500">{errors.email.message}</p>
            )}
            <InputBox
              label="Password"
              placeholder="••••••••"
              Type="password"
              register={register("password", {
                required: "password is required",
              })}
            >
              <Lock className="absolute left-3 top-13.5 -translate-y-1/2 w-4.5 h-4.5 text-gray-600" />
            </InputBox>
            {errors.password && (
              <p className="text-red-500">{errors.password.message}</p>
            )}
            <Button />
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUpForm;
