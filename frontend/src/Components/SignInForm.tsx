import { isAxiosError } from "axios";
import { useState, useEffect} from "react";
import InputBox from "./InputBox";
import { User, Lock, ArrowLeft } from "lucide-react";
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
    <div className="relative min-h-screen overflow-x-hidden bg-white text-white flex items-center justify-center px-4">
      <button onClick={() => {navigate('/')}} className="text-slate-600 hover:text-slate-900 absolute top-10 left-10 flex gap-2 px-4 py-3 rounded-xl border border-slate-200/50 hover:border-slate-300/50 shadow-sm backdrop-blur-2xl cursor-pointer bg-white/10 hover:bg-white hover:shadow-md">
        <div className="flex items-center justify-center">
        <ArrowLeft className="w-4 h-4"/>
        </div>
        <p className="font-medium">Back to home</p>
      </button>
      <div className="relative z-10 w-full max-w-xl">
        <div className="relative rounded-[28px] border border-border bg-white/90 backdrop-blur-2xl p-8 sm:p-10 shadow-xl">
          {/* Gradient overlay */}
          <div
            className="absolute inset-0 rounded-[28px] pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 65% 20%, rgba(255,255,255,0.08), transparent 55%)",
              mixBlendMode: "screen",
            }}
          />
          
          <div className="relative z-10">
            <div className="text-3xl font-semibold text-center text-slate-900 mb-10">Welcome Back</div>
            {/* Google Sign-In Button */}
            <div className="mb-6">
              <GoogleSignInButton />
            </div>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-border"></div>
              <span className="px-4 text-[#9EA0BB] text-sm font-medium">Or continue with email</span>
              <div className="flex-1 border-t border-border"></div>
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
                <User className="absolute left-3 top-6 -translate-y-1/2 w-4.5 h-4.5 text-[#9EA0BB] z-10" />
              </InputBox>
              {errors.username && (
                <p className="text-red-400 text-sm mt-1">{errors.username.message}</p>
              )}
              <InputBox
                label="Password"
                placeholder="Password"
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
                Loading="Signing in..."
                Initial="Sign in"
              />
            </form>
            <div className="text-center text-red-400 mt-2 min-h-[20px] mb-4">
              {error ? error : ""}
            </div>
            <div className="text-center text-muted-foreground mt-8 font-light">
              Don't have an account?{" "}
              <button onClick={() => {navigate('/signup')}} className="text-purple-400 hover:text-purple-300 transition-colors underline cursor-pointer">
                Sign up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInForm;
