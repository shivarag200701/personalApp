import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import SignIn from "./Pages/signIn";
import Signup from "./Pages/signup";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
