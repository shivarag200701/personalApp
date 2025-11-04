import axios, { isAxiosError } from "axios";
import { useState } from "react";
import InputBox from "./InputBox";
import LogoCard from "./LogoCard";
import { User, Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import Button from "./Button";
import { useNavigate } from "react-router-dom";

type Inputs = {
  username: string;
  email: string;
  password: string;
};

const SignInForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>();

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      const res = await axios.post("api/v1/user/signin", data);
      console.log("signed in");
      navigate("/dashboard");
    } catch (error) {
      // console.error("error signing in", error);
      if (isAxiosError(error)) {
        console.log(error.response?.data.msg);

        setError(error.response?.data.msg);
      } else {
        setError(String(error));
      }
    }
  };
  return (
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="flex-col">
        <LogoCard />
        <div className="shadow-2xl p-8 min-w-[500px] bg-white rounded-xl ">
          <div className="text-3xl font-semibold">Welcome Back</div>
          <div className="mt-2 text-gray-400">
            Sign in to continue to FlowTask
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
            <Button
              isSubmitting={isSubmitting}
              Loading="Signing in..."
              Initial="Sign in"
            />
          </form>
          <div className="text-center text-red-500 mt-2">
            {error ? error : ""}
          </div>
          <div className="text-center text-gray-600 mt-8 font-light">
            Don't have an account?{" "}
            <a href="/signup" className="text-blue-600 hover:underline">
              Sign up
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInForm;
