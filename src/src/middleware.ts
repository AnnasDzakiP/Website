import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Menggunakan fungsi proxy sesuai standar baru Next.js 16
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Cek apakah user sedang login
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Logging untuk debugging di terminal
  console.log(
    "Proxy Check - User:",
    user ? user.email : "Tidak ada user (Belum login)",
  );

  // Logika Proteksi Admin
  if (
    !user &&
    request.nextUrl.pathname.startsWith("/admin") &&
    !request.nextUrl.pathname.startsWith("/admin/login")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  } // <-- Penutup sudah aman

  // Logika Mencegah akses ke login jika sudah login
  if (user && request.nextUrl.pathname.startsWith("/admin/login")) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  } // <-- Penutup sudah aman

  return supabaseResponse;
}

// Konfigurasi rute mana saja yang diproteksi
export const config = {
  matcher: ["/admin/:path*"],
};
