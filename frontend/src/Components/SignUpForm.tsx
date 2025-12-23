import { isAxiosError } from "axios";
import { useEffect, useState, useMemo } from "react";
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

  const particles = useMemo(
    () =>
      Array.from({ length: 50 }).map((_, index) => ({
        id: index,
        left: Math.random() * 100,
        bottom: Math.random() * 100, // Random starting position from 0-100vh
        delay: 0, // Start immediately
        duration: 10 + Math.random() * 8,
        size: 2 + Math.random() * 4,
        opacity: 0.2 + Math.random() * 0.8,
      })),
    []
  );

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

        setError(error.response?.data.msg);
      } else {
        setError(String(error));
      }
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#05050a] text-white flex items-center justify-center px-4">
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) scale(0.9); opacity: 0.2; }
          15% { opacity: 1; }
          100% { transform: translateY(calc(-100vh - 100px)) scale(1.2); opacity: 0; }
        }
      `}</style>

      {/* Grid backdrop */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent via-[#0a0a11]/60 to-[#05050a]" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 60% 40%, rgba(168,85,247,0.25), transparent 55%)",
        }}
      />
      {particles.map((particle) => (
        <span
          key={particle.id}
          className="pointer-events-none absolute rounded-full bg-blue-500 shadow-[0_0_15px_rgba(236,72,153,0.4)]"
          style={{
            left: `${particle.left}%`,
            bottom: `${particle.bottom}%`,
            width: particle.size * 1.5,
            height: particle.size * 1.5,
            opacity: particle.opacity,
            animation: `floatUp ${particle.duration}s linear ${particle.delay}s infinite`,
          }}
        />
      ))}

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <LogoCard />
        </div>
        <div className="relative rounded-[28px] border border-white/10 bg-[#101018]/80 backdrop-blur-2xl p-8 shadow-[0_35px_120px_rgba(8,7,24,0.8)]">
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
            <div className="text-3xl font-semibold text-white mb-2">Get Started</div>
            <div className="mt-2 text-[#A2A2A9] mb-6">
              Create your account to start organizing
            </div>
            {/* Google Sign-In Button */}
            <div className="mb-6">
              <GoogleSignInButton />
            </div>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-white/10"></div>
              <span className="px-4 text-[#9EA0BB] text-sm">OR</span>
              <div className="flex-1 border-t border-white/10"></div>
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
                <User className="absolute left-3 top-13.5 -translate-y-1/2 w-4.5 h-4.5 text-[#9EA0BB]" />
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
                <Mail className="absolute left-3 top-13.5 -translate-y-1/2 w-4.5 h-4.5 text-[#9EA0BB]" />
              </InputBox>
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
              )}
              <InputBox
                label="Password"
                placeholder="••••••••"
                Type="password"
                register={register("password", {
                  required: "password is required",
                })}
              >
                <Lock className="absolute left-3 top-13.5 -translate-y-1/2 w-4.5 h-4.5 text-[#9EA0BB]" />
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
            <div className="text-center text-[#A2A2A9] mt-8 font-light">
              Already have an account?{" "}
              <a href="/signin" className="text-purple-400 hover:text-purple-300 transition-colors underline">
                Sign in
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpForm;
