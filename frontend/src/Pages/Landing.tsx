import { useNavigate } from "react-router-dom";
import { useEffect,useRef,useState } from "react";
import { CheckCircle2, Brain,Calendar1, RefreshCcw} from "lucide-react";
import { Auth } from "../Context/AuthContext";
import { Calendar } from "@/Components/ui/calendar";
import { useScrollbarWidth } from '../hooks/useScrollbarWidth';
import { AuroraText } from "@/Components/ui/aurora-text"
import {motion} from "motion/react"
import { Highlighter } from "@/Components/ui/highlighter";
import ChatGPTIntegration from "@/Components/LandingPage/ChatGPTIntegration";
import { AnimatedList } from "@/Components/ui/animated-list";
import Notification from "@/Components/LandingPage/Notification";
import type { NotificationProps } from "@/Components/LandingPage/Notification";



const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, refreshAuth } = Auth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisibleOne,setIsVisibleOne] = useState(false)
  const [isVisibleTwo,setIsVisibleTwo] = useState(false)
  const [isVisibleThree,setIsVisibleThree] = useState(false)
  const [isVisibleFour,setIsVisibleFour] = useState(false)
  const [isVisibleFive,setIsVisibleFive] = useState(false)
  const [isVisibleSix,setIsVisibleSix] = useState(false)
  const [isSmallScreen,setIsSmallScreen] = useState(false)
  const [selectedDates,setSelectedDates] = useState<Date[]>([])
  const { width } = useScrollbarWidth()
  const containerRef = useRef<HTMLDivElement|null>(null)


  useEffect(() => {
    const delays = [100, 200, 300,400,500,600];
    const setters = [setIsVisibleOne, setIsVisibleTwo, setIsVisibleThree,setIsVisibleFour,setIsVisibleFive,setIsVisibleSix];
    const timeouts: number[] = [];
    
    setters.forEach((setter, index) => {
      const timeout = setTimeout(() => {
        setter(true);
      }, delays[index]);
      timeouts.push(timeout);
    });
    
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  useEffect(()=>{
    const checkmobile =()=>{
      setIsSmallScreen(window.innerWidth<1024)
    }
    checkmobile()

    window.addEventListener("resize",checkmobile)

    return () => {
      window.removeEventListener("resize",checkmobile)
    }
    
  },[])


  // Refresh auth status when landing page loads
  useEffect(() => {
    refreshAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 640; // 640px is Tailwind's sm breakpoint
    }
    return false;
  });
    
  useEffect(() => {
    const updateHeight = () => {
      if (typeof window === "undefined" || typeof document === "undefined")
        return;
      document.documentElement.style.setProperty(
        "--landing-height",
        `${window.innerHeight + 240}px`
      );
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // 640px is Tailwind's sm breakpoint
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Scroll detection for mobile navbar
  useEffect(() => {
    const checkScrollPosition = () => {
      if (typeof window === "undefined" || typeof document === "undefined") {
        return;
      }
      
      // Try multiple methods to get scroll position
      const scrollY = window.scrollY 
        || window.pageYOffset 
        || document.documentElement.scrollTop 
        || document.body.scrollTop 
        || 0;

      const shouldBeScrolled = scrollY > 30;
      setIsScrolled(shouldBeScrolled);
    };

    // Set initial state
    checkScrollPosition();
    
    // Add scroll listener - use 'scroll' event for both touch and mouse scrolling
    window.addEventListener("scroll", checkScrollPosition, { passive: true });
    document.addEventListener("scroll", checkScrollPosition, { passive: true });
    
    // Also listen to touchmove for mobile touch scrolling
    window.addEventListener("touchmove", checkScrollPosition, { passive: true });
    
    // Continuous polling to catch momentum scrolling on mobile
    // This ensures we detect scroll even when events stop firing
    // Polling at ~30fps is lightweight and catches momentum scrolling
    const pollInterval = setInterval(() => {
      checkScrollPosition();
    }, 33); // ~30fps - good balance between responsiveness and performance
    
    return () => {
      window.removeEventListener("scroll", checkScrollPosition);
      document.removeEventListener("scroll", checkScrollPosition);
      window.removeEventListener("touchmove", checkScrollPosition);
      clearInterval(pollInterval);
    };
  }, []);

  let notifications:NotificationProps[] = [
    {
      name: "Conduct Interview for Backend role",
      description: "Today 10:00",
      time: "5m ago",
      color: "#FF3D71",
      icon: "💼",

    },
    {
      name: "Do Yoga",
      description: "Today 6:00",
      time: "15m ago",
      color: "#00C9A7",
      icon: "🧘🏼‍♀️",
    },
    {
      name: "Gym",
      description: "Today 7:00",
      time: "10m ago",
      color: "#FFB800",
      icon: "🏋🏼‍♀️",

    },
    {
      name: "Buy milk",
      description: "",
      time: "2m ago",
      color: "#1E86FF",
      icon: "🗞️",

    },
  ]

  const demoHeaderOffset = 200
  const featureHeaderOffset = 150


  const scrollToDemo = (e:React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
  const container = containerRef.current;
  const target = document.getElementById("demo");
  if (!container || !target) return;

  const containerTop = container.getBoundingClientRect().top;
  const targetTop = target.getBoundingClientRect().top;
  const offset = targetTop - containerTop  - demoHeaderOffset;

  document.body.scrollTo({ top: offset, behavior: "smooth" });
  }


  const scrollToFeatures = (e:React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
  const container = containerRef.current;
  const target = document.getElementById("features");
  if (!container || !target) return;

  const containerTop = container.getBoundingClientRect().top;
  const targetTop = target.getBoundingClientRect().top;
  const offset = targetTop - containerTop  - featureHeaderOffset;

  document.body.scrollTo({ top: offset, behavior: "smooth" });
  }

  notifications = Array.from({length:10},() => notifications).flat()

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);  
  return (
    <div  className="relative  h-full overflow-y-auto bg-white text-white flex flex-col" ref={containerRef}>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&display=swap');`}
      </style>
      {/* Header */}
      <header className={`transition-all duration-300  fixed bg-white z-50 top-0  border-b border-gray-200 shadow-sm  ${isMobile ? (isScrolled ? 'bg-white backdrop-blur-md border-b border-white/5 fixed top-0 left-0 right-0 w-full z-50 ' : 'bg-transparent fixed top-0 left-0 right-0 w-full z-50 '):""
      }`} style={{width:`calc(100vw - ${width}px)`}} >
        <div className="w-full max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center sm:justify-between justify-center">
            <div className="flex items-center gap-3 transition-all duration-300 ease-in-out cursor-pointer" onClick={() => {
              document.body.scrollTo({ top: 0,behavior:'smooth'});
            }}
            style={isMobile ? {
              display: isScrolled ? 'none' : 'flex',
            } : {}}
            >
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-accent">
                FlowTask
              </h1>
            </div>
            {!isMobile && ( 
              <div className="group relative flex  text-black p-1 rounded-lg w-50">
                <a onClick={scrollToDemo} className="peer/one flex-1 text-center py-2 z-10 cursor-pointer select-none">Live Demo</a>
                <a onClick={scrollToFeatures}  className="peer/two flex-1 text-center py-2 z-10 cursor-pointer select-none">Features</a>
                <div className="absolute inset-y-1 left-1 w-[calc(50%-4px)] bg-gray-100 rounded-xl transition-all duration-300 ease-in-out peer-hover/two:translate-x-full peer-hover/one:translate-x-0 opacity-0  group-hover:opacity-100">
                </div>
              </div>
            )}
            <div 
              className="flex items-center gap-3 transition-all duration-300 ease-in-out sm:opacity-100 sm:translate-x-0 sm:pointer-events-auto"
              style={isMobile ? {
                display: isScrolled ? 'flex' : 'none',
                transform: isScrolled ? 'translateX(0)' : 'translateX(-16px)',
                pointerEvents: isScrolled ? 'auto' : 'none',
              } : {}}
            >
              <button
                onClick={() => navigate("/signin")}
                className="px-4 py-2 text-black hover:bg-gray-200 transition-colors border border-black/20 rounded-md bg-white backdrop-blur cursor-pointer text-center text-sm font-medium"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="px-6 py-2 bg-accent text-white rounded-md hover:opacity-90 transition-opacity font-semibold text-sm cursor-pointer"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>
      <div className="h-px bg-gray-300 shadow-[0px_3px_3px_rgba(0,0,0,0.1)]"/>

      {/* Hero Section */}
      <main className="relative bg-[#f9fafc] flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-20 lg:py-30 2xl:py-64">
        <div className="relative max-w-7xl w-full mx-auto grid gap-12 lg:grid-cols-[0.8fr_1.1fr] items-center z-10">
          <div className="flex flex-col lg:inline-block items-center">
            {/* Main Heading */}
            <h2 className={`text-5xl sm:text-6xl lg:text-5xl xl:text-6xl 2xl:text-7xl transition-all duration-300 font-bold leading-tight mb-6 text-gray-900 text-center lg:text-left
              ${isVisibleOne?"translate-y-0 opacity-100" : " translate-y-3 opacity-0 "} transition-all duration-300
              `}>
              Build Faster.
              <br />
              <AuroraText className={`${isVisibleTwo?"translate-y-0 opacity-100" : " translate-y-3 opacity-0 "} transition-all duration-500`}>
                Scale Together
              </AuroraText>
            </h2>
            {/* Subheading */}
            <p className={`text-xl flex text-gray-500 mb-10 max-w-xl text-center lg:text-left ${isVisibleThree ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'} transition-all duration-700`}>
              Join an elite workflow for personal productivity. FlowTask keeps
              your tasks aligned across focus areas, streaks, and progress
              insights so you never lose momentum.
            </p>

            {/* CTA Buttons */}
            <div className={`flex flex-col sm:flex-row gap-4 mb-10 ${isVisibleFour ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'} transition-all duration-1000`}>
              <button
                onClick={() => navigate("/signup")}
                className="px-4 py-2 2xl:px-8 2xl:py-4 bg-linear-to-r from-accent to-accent/60 hover:bg-accent text-white rounded-xl hover:opacity-90 transition-all duration-200 font-semibold text-md 2xl:text-lg shadow-[0_5px_10px_rgba(0,0,0,0.2)] cursor-pointer"
              >
                Start Coding Now
              </button>
            </div>
            <div className={`flex gap-5 text-xs lg-text-xs xl:text-sm text-gray-500 ${isVisibleFive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'} transition-all duration-1500`}>
              <div className="flex gap-1">
                <div className="flex items-center justify-center">
                <Brain className="w-4 h-4"/>
                </div>
                <p>Smart Scheduling</p>
              </div>
              <div className="flex gap-1">
                <div className="flex items-center justify-center">
                <Calendar1 className="w-4 h-4"/>
                </div>
                <p>Calendar View</p>
              </div>
              <div className="flex gap-1">
                <div className="flex items-center justify-center">
                <RefreshCcw className="w-4 h-4"/>
                </div>
                <p>Auto Sync</p>
              </div>
            </div>
          </div>

          <div  className={`relative ${isVisibleSix ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'} transition-all duration-1300 max-w-6xl px-4 sm:px-6`}>
           <img src="hero.svg" alt="hero.svg" className="shadow-2xl bg-[#f9fafc] rounded-xl w-full " />
          </div>
        </div>

        {/* Arcade Demo Section */}
        <div id="demo" className="flex flex-col items-center relative w-full max-w-7xl mx-auto mt-50 lg:mt-50 2xl:mt-90 z-10">
          
          <section className="w-full relative">
            <div className="absolute -top-1/6 flex">
              <div className="-rotate-5" style={{fontFamily: '"Caveat",cursive'}}>
                <p className="text-xl sm:text-2xl lg:text-3xl text-center text-slate-600 leading-tight">Take a peek!</p>
                <Highlighter action="underline" color="#87CEFA" strokeWidth={1} isView={true} padding={0} iterations={2}>
                <p className="text-xl sm:text-2xl lg:text-3xl text-slate-600 leading-tight">See Flowtask in action!</p>
                </Highlighter>
              </div>
              <div className="mt-1 w-16 sm:w-25 lg:w-[120px] h-auto">
              <svg
                viewBox="0 0 120 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="overflow-visible w-full h-auto"
                preserveAspectRatio="xMidYMid meet"
              >
                  <motion.path
                    d="M10 5 C 40 5, 100 5, 100 40 C 100 70, 60 70, 70 45 C 75 30, 110 50, 110 90"
                    stroke="#94a3b8"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: 1 }}
                    transition={{ 
                      duration: 1, 
                      ease: "easeInOut",
                      delay: 0.3 
                    }}
                  />

                  <motion.path
                    d="M102 82 L110 92 L118 82"
                    stroke="#94a3b8"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  />
                </svg>
              </div>
              </div>
              <div className="w-full max-w-6xl mx-auto px-4 sm:px-6">
                <ArcadeEmbed/>
              </div>
          </section>
        </div>

        {/* Spotlighted grid section */}
        <section id="features" className="relative w-full max-w-[900px] lg:max-w-[1000px] xl:max-w-[1200px] mx-auto p-8 mt-30 lg:mt-50 2xl:mt-60 z-10">
          <div className="mb-20 text-center">
              <h1 className="text-gray-900 text-3xl sm:text-4xl lg:text-4xl xl:text-5xl  font-bold mb-3 lg:mb-6">
                Your productivity, simplified
              </h1>
              <p className="text-lg lg:text-lg xl:text-xl text-slate-500 font-medium">
                Focus on what matters while we handle the rest
              </p>
          </div>
          <div className="hidden lg:grid grid-cols-7 grid-rows-4 h-[650px] xl:h-[800px]  text-black gap-4 xl:gap-6 items-stretch">
            <div className="lg:col-span-4 row-span-2 w-full py-12  bg-blue-50/50 shadow-md border border-gray-200 rounded-2xl flex flex-col lg:flex-row lg:gap-10 p-4">
              <div className="flex flex-col lg:justify-center">
                <h3 className="text-sm xl:text-base mb-1 text-gray-800 text-left font-medium ">Visual Planning</h3>
                <p className="text-base xl:text-xl text-accent font-medium mb-8">See your entire schedule at a glance</p>
              </div>
              <div className="flex justify-center items-center w-full lg:w-auto ">
                <div className="w-full max-w-xs lg:min-w-xs flex justify-center">
                <Calendar className="w-full"
                mode="multiple"
                selected={selectedDates}
                onSelect={(dates) => {
                  setSelectedDates(dates || [])
                }}
                />
                </div>
              </div>
            </div>
            <div className="lg:col-span-3 lg:row-span-2 w-full py-12 lg:p-10 bg-red-50/50 shadow-md border border-gray-200 rounded-2xl flex flex-col p-4 relative overflow-hidden">
              <div className="flex flex-col">
                <h3 className="text-[14px] mb-1 text-gray-800 text-left font-medium">Never miss a beat</h3>
                <p className="text-[16px] text-accent font-medium mb-4">Stay updated with real-time notifications</p>
              </div>
              <div className="flex-1 flex items-center justify-center overflow-hidden w-full">
                <AnimatedList
                  delay={1000}
                  className="w-full h-full overflow-y-auto no-scrollbar flex items-center"
                >
                  {notifications.map((notification, idx) => (
                    <Notification key={idx} {...notification} />
                  ))}
                </AnimatedList>
              </div>

            {/* Bottom gradient fade */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-red-50/90 to-transparent" />
          </div>
            <div className="lg:col-span-3 row-span-2 rounded-2xl border border-gray-300 relative shadow-md">
            <video loop 
                         autoPlay 
                        muted 
                        playsInline 
                        crossOrigin="anonymous" 
                        src="demo.mp4" 
                        className="w-full h-full object-cover rounded-2xl overflow-hidden">
                  </video>
            </div>
            <div className="lg:col-span-4 lg:row-span-2 bg-red-50/50 p-4 rounded-2xl shadow-md border border-gray-300 relative">
                  <ChatGPTIntegration/>
            </div>
          </div>

          <div className="block text-slate-800 lg:hidden space-y-4">
            <div className="w-full py-12 md:p-4 bg-blue-50/50 shadow-md border border-gray-200 rounded-2xl flex flex-col p-4">
              <div className="flex flex-col lg:justify-center">
                <h3 className="text-sm mb-1 text-gray-800 text-left font-medium ">Visual Planning</h3>
                <p className="text-lg text-accent font-semibold mb-8">See your entire schedule at a glance</p>
              </div>
              <div className="flex justify-center items-center w-full lg:w-auto ">
                <div className="w-full max-w-xs lg:min-w-xs flex justify-center">
                <Calendar className="w-full"
                mode="multiple"
                selected={selectedDates}
                onSelect={(dates) => {
                  setSelectedDates(dates || [])
                }}
                />
                </div>
              </div>
            </div>

            <div className="h-[400px] w-full py-12 md:py-4 lg:p-10 bg-red-50/50 shadow-md border border-gray-200 rounded-2xl flex flex-col items-center justify-center p-4 relative overflow-hidden">
              <div className="flex flex-col text-left mb-2 w-full">
                <h3 className="text-sm mb-1 text-gray-800 text-left font-medium">Never miss a beat</h3>
                <p className="text-lg text-accent font-semibold mb-4">Stay updated with real-time notifications</p>
              </div>
              {isSmallScreen && (
              <div className="flex-1 flex items-center justify-center overflow-hidden">
                <AnimatedList
                  delay={1500}
                  className="w-full h-full overflow-y-auto no-scrollbar"
                >
                  {notifications.map((notification, idx) => (
                    <Notification key={idx} {...notification} />
                  ))}
                </AnimatedList>
              </div>
              )}

            {/* Bottom gradient fade */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-red-50/90 to-transparent" />
          </div>
            
          </div>
        </section>
      </main>

      {/* Footer */}
      <div className="min-h-[60vh] bg-linear-to-br from-indigo-950 via-slate-900 to-blue-950 text-white flex items-center">
  <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 md:flex-row md:items-center md:justify-between">
    {/* Left: headline */}
    <div className="space-y-4">
      <p className="text-5xl md:text-6xl font-semibold tracking-tight">
        <span className="block">Plan.</span>
        <span className="block">Focus.</span>
        <span className="block text-accent">Complete.</span>
      </p>
      <p className="max-w-md text-slate-200">
        Your personal command center for tasks, projects, and habits.
      </p>
    </div>

    {/* Right: card */}
    <div className="relative">
      <div className="absolute inset-0 -z-10 opacity-40">
        {/* mount your PathAnimation here */}
      </div>
      <div className="bg-white text-slate-900 rounded-2xl shadow-xl p-8 max-w-sm">
        <h2 className="text-xl font-semibold mb-2">
          Turn chaos into a clear daily plan.
        </h2>
        <p className="text-sm text-slate-600 mb-6">
          Let AI sort, schedule, and prioritize so you can just execute.
        </p>
        <button onClick={() => {navigate('/signup')}} className="w-full rounded-full bg-linear-to-r from-accent to-accent/60 hover:bg-emerald-600 text-white py-3 text-sm font-medium">
          Get started in 30 seconds
        </button>
        <p className="mt-3 text-xs text-slate-500 text-center">
          Free for everyone
        </p>
      </div>
    </div>
  </div>
</div>
    </div>
  );
};

export function ArcadeEmbed() {
  return (
    <div className="w-full shadow-2xl rounded-xl" style={{ position: 'relative', paddingBottom: 'calc(55.73099415204679% + 41px)', height: '0', width: '100%', minHeight: '500px' }}>
      <iframe
        src="https://demo.arcade.software/ilYXUSzOd93pCY04qLz6?embed&embed_mobile=tab&embed_desktop=inline&show_copy_link=true"
        title="Schedule tasks with dates, times, and repeats in Upcoming and Calendar views"
        frameBorder="0"
        loading="lazy"
        allowFullScreen
        allow="clipboard-write"
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', colorScheme: 'light' }}
      />
    </div>
  )
}


export default Landing;

