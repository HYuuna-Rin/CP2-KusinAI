/*
  File: src/components/PageTransition.jsx
  Purpose: Wrapper to animate route/page transitions.
  Responsibilities:
  - Apply enter/exit animations around routed content.
  - Improve perceived navigation smoothness.
  Notes: Keep animation settings configurable.
*/
import React from "react";
import { motion } from "framer-motion";

const pageVariants = {
  initial: { opacity: 0, y: 30 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -30 },
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.4,
};

export default function PageTransition({ children }) {
  return (
    <motion.div
      className="w-screen"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
}
