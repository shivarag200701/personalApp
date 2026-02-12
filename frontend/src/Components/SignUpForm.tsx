import { isAxiosError } from "axios";
import { useEffect, useState} from "react";
import InputBox from "./InputBox";
import LogoCard from "./LogoCard";
import { User } from "lucide-react";
import { Mail } from "lucide-react";
import { Lock, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import Button from "./Button";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { Auth } from "@/Context/AuthContext";
import { GoogleSignInButton } from "./GoogleSignInButton";

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
      await api.post("/v1/user/signup", data);
      await refreshAuth();
      navigate("/dashboard");
    } catch (error) {
      // console.error("error signing in", error);
      if (isAxiosError(error)) {

        setError(error.response?.data.msg);
      } else {
        setError(String(error));
      }
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-white text-white flex items-center justify-center px-4">
      <button onClick={() => {navigate('/')}} className="text-slate-600 hover:text-slate-900 absolute top-10 left-10 flex gap-2 px-4 py-3 rounded-xl border border-slate-200/50 hover:border-slate-300/50 shadow-sm backdrop-blur-2xl cursor-pointer bg-white/10 hover:bg-white hover:shadow-md">
        <div className="flex items-center justify-center">
        <ArrowLeft className="w-4 h-4"/>
        </div>
        <p className="font-medium">Back to home</p>
      </button>
      <div className="relative z-10 w-full max-w-xl">
        <div className="mb-8 flex justify-center">
          <LogoCard />
        </div>
        <div className="relative rounded-[28px] border border-border bg-card/80 backdrop-blur-2xl p-8 sm:p-10 shadow-xl">
          <div className="relative z-10">
            <h2 className="text-3xl text-center tracking-tight leading-tight font-medium text-gray-800 mb-10">Get productivity</h2>
            {/* Google Sign-In Button */}
            <div className="mb-6">
              <GoogleSignInButton />
            </div>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-border"></div>
              <span className="px-4 text-[#9EA0BB] text-sm font-medium">Or Continue with email</span>
              <div className="flex-1 border-t border-border"></div>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <InputBox
                label="Name"
                placeholder="Full name"
                Type="text"
                register={register("username", {
                  required: "username is required",
                })}
              >
                <div className="text-[#9EA0BB]">
                  <User className="absolute left-3 top-6 -translate-y-1/2 w-4.5 h-4.5 text-[#9EA0BB] z-10" />
                </div>
              </InputBox>
              {errors.username && (
                <p className="text-red-400 text-sm mt-1">{errors.username.message}</p>
              )}
              <InputBox
                label="Email"
                placeholder="You@example.com"
                Type="email"
                register={register("email", { required: "email is required" })}
              >
                <Mail className="absolute left-3 top-6 -translate-y-1/2 w-4.5 h-4.5 text-[#9EA0BB] z-10" />
              </InputBox>
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
              )}
              <InputBox
                label="Password"
                placeholder="password"
                Type="password"
                register={register("password", {
                  required: "password is required",
                })}
              >
                <Lock className="absolute left-3 top-6 -translate-y-1/2 w-4.5 h-4.5 text-[#9EA0BB] z-10" />
              </InputBox>
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
              )}
              <Button
                isSubmitting={isSubmitting}
                Initial="Create Account"
                Loading="Creating Account..."
              />
            </form>
            <div className="text-center text-red-400 mt-2 min-h-[20px] mb-4">
              {error ? error : ""}
            </div>
            <div className="text-center text-muted-foreground mt-4 font-light">
              Already have an account?{" "}
              <button onClick={() => {navigate('/signin')}} className="text-purple-400 hover:text-purple-300 transition-colors underline cursor-pointer">
                Sign in
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpForm;
