import React from "react";
import { motion } from "framer-motion";

const LoginInfoPanel = () => {
  return (
    <div className="w-full md:w-1/2 p-10 flex flex-col justify-center items-center bg-[#F3E5D8] border-r border-[#C6B29A] text-center">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="text-5xl font-bold text-[#3A2E22] mb-4"
      >
        INSIGHTS
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 1 }}
        className="text-[#5C4633] text-lg font-medium max-w-md leading-relaxed"
      >
        Discover, Learn, and Evolve — Your Personalized Knowledge & News Hub.
      </motion.p>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 1 }}
        className="mt-8 text-center"
      >
        <p className="text-sm text-[#5C4633]">
          New to Insights?   Sign in with your Google account - it's fast and secure!
        </p>
      </motion.div>
    </div>
  );
};

export default LoginInfoPanel;
