
import { Sparkles } from "lucide-react";

const ComingSoon = () => {
  return (
    <div className="absolute -top-3 -right-3 flex items-center gap-1.5 px-2 py-1.5 bg-accent text-white rounded-full shadow-lg border-2 border-white text-[8px] font-semibold z-10">
      <Sparkles className="w-3 h-3" />
      <span>Coming Soon</span>
    </div>
  )
}

export default ComingSoon
