import { useNavigate } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { CheckCircle2, Sparkles, Flame, TrendingUp } from "lucide-react";
import { Auth } from "../Context/AuthContext";

const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = Auth();
  const particles = useMemo(
    () =>
      Array.from({ length: 100 }).map((_, index) => ({
        id: index,
        left: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 10 + Math.random() * 8,
        size: 2 + Math.random() * 4,
        opacity: 0.3 + Math.random() * 0.5,
      })),
    []
  );

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05050a] text-white flex flex-col">
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) scale(0.9); opacity: 0; }
          15% { opacity: 1; }
          100% { transform: translateY(calc(-100vh - 200px)) scale(1.2); opacity: 0; }
        }
        @keyframes pulseOrbit {
          0% { opacity: 0.35; transform: scale(0.98); }
          50% { opacity: 0.7; transform: scale(1.02); }
          100% { opacity: 0.35; transform: scale(0.98); }
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
          className="pointer-events-none absolute bottom-0 rounded-full bg-white/40 shadow-[0_0_15px_rgba(236,72,153,0.4)]"
          style={{
            left: `${particle.left}%`,
            width: particle.size,
            height: particle.size,
            opacity: particle.opacity,
            animation: `floatUp ${particle.duration}s linear ${particle.delay}s infinite`,
          }}
        />
      ))}

      {/* Header */}
      <header className="w-full max-w-6xl mx-auto p-4 md:p-8 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-r from-purple-500 to-pink-400 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-purple-500">
              FlowTask
            </h1>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/signin")}
              className="px-4 py-2 text-white hover:text-purple-400 transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="px-6 py-2 bg-linear-to-r from-purple-500 to-pink-400 text-white rounded-md hover:opacity-90 transition-opacity font-semibold cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative flex-1 flex flex-col items-center justify-center px-4 py-16 md:py-24">
        <div className="relative max-w-6xl w-full mx-auto grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center z-10">
          <div>
            {/* Main Heading */}
            <h2 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Build Faster.
              <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 via-pink-400 to-indigo-400">
                Scale Together.
              </span>
            </h2>

            {/* Subheading */}
            <p className="text-xl text-[#C7C7D1] mb-10 max-w-xl">
              Join an elite workflow for personal productivity. FlowTask keeps
              your tasks aligned across focus areas, streaks, and progress
              insights so you never lose momentum.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button
                onClick={() => navigate("/signup")}
                className="px-8 py-4 bg-linear-to-r from-purple-500 to-pink-400 text-white rounded-xl hover:opacity-90 transition-opacity font-semibold text-lg shadow-[0_15px_45px_rgba(168,85,247,0.25)] cursor-pointer"
              >
                Start Coding Now
              </button>
              <button
                onClick={() => navigate("/signin")}
                className="px-8 py-4 border border-white/20 text-white rounded-xl hover:border-white/50 transition-colors font-semibold text-lg cursor-pointer"
              >
                Explore Community
              </button>
            </div>

            <div className="flex flex-wrap gap-6 text-sm text-[#9EA0BB]">
              <div className="flex flex-col">
                <span className="text-3xl font-semibold text-white">
                  120K+
                </span>
                Organizing tasks every day
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-semibold text-white">98%</span>
                report higher completion rate
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-purple-500/40 blur-[90px]" />
            <div className="absolute -left-10 bottom-6 w-24 h-24 bg-pink-400/40 blur-[80px]" />
            <div className="relative rounded-[28px] border border-white/5 bg-[#101018]/80 backdrop-blur-2xl p-8 shadow-[0_35px_120px_rgba(8,7,24,0.8)]">
              <p className="text-xs uppercase tracking-[0.3em] text-purple-300 mb-2">
                Organize your tasks
              </p>
              <h3 className="text-3xl font-semibold mb-6">
                One command center to plan, prioritize, and celebrate wins.
              </h3>
              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                  <p className="text-sm text-[#BCBCD3] mb-1">Today</p>
                  <p className="text-lg font-semibold">6 tasks</p>
                  <p className="text-xs text-[#8C8DA8]">Focus sprint</p>
                </div>
                <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                  <p className="text-sm text-[#BCBCD3] mb-1">Streak</p>
                  <p className="text-lg font-semibold">24 days</p>
                  <p className="text-xs text-[#8C8DA8]">Flawless run</p>
                </div>
                <div className="rounded-2xl border border-white/5 bg-white/5 p-4 col-span-2 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#BCBCD3] mb-1">Completion</p>
                    <p className="text-lg font-semibold">82%</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-pink-300" />
                </div>
              </div>
              <div
                className="absolute inset-0 rounded-[28px] pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle at 65% 20%, rgba(255,255,255,0.18), transparent 55%)",
                  mixBlendMode: "screen",
                }}
              />
            </div>
          </div>
        </div>

        {/* Spotlighted grid section */}
        <section className="relative w-full max-w-6xl mx-auto mt-20 z-10">
          <div className="absolute inset-0 rounded-[40px] border border-purple-500/20 bg-linear-to-r from-purple-500/5 to-pink-500/5 blur-3xl" />
          <div className="relative rounded-[32px] border border-white/10 bg-[#0E0E16]/80 backdrop-blur-3xl p-10 shadow-[0_45px_120px_rgba(5,5,15,0.85)]">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
              <div>
                <p className="text-sm uppercase tracking-[0.4em] text-purple-300">
                  Flow dashboard
                </p>
                <h3 className="text-3xl font-semibold mt-3">
                  Organize tasks across every horizon
                </h3>
              </div>
              <button
                onClick={() => navigate("/signup")}
                className="px-6 py-3 bg-white text-black rounded-xl font-semibold text-sm hover:bg-purple-100 transition-colors cursor-pointer"
              >
                Try it live
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#151522] p-6 rounded-2xl border border-white/5 shadow-[0_20px_60px_rgba(5,5,15,0.7)]">
                <div className="w-12 h-12 rounded-xl bg-linear-to-r from-purple-500 to-pink-400 flex items-center justify-center mb-4 mx-auto md:mx-0">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-white font-semibold text-xl mb-2">
                  Smart Organization
                </h4>
                <p className="text-[#A2A2A9] text-sm">
                  Group tasks by focus areas, timeline, or energy so your next
                  move is obvious.
                </p>
              </div>

              <div className="bg-[#151522] p-6 rounded-2xl border border-white/5 shadow-[0_20px_60px_rgba(5,5,15,0.7)] relative overflow-hidden">
                <div className="w-12 h-12 rounded-xl bg-linear-to-r from-purple-500 to-pink-400 flex items-center justify-center mb-4 mx-auto md:mx-0">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-white font-semibold text-xl mb-2">
                  Build Streaks
                </h4>
                <p className="text-[#A2A2A9] text-sm">
                  Visual streak tracking keeps you accountable with gentle
                  nudges and badges.
                </p>
                <div className="absolute -right-10 bottom-0 w-32 h-32 bg-pink-400/20 blur-[50px]" />
              </div>

              <div className="bg-[#151522] p-6 rounded-2xl border border-white/5 shadow-[0_20px_60px_rgba(5,5,15,0.7)]">
                <div className="w-12 h-12 rounded-xl bg-linear-to-r from-purple-500 to-pink-400 flex items-center justify-center mb-4 mx-auto md:mx-0">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-white font-semibold text-xl mb-2">
                  Track Progress
                </h4>
                <p className="text-[#A2A2A9] text-sm">
                  Know your completion rate, average pace, and bottlenecks at a
                  glance.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto p-4 md:p-8 text-center relative z-10">
        <p className="text-[#A2A2A9] text-sm">
          © 2025 FlowTask. Organize your life, one task at a time.
        </p>
      </footer>
    </div>
  );
};

export default Landing;

