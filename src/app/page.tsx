"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "../utils/supabase/client";
import { MenuItem, OrderDetails, OrderQueueStatus } from "../types";
import Header from "../components/customer/Header";
import MenuCard from "../components/customer/MenuCard";
import OrderModal from "../components/customer/OrderModal";
import PaymentSection from "../components/customer/PaymentSection";
import TrackingStepper from "../components/customer/TrackingStepper";
import CartModal from "../components/customer/CartModal";

export default function HomePage() {
  const [appState, setAppState] = useState<"menu" | "payment" | "tracking">(
    "menu",
  );
  const [currentOrder, setCurrentOrder] = useState<
    OrderDetails | OrderDetails[] | null
  >(null);
  const [queueStatus, setQueueStatus] = useState<OrderQueueStatus | null>(null);

  // STATE KERANJANG
  const [cart, setCart] = useState<OrderDetails[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(
    null,
  );

  const supabase = createClient();

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const fetchMenu = async () => {
      setIsLoadingMenu(true);
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("is_available", true)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Gagal mengambil menu:", error.message);
      } else if (data) {
        const formattedData: MenuItem[] = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          image: item.image,
          isAvailable: item.is_available,
        }));
        setMenuItems(formattedData);
      }
      setIsLoadingMenu(false);
    };
    fetchMenu();
  }, []);

  const handleNewOrder = () => {
    setCurrentOrder(null);
    // KUNCI PERBAIKAN: Kita tidak lagi menghapus setQueueStatus(null) di sini
    // Sehingga data antrean tetap tersimpan di latar belakang.
    setAppState("menu");
  };

  const handleAddToCart = (orderData: OrderDetails) => {
    setCart((prevCart) => [...prevCart, orderData]);
    setSelectedMenuItem(null);
    alert(`🛒 "${orderData.menuItem.name}" berhasil dimasukkan ke keranjang!`);
  };

  const handleRemoveFromCart = (indexToRemove: number) => {
    setCart((prevCart) => prevCart.filter((_, idx) => idx !== indexToRemove));
  };

  const handleClearCart = () => {
    if (confirm("Apakah Anda yakin ingin mengosongkan keranjang pesanan?")) {
      setCart([]);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FCF9F2] text-brand-charcoal overflow-x-hidden antialiased relative">
      <Header
        appState={appState}
        onNewOrder={handleNewOrder}
        cartCount={cart.length}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 mb-8">
        {appState === "menu" && (
          <div className="space-y-6">
            <div className="relative bg-gradient-to-br from-brand-brown to-[#4E2207] text-brand-cream rounded-3xl p-6 sm:p-10 overflow-hidden shadow-xl">
              <div className="relative z-10 max-w-lg space-y-4">
                <span className="bg-brand-yellow/30 text-brand-yellow font-bold text-xs uppercase tracking-widest px-3 py-1 rounded-full">
                  Best Seller Culinary UMKM
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-white tracking-tight leading-tight">
                  Sensasi Lumer yang Bikin Nagih di Setiap Gigitan!
                </h2>
                <p className="text-sm text-brand-cream/80 font-normal leading-relaxed">
                  Pesan langsung dari handphone Anda saat berada di dekat booth
                  kami. Cepat, hangat, dan lumer instan!
                </p>
              </div>
            </div>

            {isLoadingMenu ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-10 h-10 border-4 border-brand-brown border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-sm font-bold text-brand-brown/70">
                  Mengambil menu lumer terbaru...
                </p>
              </div>
            ) : menuItems.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-brand-brown/10 p-8">
                <p className="text-base font-bold text-neutral-600">
                  Belum ada menu yang tersedia saat ini.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {menuItems.map((item) => (
                  <MenuCard
                    key={item.id}
                    item={item}
                    onOpenModal={(menu) => setSelectedMenuItem(menu)}
                  />
                ))}
              </div>
            )}

            {selectedMenuItem && (
              <OrderModal
                item={selectedMenuItem}
                onClose={() => setSelectedMenuItem(null)}
                onProceedToPayment={(orderData) => {
                  setCurrentOrder(orderData);
                  setSelectedMenuItem(null);
                  setAppState("payment");
                }}
                onAddToCart={handleAddToCart}
              />
            )}

            {isCartOpen && (
              <CartModal
                cart={cart}
                onClose={() => setIsCartOpen(false)}
                onRemoveItem={handleRemoveFromCart}
                onClearCart={handleClearCart}
                onProceedToCheckout={(combinedOrder) => {
                  setIsCartOpen(false);
                  setCurrentOrder(combinedOrder);
                  setAppState("payment");
                }}
              />
            )}
          </div>
        )}

        {appState === "payment" && currentOrder && (
          <PaymentSection
            order={currentOrder}
            onBack={() => setAppState("menu")}
            onPaymentSuccess={(queueData) => {
              setQueueStatus(queueData);
              setCart([]);
              setAppState("tracking");
            }}
          />
        )}

        {appState === "tracking" && queueStatus && (
          <TrackingStepper
            queueStatus={queueStatus}
            onNewOrder={handleNewOrder}
            onDevToggleStatus={() => {}}
          />
        )}
      </main>

      {/* FLOATING BUTTON UNTUK CEK ANTREAN */}
      {appState === "menu" && queueStatus && (
        <button
          onClick={() => setAppState("tracking")}
          className="fixed bottom-6 right-6 z-50 bg-brand-brown hover:bg-[#5E2606] text-brand-yellow px-5 py-3.5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.2)] font-extrabold text-sm flex items-center gap-3 transition-transform hover:scale-105 border-2 border-brand-yellow/20 animate-bounce"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-yellow opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-yellow"></span>
          </span>
          Cek Antrean {queueStatus.queueNumber}
        </button>
      )}

      {/* FOOTER ALAMAT BOOTH */}
      <footer className="mt-auto bg-white border-t border-brand-brown/10 py-10 px-4 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)] rounded-t-3xl sm:rounded-t-none relative z-10">
        <div className="max-w-3xl mx-auto flex flex-col items-center text-center space-y-4">
          <div className="w-14 h-14 bg-brand-cream/50 rounded-full flex items-center justify-center text-brand-brown shadow-sm mb-1 ring-4 ring-brand-cream/20">
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              ></path>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              ></path>
            </svg>
          </div>
          <div>
            <h4 className="font-extrabold text-brand-brown font-serif text-xl mb-1">
              Kunjungi Booth Kami
            </h4>
            <div className="w-12 h-1 bg-brand-yellow rounded-full mx-auto mb-4"></div>
          </div>
          <div className="space-y-1.5">
            <p className="font-bold text-sm sm:text-base text-brand-charcoal bg-brand-cream/30 inline-block px-4 py-1 rounded-lg">
              📍 Pancong Lumer Umuy
            </p>
            <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed max-w-lg mx-auto">
              Jl. Agung Kedungbadak, Jl. Perdana Raya Perum. Budi, RT.02/RW.10,
              <br className="hidden sm:block" />
              Kedungbadak, Tanah Sareal, Kota Bogor, Jawa Barat 16165
            </p>
          </div>
          {/* LINK GOOGLE MAPS SUDAH DIPERBARUI */}
          <a
            href="https://maps.app.goo.gl/MVpxTLywSmzNJyTU7"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-brand-brown text-brand-yellow text-xs font-bold rounded-xl hover:bg-[#5E2606] transition-colors uppercase tracking-widest shadow-md hover:shadow-lg"
          >
            Buka di Google Maps
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              ></path>
            </svg>
          </a>
        </div>
      </footer>
    </div>
  );
}
