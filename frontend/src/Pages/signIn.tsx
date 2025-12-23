import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import SignInForm from "../Components/SignInForm";
import { Auth } from "@/Context/AuthContext";

const SignIn = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshAuth } = Auth();

  useEffect(() => {
    const error = searchParams.get('error');
    const success = searchParams.get('success');

    if (error) {
      console.error('OAuth error:', error);
      // Error will be handled by showing a message or redirecting
    }

    if (success === 'google_sign_in') {
      // User successfully signed in with Google
      refreshAuth().then(() => {
        navigate('/dashboard');
      });
    }
  }, [searchParams, navigate, refreshAuth]);
  // useEffect(() => {
  //   refreshAuth();
  // }, []); 

  return <SignInForm />;
};

export default SignIn;
