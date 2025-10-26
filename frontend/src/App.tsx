import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import SignIn from "./Pages/signIn";
import Signup from "./Pages/signup";
import { AuthProvider } from "./Context/AuthContext";
import RequireAuth from "./Components/RequireAuth";
import Dashboard from "./Pages/Dashboard";

function App() {
  return (
    <div>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
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
    </div>
  );
}

export default App;
