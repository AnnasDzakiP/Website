import React, { ButtonHTMLAttributes } from "react";

// Mendefinisikan tipe data untuk props tombol kita
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  // Class dasar yang selalu ada di setiap tombol
  const baseClasses =
    "flex items-center justify-center gap-2 font-bold tracking-wide transition-all cursor-pointer rounded-xl outline-none focus:ring-2 focus:ring-offset-1";

  // Konfigurasi warna berdasarkan variant
  const variantClasses = {
    primary:
      "bg-brand-yellow text-brand-brown hover:bg-brand-yellow/90 hover:shadow-md focus:ring-brand-yellow",
    secondary:
      "bg-brand-brown text-brand-yellow hover:bg-brand-brown/95 shadow-md focus:ring-brand-brown",
    outline:
      "border border-brand-brown/20 text-brand-brown hover:bg-neutral-100 focus:ring-brand-brown/30",
    danger:
      "border border-red-500/30 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white focus:ring-red-500",
  };

  // Konfigurasi ukuran padding dan teks
  const sizeClasses = {
    sm: "py-1.5 px-3 text-xs",
    md: "py-2.5 px-4 text-sm",
    lg: "py-3.5 px-6 text-base",
  };

  // Jika tombol dinonaktifkan (disabled)
  const disabledClasses = disabled
    ? "opacity-50 cursor-not-allowed pointer-events-none bg-neutral-200 text-neutral-400 border-none shadow-none"
    : "";

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      disabled={disabled}
      className={`
        ${baseClasses} 
        ${variantClasses[variant]} 
        ${sizeClasses[size]} 
        ${widthClass} 
        ${disabledClasses} 
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
