import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import SignIn from "./Pages/signIn";
import Signup from "./Pages/signup";
import { AuthProvider } from "./Context/AuthContext";
import RequireAuth from "./Components/RequireAuth";
import Dashboard from "./Pages/Dashboard";
import Landing from "./Pages/Landing";
import { Toaster } from "sonner";

function App() {
  return (
    <div>
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
      <Toaster
       />
    </div>
  );
}

export default App;
