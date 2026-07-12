import React, { useState, useEffect } from "react";
import { OrderQueueStatus } from "../../types";
import { IconCheck } from "../ui/Icons";
import { createClient } from "../../utils/supabase/client";

interface TrackingStepperProps {
  queueStatus: OrderQueueStatus;
  onNewOrder: () => void;
  onDevToggleStatus: () => void; // Hanya untuk development
}

export default function TrackingStepper({
  queueStatus,
  onNewOrder,
  onDevToggleStatus,
}: TrackingStepperProps) {
  // Internal state agar bisa diupdate oleh Realtime Supabase atau dari prop tombol Dev
  const [currentStep, setCurrentStep] = useState(queueStatus.currentStep);
  const supabase = createClient();

  // Sinkronisasi jika prop dari parent berubah (saat tombol Dev diklik)
  useEffect(() => {
    setCurrentStep(queueStatus.currentStep);
  }, [queueStatus.currentStep]);

  // Listener Supabase Realtime
  useEffect(() => {
    const channel = supabase
      .channel("realtime-orders")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        (payload) => {
          // Mencocokkan pembaruan status berdasarkan nama pelanggan
          // (Idealnya menggunakan ID unik, namun ini cukup untuk sinkronisasi awal)
          if (payload.new.customer_name === queueStatus.customerName) {
            const statusBaru = payload.new.status;

            if (statusBaru === "pending")
              setCurrentStep(1); // Pesanan Masuk
            else if (statusBaru === "confirmed")
              setCurrentStep(2); // Sedang Dimasak
            else if (statusBaru === "ready")
              setCurrentStep(3); // Siap Diambil
            else if (statusBaru === "done") setCurrentStep(4); // Selesai
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queueStatus.customerName, supabase]);

  // Data UI untuk Stepper
  const steps = [
    { step: 1, title: "Pesanan Diterima", desc: "Menunggu konfirmasi admin" },
    {
      step: 2,
      title: "Sedang Dimasak",
      desc: "Pancong lumer sedang dipanggang",
    },
    {
      step: 3,
      title: "Siap Diambil",
      desc: "Silakan menuju kasir/area pickup",
    },
    { step: 4, title: "Selesai", desc: "Terima kasih, selamat menikmati!" },
  ];

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Dev Controller (Bisa dihapus jika sudah pakai Supabase Realtime) */}
      <div className="fixed top-4 right-4 z-40 bg-white border border-brand-brown/20 p-3 rounded-xl shadow-lg flex items-center gap-3 text-xs w-[280px]">
        <button
          onClick={onDevToggleStatus}
          className="flex-1 bg-brand-brown text-brand-yellow font-semibold py-2 px-3 rounded-lg"
        >
          Ubah Status Stepper ({currentStep}/4)
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-brown/10 shadow-lg text-center space-y-6">
        <div className="bg-gradient-to-tr from-brand-cream/40 to-amber-50 p-6 rounded-3xl border border-brand-brown/10 relative overflow-hidden">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-yellow block my-1">
            NO. ANTRIAN ANDA
          </span>
          <h2 className="text-5xl font-black text-brand-brown leading-tight tracking-tight drop-shadow-sm font-serif">
            {queueStatus.queueNumber}
          </h2>
        </div>

        {/* Area Stepper Visual 1 - 4 */}
        <div className="text-left space-y-6 py-4 px-2 sm:px-6">
          {steps.map((s, index) => {
            const isActive = currentStep === s.step;
            const isCompleted = currentStep > s.step;

            return (
              <div key={s.step} className="relative flex items-start gap-4">
                {/* Garis Konektor */}
                {index !== steps.length - 1 && (
                  <div
                    className={`absolute top-8 left-4 w-0.5 h-full -ml-px ${
                      isCompleted ? "bg-brand-yellow" : "bg-neutral-200"
                    }`}
                  ></div>
                )}

                {/* Ikon Bulat */}
                <div
                  className={`relative z-10 w-8 h-8 flex items-center justify-center rounded-full border-2 transition-colors ${
                    isCompleted
                      ? "bg-brand-yellow border-brand-yellow text-brand-brown"
                      : isActive
                        ? "bg-white border-brand-yellow text-brand-yellow"
                        : "bg-white border-neutral-200 text-neutral-300"
                  }`}
                >
                  {isCompleted ? (
                    <IconCheck className="w-4 h-4" />
                  ) : (
                    <span className="text-xs font-bold">{s.step}</span>
                  )}
                </div>

                {/* Teks Step */}
                <div className="flex-1 pb-2">
                  <h4
                    className={`text-sm font-bold ${
                      isActive || isCompleted
                        ? "text-brand-brown"
                        : "text-neutral-400"
                    }`}
                  >
                    {s.title}
                  </h4>
                  <p
                    className={`text-xs ${
                      isActive || isCompleted
                        ? "text-neutral-600"
                        : "text-neutral-400"
                    }`}
                  >
                    {s.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={onNewOrder}
          className="w-full mt-6 bg-brand-yellow text-brand-brown hover:bg-brand-yellow/90 font-extrabold py-3.5 px-6 rounded-2xl transition-all shadow-md text-sm cursor-pointer"
        >
          Kembali & Pesan Menu Lain
        </button>
      </div>
    </div>
  );
}
