import React, { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabaseClient";

const LoginForm = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Google OAuth - redirect to onboarding first, then ProtectedRoute handles the rest
  const handleGoogleAuth = async () => {
    setError("");
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/onboarding`,
        },
      });
      
      if (error) throw error;
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="w-full md:w-1/2 p-10 flex flex-col justify-center items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="bg-[#F3E5D8] rounded-xl shadow-lg w-full max-w-sm border border-[#C6B29A] p-8"
      >
        <h2 className="text-3xl font-semibold text-[#3A2E22] mb-6 text-center">
          Welcome to Insights
        </h2>

        <p className="text-center text-[#5C4633] mb-8">
          Sign in with your Google account to get started
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        {/* Google OAuth Button - ONLY METHOD */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full py-4 bg-white hover:bg-gray-50 text-[#3A2E22] font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105 border-2 border-[#C6B29A] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {loading ? "Redirecting..." : "Continue with Google"}
        </button>

        <div className="mt-8 pt-6 border-t border-[#C6B29A]">
          <p className="text-center text-[#5C4633] text-xs">
            By continuing, you agree to our{" "}
            <a href="/terms" className="underline hover:text-[#3A2E22]">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="underline hover:text-[#3A2E22]">
              Privacy Policy
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginForm;
