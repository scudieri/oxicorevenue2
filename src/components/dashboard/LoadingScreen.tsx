import { motion } from "framer-motion";

export const LoadingScreen = () => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background z-[100] flex flex-col items-center justify-center"
    >
      <div className="relative w-20 h-20 mb-8">
        <div className="absolute inset-0 border-4 border-muted rounded-full" />
        <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full loader-spin" />
      </div>
      <p className="text-[10px] font-black tracking-[0.5em] text-muted-foreground uppercase animate-pulse">
        Initializing V4 Arena v4.9
      </p>
    </motion.div>
  );
};
