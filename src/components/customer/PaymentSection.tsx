import React, { useState } from "react";
import { OrderDetails, OrderQueueStatus } from "../../types";
import { IconArrowLeft, IconChevronRight } from "../ui/Icons";
import { createClient } from "../../utils/supabase/client";

declare global {
  interface Window {
    snap: any;
  }
}

interface PaymentSectionProps {
  order: OrderDetails | OrderDetails[];
  onBack: () => void;
  onPaymentSuccess: (queueData: OrderQueueStatus) => void;
}

export default function PaymentSection({
  order,
  onBack,
  onPaymentSuccess,
}: PaymentSectionProps) {
  const [paymentMethod, setPaymentMethod] = useState<"QRIS" | "Cash">("QRIS");
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMsg, setToastMsg] = useState<{
    type: "warning" | "error";
    text: string;
  } | null>(null);

  const supabase = createClient();

  const orderList = Array.isArray(order) ? order : [order];
  const grandTotal = orderList.reduce((sum, item) => sum + item.subtotal, 0);
  const representativeName = orderList[0]?.customerName || "Pelanggan";

  const handleSubmitPayment = async () => {
    setIsProcessing(true);
    setToastMsg(null);

    const { data: insertedOrder, error: dbError } = await supabase
      .from("orders")
      .insert({
        customer_name: representativeName,
        status: "pending",
        total: grandTotal,
        order_items: orderList,
        payment_method: paymentMethod,
      })
      .select()
      .single();

    if (dbError) {
      setToastMsg({
        type: "error",
        text: "Gagal menyimpan pesanan ke sistem.",
      });
      setIsProcessing(false);
      return;
    }

    const nomorAntrean = `#${insertedOrder.id.toString().slice(-4).toUpperCase()}`;

    if (paymentMethod === "Cash") {
      const queue: OrderQueueStatus = {
        queueNumber: nomorAntrean,
        currentStep: 1,
        customerName: representativeName,
        orderDetails: orderList[0],
      };
      onPaymentSuccess(queue);
    } else {
      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: `ORDER-${insertedOrder.id}`,
            total: grandTotal,
            customerName: representativeName,
          }),
        });
        const data = await res.json();

        if (typeof window !== "undefined" && window.snap) {
          window.snap.pay(data.token, {
            onSuccess: (result: any) => {
              const queue: OrderQueueStatus = {
                queueNumber: nomorAntrean,
                currentStep: 1,
                customerName: representativeName,
                orderDetails: orderList[0],
              };
              onPaymentSuccess(queue);
            },
            onPending: (result: any) => {
              // Dikosongkan agar tidak ada alert mengganggu
              setIsProcessing(false);
            },
            onError: (result: any) => {
              setToastMsg({
                type: "error",
                text: "Pembayaran gagal diproses Midtrans.",
              });
              setIsProcessing(false);
            },
            onClose: () => {
              // Dikosongkan agar tidak ada alert mengganggu
              setIsProcessing(false);
            },
          });
        } else {
          setToastMsg({ type: "error", text: "Sistem Midtrans terblokir." });
          setIsProcessing(false);
        }
      } catch (error) {
        setToastMsg({ type: "error", text: "Terjadi kesalahan server." });
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-12">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-bold text-brand-brown/70 hover:text-brand-brown transition-colors group"
      >
        <div className="bg-white p-2 rounded-full shadow-sm group-hover:shadow-md transition-all">
          <IconArrowLeft className="w-4 h-4 mr-0" />
        </div>
        Kembali ke Menu
      </button>

      <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-brand-brown/5 shadow-xl space-y-8">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-black text-brand-brown font-serif">
            Checkout Pesanan
          </h2>
          <p className="text-sm text-neutral-500 font-medium">
            Selesaikan pembayaran agar lumeran segera disiapkan.
          </p>
        </div>

        {/* RINCIAN PESANAN DIPISAH */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
            <span className="font-bold text-xs uppercase tracking-widest text-neutral-400">
              Ringkasan
            </span>
            <span className="font-bold text-xs text-brand-brown bg-brand-cream/50 px-3 py-1 rounded-full">
              {orderList.length} Item
            </span>
          </div>

          <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar">
            {orderList.map((item, idx) => (
              <div
                key={idx}
                className="bg-[#FCF9F2] p-4 rounded-2xl border border-brand-brown/5 flex flex-col gap-2 relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-yellow"></div>
                <div className="flex justify-between items-start gap-4 pl-1">
                  <span className="font-bold text-brand-charcoal text-sm leading-tight">
                    {item.menuItem.name} x{item.quantity}
                  </span>
                  <span className="font-extrabold text-brand-brown whitespace-nowrap text-sm">
                    Rp {item.subtotal.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-end pt-4 px-1">
            <span className="font-bold text-xs text-neutral-500 uppercase tracking-widest">
              Total Tagihan
            </span>
            <span className="font-black text-2xl text-brand-brown leading-none">
              Rp {grandTotal.toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        {/* METODE PEMBAYARAN */}
        <div className="space-y-3 pt-2">
          <span className="font-bold text-xs uppercase tracking-widest text-neutral-400 block px-1">
            Metode Pembayaran
          </span>
          <div className="grid grid-cols-2 gap-4">
            <label
              className={`relative flex flex-col items-center justify-center p-4 rounded-2xl cursor-pointer transition-all duration-200 border-2 ${
                paymentMethod === "QRIS"
                  ? "border-brand-brown bg-brand-cream/20 shadow-md ring-4 ring-brand-cream"
                  : "border-neutral-100 bg-white hover:border-brand-yellow/50"
              }`}
            >
              <input
                type="radio"
                name="payment"
                value="QRIS"
                checked={paymentMethod === "QRIS"}
                onChange={() => setPaymentMethod("QRIS")}
                className="sr-only"
              />
              <span
                className={`font-black text-sm ${paymentMethod === "QRIS" ? "text-brand-brown" : "text-neutral-500"}`}
              >
                QRIS / E-Wallet
              </span>
              {paymentMethod === "QRIS" && (
                <div className="absolute top-3 right-3 w-3 h-3 bg-brand-brown rounded-full"></div>
              )}
            </label>

            <label
              className={`relative flex flex-col items-center justify-center p-4 rounded-2xl cursor-pointer transition-all duration-200 border-2 ${
                paymentMethod === "Cash"
                  ? "border-brand-brown bg-brand-cream/20 shadow-md ring-4 ring-brand-cream"
                  : "border-neutral-100 bg-white hover:border-brand-yellow/50"
              }`}
            >
              <input
                type="radio"
                name="payment"
                value="Cash"
                checked={paymentMethod === "Cash"}
                onChange={() => setPaymentMethod("Cash")}
                className="sr-only"
              />
              <span
                className={`font-black text-sm ${paymentMethod === "Cash" ? "text-brand-brown" : "text-neutral-500"}`}
              >
                Bayar di Kasir
              </span>
              {paymentMethod === "Cash" && (
                <div className="absolute top-3 right-3 w-3 h-3 bg-brand-brown rounded-full"></div>
              )}
            </label>
          </div>
        </div>

        {toastMsg && (
          <div className="p-4 rounded-2xl flex items-start gap-3 border bg-rose-50 border-rose-200 text-rose-800 animate-fadeIn">
            <p className="text-xs font-semibold leading-relaxed">
              {toastMsg.text}
            </p>
          </div>
        )}

        <button
          onClick={handleSubmitPayment}
          disabled={isProcessing}
          className="w-full bg-brand-brown hover:bg-[#5E2606] text-brand-yellow font-black py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all tracking-wider text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {isProcessing ? "Memproses Pesanan..." : "Konfirmasi Pesanan"}
        </button>
      </div>
    </div>
  );
}
