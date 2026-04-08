"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { motion } from "framer-motion";

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="h-10 w-24 bg-white/5 animate-pulse rounded-full border border-white/10"></div>
    );
  }

  if (session) {
    return (
      <div className="flex items-center gap-3">
        <a href="/dashboard" className="flex items-center gap-2 bg-surface-darker border border-border-dark px-3 py-1.5 rounded-full hover:bg-white/5 transition-colors group">
          {session.user?.image ? (
            <img src={session.user.image} alt="Avatar" className="w-6 h-6 rounded-full group-hover:ring-2 ring-primary transition-all" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold group-hover:bg-primary group-hover:text-white transition-all">
              {session.user?.name?.charAt(0) || "U"}
            </div>
          )}
          <span className="text-xs font-bold text-slate-300 hidden sm:block group-hover:text-white transition-colors">
            {session.user?.name?.split(" ")[0]}
          </span>
        </a>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => signOut()}
          className="text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest"
        >
          Sign Out
        </motion.button>
      </div>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => signIn("github")}
      className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-5 py-2 rounded-full transition-all border border-white/10 uppercase tracking-widest flex items-center gap-2"
    >
      <span className="material-symbols-outlined text-sm">login</span>
      Sign In
    </motion.button>
  );
}
