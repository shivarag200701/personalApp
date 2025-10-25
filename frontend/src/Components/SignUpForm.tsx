import { useState } from "react";
import InputBox from "./InputBox";
import LogoCard from "./LogoCard";
import { User } from "lucide-react";
import { Mail } from "lucide-react";
import { Lock } from "lucide-react";

const SignUpForm = () => {
  const [name, setName] = useState("");
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex-col">
        <LogoCard />
        <div className="shadow-2xl p-8 min-w-[500px]">
          <div className="text-3xl font-semibold">Get Started</div>
          <div className="mt-2 text-gray-400">
            Create your account to start organizing
          </div>
          <InputBox
            label="Name"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            Type="text"
          >
            <User className="absolute left-3 top-13.5 -translate-y-1/2 w-4.5 h-4.5 text-gray-600" />
          </InputBox>
          <InputBox
            label="Email"
            placeholder="You@example.com"
            value={name}
            Type="email"
            onChange={(e) => setName(e.target.value)}
          >
            <Mail className="absolute left-3 top-13.5 -translate-y-1/2 w-4.5 h-4.5 text-gray-600" />
          </InputBox>
          <InputBox
            label="Password"
            placeholder="••••••••"
            value={name}
            Type="password"
            onChange={(e) => setName(e.target.value)}
          >
            <Lock className="absolute left-3 top-13.5 -translate-y-1/2 w-4.5 h-4.5 text-gray-600" />
          </InputBox>
        </div>
      </div>
    </div>
  );
};

export default SignUpForm;
