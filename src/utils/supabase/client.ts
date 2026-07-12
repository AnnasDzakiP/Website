import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  // Fungsi ini akan dipanggil di komponen Frontend (Client Components)
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
