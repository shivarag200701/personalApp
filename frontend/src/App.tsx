import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import SignIn from "./Pages/signIn";
import Signup from "./Pages/signup";
import { AuthProvider } from "./Context/AuthContext";
import RequireAuth from "./Components/RequireAuth";
import Dashboard from "./Pages/Dashboard";
import Landing from "./Pages/Landing";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useEffect } from "react";

function App() {
  const queryClient = new QueryClient();

  // Add scroll detection for custom scrollbars
  useEffect(() => {
    let scrollTimeout: number;

    const handleScroll = (event: Event) => {
      
      const element = event.currentTarget as Element;
      
      // Add is-scrolling class immediately
      element.classList.add('is-scrolling');
      
      // Clear existing timeout
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      
      // Remove class after scrolling stops
      scrollTimeout = window.setTimeout(() => {
        element.classList.remove('is-scrolling');
      }, 500);
    };

    

    // Add listener to all custom-scrollbar elements
    const scrollElements = document.querySelectorAll('.custom-scrollbar');
    scrollElements.forEach((el) => {
      el.addEventListener('scroll', handleScroll, { passive: true });
    });

    // Cleanup
    return () => {
      scrollElements.forEach((el) => {
        el.removeEventListener('scroll', handleScroll);
      });
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, []);

  return (
    <div>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="data-theme" defaultTheme="dark" themes={['dark', 'light']}>
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<Signup />} />
                <Route
                  path="/dashboard"
                  element={
                    <RequireAuth>
                      <Dashboard />
                    </RequireAuth>
                  }
                />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
          <Toaster />
        </ThemeProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;
