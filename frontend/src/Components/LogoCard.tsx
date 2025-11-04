  import { CheckCircle2 } from "lucide-react";

const LogoCard = () => {
  return (
    <div className="flex items-center justify-center gap-3 mb-3 cursor-pointer hover-elevate rounded-2xl p-2 transition-all">
      <div className="w-12 h-12 rounded-2xl bg-linear-to-r from-purple-500 to-pink-400 flex items-center justify-center text-white">
        <CheckCircle2 className="w-7 h-7 text-primary-foreground" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-purple-500">FlowTask</h1>
    </div>
  );
};

export default LogoCard;
