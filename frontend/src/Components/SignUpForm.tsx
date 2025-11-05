import { isAxiosError } from "axios";
import { useEffect, useState } from "react";
import InputBox from "./InputBox";
import LogoCard from "./LogoCard";
import { User } from "lucide-react";
import { Mail } from "lucide-react";
import { Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import Button from "./Button";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { Auth } from "@/Context/AuthContext";

type Inputs = {
  username: string;
  email: string;
  password: string;
};

const SignUpForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>();

  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { isAuthenticated, refreshAuth } = Auth();

  useEffect(() => {
    if(isAuthenticated){
      navigate("/dashboard");
    }
  }, [isAuthenticated]);
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      const res = await api.post("/v1/user/signup", data);
      console.log(res.data.msg);
      await refreshAuth();
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
    <div className="flex h-screen items-center justify-center bg-[#131315] px-4 w-full">
      <div className="flex-col w-full max-w-md">
        <div className="mb-8">
          <LogoCard />
        </div>
        <div className="shadow-2xl p-8 min-w-[350px] sm:min-w-[500px] bg-[#1B1B1E] rounded-2xl border border-gray-800">
          <div className="text-3xl font-semibold text-white mb-2">Get Started</div>
          <div className="mt-2 text-[#A2A2A9] mb-6">
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
              <User className="absolute left-3 top-13.5 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
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
              <Mail className="absolute left-3 top-13.5 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
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
              <Lock className="absolute left-3 top-13.5 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
            </InputBox>
            {errors.password && (
              <p className="text-red-500">{errors.password.message}</p>
            )}
            <Button
              isSubmitting={isSubmitting}
              Initial="Create Account"
              Loading="Creating Account..."
            />
          </form>
          <div className="text-center text-red-400 mt-2 min-h-[20px]">
            {error ? error : ""}
          </div>
          <div className="text-center text-[#A2A2A9] mt-8 font-light">
            Already have an account?{" "}
            <a href="/signin" className="text-purple-400 hover:text-purple-300 transition-colors underline">
              Sign in
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpForm;
