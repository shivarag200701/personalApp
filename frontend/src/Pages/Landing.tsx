import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { CheckCircle2, Sparkles, Flame, TrendingUp } from "lucide-react";
import { Auth } from "../Context/AuthContext";

const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = Auth();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="min-h-screen bg-[#131315] flex flex-col">
      {/* Header */}
      <header className="w-full max-w-6xl mx-auto p-4 md:p-8">
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
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Heading */}
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Organize Your Life,
            <br />
            <span className="bg-linear-to-r from-purple-500 to-pink-400 bg-clip-text text-transparent">
              One Task at a Time
            </span>
          </h2>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-[#A2A2A9] mb-12 max-w-2xl mx-auto">
            FlowTask helps you stay focused and productive. Manage your tasks,
            track your progress, and build lasting habits.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              onClick={() => navigate("/signup")}
              className="px-8 py-4 bg-linear-to-r from-purple-500 to-pink-400 text-white rounded-lg hover:opacity-90 transition-opacity font-semibold text-lg shadow-lg cursor-pointer"
            >
              Start Free
            </button>
            <button
              onClick={() => navigate("/signin")}
              className="px-8 py-4 border-2 border-gray-600 text-white rounded-lg hover:border-purple-500 transition-colors font-semibold text-lg cursor-pointer"
            >
              Sign In
            </button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="bg-[#1B1B1E] p-6 rounded-2xl border border-gray-800">
              <div className="w-12 h-12 rounded-xl bg-linear-to-r from-purple-500 to-pink-400 flex items-center justify-center mb-4 mx-auto">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">
                Smart Organization
              </h3>
              <p className="text-[#A2A2A9] text-sm">
                Organize tasks by priority, category, and timeline. Today,
                Tomorrow, or Someday.
              </p>
            </div>

            <div className="bg-[#1B1B1E] p-6 rounded-2xl border border-gray-800">
              <div className="w-12 h-12 rounded-xl bg-linear-to-r from-purple-500 to-pink-400 flex items-center justify-center mb-4 mx-auto">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">
                Build Streaks
              </h3>
              <p className="text-[#A2A2A9] text-sm">
                Track your daily progress and build consistency with visual
                streak tracking.
              </p>
            </div>

            <div className="bg-[#1B1B1E] p-6 rounded-2xl border border-gray-800">
              <div className="w-12 h-12 rounded-xl bg-linear-to-r from-purple-500 to-pink-400 flex items-center justify-center mb-4 mx-auto">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">
                Track Progress
              </h3>
              <p className="text-[#A2A2A9] text-sm">
                See your completion rate and productivity metrics at a glance.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto p-4 md:p-8 text-center">
        <p className="text-[#A2A2A9] text-sm">
          © 2025 FlowTask. Organize your life, one task at a time.
        </p>
      </footer>
    </div>
  );
};

export default Landing;

