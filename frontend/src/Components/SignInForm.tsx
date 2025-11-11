import { isAxiosError } from "axios";
import { useState, useEffect } from "react";
import InputBox from "./InputBox";
import LogoCard from "./LogoCard";
import { User, Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import Button from "./Button";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../utils/api";
import { Auth } from "@/Context/AuthContext";
import { GoogleSignInButton } from "./GoogleSignInButton";

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
  const [searchParams] = useSearchParams();
  const { refreshAuth } = Auth();

  // Handle OAuth errors from URL params
  useEffect(() => {
    const oauthError = searchParams.get('error');
    if (oauthError) {
      const errorMessages: Record<string, string> = {
        'access_denied': 'You cancelled the sign-in process.',
        'missing_code': 'Sign-in failed. Please try again.',
        'invalid_state': 'Security verification failed. Please try again.',
        'expired_state': 'Sign-in session expired. Please try again.',
        'oauth_failed': 'Sign-in failed. Please try again.',
      };
      setError(errorMessages[oauthError] || 'Sign-in failed. Please try again.');
      // Clear the error from URL
      navigate('/signin', { replace: true });
    }
  }, [searchParams, navigate]);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      await api.post("/v1/user/signin", data);
      console.log("signed in");
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
    <div className="flex h-screen items-center justify-center bg-[#131315] px-4">
      <div className="flex-col w-full max-w-md">
        <div className="mb-8">
          <LogoCard />
        </div>
        <div className="shadow-2xl p-8 min-w-[350px] sm:min-w-[500px] bg-[#1B1B1E] rounded-2xl border border-gray-800">
          <div className="text-3xl font-semibold text-white mb-2">Welcome Back</div>
          <div className="mt-2 text-[#A2A2A9] mb-6">
            Sign in to continue to FlowTask
          </div>
          
          {/* Google Sign-In Button */}
          <div className="mb-6">
            <GoogleSignInButton />
          </div>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-700"></div>
            <span className="px-4 text-gray-500 text-sm">OR</span>
            <div className="flex-1 border-t border-gray-700"></div>
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
              Loading="Signing in..."
              Initial="Sign in"
            />
          </form>
          <div className="text-center text-red-400 mt-2 min-h-[20px] mb-4">
            {error ? error : ""}
          </div>
          <div className="text-center text-[#A2A2A9] mt-8 font-light">
            Don't have an account?{" "}
            <a href="/signup" className="text-purple-400 hover:text-purple-300 transition-colors underline">
              Sign up
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInForm;
