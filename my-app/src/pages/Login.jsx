import React from "react";
import { motion } from "framer-motion";

// Import your new components
import AnimatedBackground from "../components/AnimatedBackground";
import LoginInfoPanel from "../components/LoginInfoPanel";
import LoginForm from "../components/LoginForm";

const Login = () => {
  return (
    <div className="relative h-screen overflow-hidden font-sans">
      {/* 1. Animated Background */}
      <AnimatedBackground />

      {/* Centered Book Layout */}
      <div className="relative z-10 flex items-center justify-center h-full px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative w-full max-w-5xl bg-[#E7D0C5]/80 backdrop-blur-md border border-[#C6B29A] rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden"
        >
          {/* 2. Left Page */}
          <LoginInfoPanel />

          {/* 3. Right Page */}
          <LoginForm />

          {/* Book Divider */}
          <div className="absolute inset-y-0 left-1/2 w-[2px] bg-gradient-to-b from-[#C6B29A]/60 to-transparent shadow-md"></div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;