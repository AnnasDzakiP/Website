"use client";

import React, { useState } from "react";
// 1. Perbaikan Path: Hanya naik dua tingkat (../../) untuk menuju src/utils
import { createClient } from "../../utils/supabase/client";

interface LoginFormProps {
  onLoginSuccess: () => void;
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // 2. Perbaikan Kode Lama: Langsung panggil fungsi dari client.ts
  const supabase = createClient();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError("");

    // Pemanggilan API Supabase Auth
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    setIsLoading(false);

    if (error) {
      setLoginError("Login gagal: Email atau password salah.");
    } else {
      onLoginSuccess();
    }
  };

  return (
    <div className="min-h-screen bg-brand-charcoal flex items-center justify-center p-4">
      {/* Dekorasi Latar Belakang (Opsional, disederhanakan agar fokus ke form) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-brand-yellow/5 blur-[120px]"></div>
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] rounded-full bg-brand-brown/40 blur-[100px]"></div>
      </div>

      <div className="w-full max-w-md bg-[#FCF9F2] rounded-3xl shadow-2xl p-8 relative z-10">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-2xl font-extrabold text-brand-brown font-serif">
            Admin Login
          </h1>
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-5">
          {loginError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold">
              ⚠️ {loginError}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-neutral-700 uppercase tracking-widest">
              Email Admin
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-brand-brown/20 outline-none focus:border-brand-yellow text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-neutral-700 uppercase tracking-widest">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-brand-brown/20 outline-none focus:border-brand-yellow text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-brown text-brand-yellow font-extrabold py-4 px-6 rounded-xl hover:shadow-lg transition-all text-sm tracking-widest disabled:opacity-50"
          >
            {isLoading ? "MEMPROSES..." : "MASUK DASHBOARD"}
          </button>
        </form>
      </div>
    </div>
  );
}
