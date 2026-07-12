"use client";

import React from "react";
import { useRouter } from "next/navigation";
import LoginForm from "../../../components/admin/LoginForm";

export default function AdminLoginPage() {
  const router = useRouter();

  return (
    <LoginForm
      onLoginSuccess={() => {
        // Setelah login berhasil, arahkan ke dashboard admin
        router.push("/admin");
      }}
    />
  );
}
