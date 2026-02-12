import { 
  Mic, 
  ListTree, 
  CalendarClock, 
  Tag, 
  CalendarDays,
} from "lucide-react";
import ComingSoon from "./ComingSoon";
import { useRef } from "react";
import PathAnimation from "@/Components/PathAnimation";

interface Integration {
  name: string;
  icon: React.ReactNode;
  description: string;
}

const ChatGPTIntegration = () => {
  const integrations: Integration[] = [
    { 
      name: "Smart Task Creation", 
      icon: <Mic className="w-2 h-2" />, 
      description: "Natural language input" 
    },
    { 
      name: "Task Breakdown", 
      icon: <ListTree className="w-6 h-6" />, 
      description: "Auto-generate subtasks" 
    },
    { 
      name: "Smart Scheduling", 
      icon: <CalendarClock className="w-6 h-6" />, 
      description: "Optimal time suggestions" 
    },
    { 
      name: "Daily Planning", 
      icon: <CalendarDays className="w-6 h-6" />, 
      description: "AI-generated daily plans" 
    },
    { 
      name: "Auto-Categorization", 
      icon: <Tag className="w-6 h-6" />, 
      description: "Intelligent organization" 
    },
  ];

  const containerRef = useRef<HTMLDivElement>(null)
  const div1Ref = useRef<HTMLDivElement>(null)
  const div2Ref = useRef<HTMLDivElement>(null)
  const div3Ref = useRef<HTMLDivElement>(null)
  const div4Ref = useRef<HTMLDivElement>(null)
  const div5Ref = useRef<HTMLDivElement>(null)
  const div6Ref = useRef<HTMLDivElement>(null)

  return (
    // <section className="relative w-full max-w-7xl mx-auto p-8 mt-30 lg:mt-50 2xl:mt-60 z-10">
    <>
      

      {/* Hub and Spoke Layout */}
      <div className="relative flex flex-col scale-[0.8] xl:scale-100 lg:flex-row items-center justify-center gap-8 lg:gap-16 w-full xl:mb-5 xl:mt-3" ref = {containerRef}>
        <div className="absolute inset-0 pointer-events-none z-0">
          <PathAnimation containerRef={containerRef} featureRefs={[div1Ref,div2Ref,div3Ref,div5Ref,div6Ref]} centerRef={div4Ref}  />
        </div>
        {/* Left Column - 3 Features */}
        <div className="flex flex-col gap-6 w-full items-center">
          {integrations.slice(0, 3).map((integration,idx) => (
            <div
              key={integration.name}
              className="bg-white border border-gray-200 rounded-xl p-2 lg:p-3 shadow-md hover:shadow-lg transition-shadow md:w-30 lg:w-40 relative"
              ref = {idx === 0 ? div1Ref : idx === 1 ? div2Ref : idx === 2 ? div3Ref : null}
            >
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex gap-2">
                    <h3 className="text-[10px] lg:text-xs font-semibold text-gray-900 mb-1">
                      {integration.name}
                    </h3>
                  </div>
                  <h2 className="text-[8px] lg:text-[10px] text-gray-900">
                    {integration.description}
                  </h2>
                </div>
              </div>
              {idx == 1 ? <ComingSoon/> : idx == 2 ? <ComingSoon/> : ''}
            </div>
          ))}
        </div>

        {/* Center - ChatGPT Icon */}
        <div className="shrink-0" ref={div4Ref}>
          <div className="w-20 relative h-20 z-20 lg:w-18 lg:h-18 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shadow-xl p-3" >
          <img src="/openAI.svg" className="w-15 h-15"/>
          </div>
        </div>

        {/* Right Column - 2 Features */}
        <div className="flex flex-col gap-20 w-full items-center">
          {integrations.slice(3, 5).map((integration,idx) => (
            <div
            key={integration.name}
            className="bg-white border border-gray-200 rounded-xl p-2 lg:p-3 shadow-md hover:shadow-lg transition-shadow w-40 relative"
            ref = {idx === 0 ? div5Ref : idx === 1 ? div6Ref : null}
          >
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex gap-2">
                  <h3 className="text-[10px] lg:text-xs font-semibold text-gray-900 mb-1">
                    {integration.name}
                  </h3>
                </div>
                <h2 className="text-[8px] lg:text-[10px] text-gray-900">
                  {integration.description}
                </h2>
              </div>
            </div>
            <ComingSoon/>
          </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col items-start justify-center gap-2 text-center">
        <h1 className="text-gray-800 text-sm xl:text-base font-medium text-start">
          Smarter tasks with AI
        </h1>
        <p className="text-[16px] text-accent max-w-xl text-start font-medium">
        ChatGPT helps break down your tasks and schedule them smartly, so you can focus on doing.
        </p>
      </div>
      </>
  );
};

export default ChatGPTIntegration;