import { NextResponse } from "next/server";
import Midtrans from "midtrans-client";

const snap = new Midtrans.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
});

export async function POST(req: Request) {
  const { orderId, total, customerName } = await req.json();

  const parameter = {
    transaction_details: {
      order_id: orderId, // ID unik dari Supabase Anda
      gross_amount: Math.round(Number(total)),
    },
    customer_details: {
      first_name: customerName,
    },
    // Menentukan metode pembayaran (misal: hanya QRIS)
    enabled_payments: ["gopay", "qris"],
  };

  try {
    const transaction = await snap.createTransaction(parameter);
    return NextResponse.json({ token: transaction.token });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal membuat transaksi" },
      { status: 500 },
    );
  }
}
