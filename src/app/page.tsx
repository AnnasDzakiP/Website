'use client';

import React, { useState, useMemo } from 'react';
import { MOCK_MENU_ITEMS, MOCK_TOPPING_OPTIONS } from '../data/mockData';
import { MenuItem, OrderDetails, VariantType, ToppingOption, PaymentDetails, OrderQueueStatus, QueueStep } from '../types';

// Custom SVG Icons for neat UI design
const IconChevronRight = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
  </svg>
);

const IconArrowLeft = () => (
  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const IconShoppingCart = ({ count }: { count: number }) => (
  <div className="relative p-2 bg-brand-brown text-brand-yellow rounded-full hover:scale-105 transition-transform cursor-pointer shadow-md">
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
    {count > 0 && (
      <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-brand-cream animate-bounce">
        {count}
      </span>
    )}
  </div>
);

const IconCheck = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
  </svg>
);

const IconUpload = () => (
  <svg className="w-8 h-8 text-neutral-400 group-hover:text-brand-brown transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

const IconPlus = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
  </svg>
);

const IconMinus = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4" />
  </svg>
);

export default function HomePage() {
  // Navigation / State variables
  const [activeCategory, setActiveCategory] = useState<'all' | 'sweet' | 'savory'>('all');
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);

  // Cart & Order Customization State (State 2)
  const [variant, setVariant] = useState<VariantType>('Setengah Matang');
  const [selectedToppings, setSelectedToppings] = useState<ToppingOption[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');

  // active items and invoices (State 3 & 4)
  const [currentOrder, setCurrentOrder] = useState<OrderDetails | null>(null);
  const [paymentState, setPaymentState] = useState<PaymentDetails | null>(null);
  const [queueStatus, setQueueStatus] = useState<OrderQueueStatus | null>(null);
  const [appState, setAppState] = useState<'menu' | 'payment' | 'tracking'>('menu');

  // QR Code Image / Receipt upload states
  const [paymentMethod, setPaymentMethod] = useState<'QRIS' | 'Cash'>('QRIS');
  const [mockReceiptName, setMockReceiptName] = useState<string | null>(null);
  const [isReceiptUploading, setIsReceiptUploading] = useState(false);

  // Filtered Menu Items
  const filteredMenuItems = useMemo(() => {
    if (activeCategory === 'all') return MOCK_MENU_ITEMS;
    return MOCK_MENU_ITEMS.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  // Real-time Subtotal inside Modal
  const currentSubtotal = useMemo(() => {
    if (!selectedMenuItem) return 0;
    const toppingTotal = selectedToppings.reduce((sum, topping) => sum + topping.price, 0);
    return (selectedMenuItem.price + toppingTotal) * quantity;
  }, [selectedMenuItem, selectedToppings, quantity]);

  // Modal Open Handler
  const handleOpenOrderModal = (item: MenuItem) => {
    if (!item.isAvailable) return;
    setSelectedMenuItem(item);
    setVariant('Setengah Matang');
    setSelectedToppings([]);
    setSpecialNotes('');
    setQuantity(1);
    setErrorMessage('');
  };

  // Toggle Topping Checkbox
  const handleToggleTopping = (topping: ToppingOption) => {
    setSelectedToppings((prev) => {
      const exists = prev.some((t) => t.id === topping.id);
      if (exists) {
        return prev.filter((t) => t.id !== topping.id);
      } else {
        return [...prev, topping];
      }
    });
  };

  // Process Customization Order Form -> Payment step 
  const handleProceedToPayment = () => {
    if (!customerName.trim()) {
      setErrorMessage('Silakan masukkan nama pembeli terlebih dahulu.');
      return;
    }
    if (!selectedMenuItem) return;

    const orderData: OrderDetails = {
      menuItem: selectedMenuItem,
      variant,
      selectedToppings,
      customerName,
      notes: specialNotes,
      quantity,
      subtotal: currentSubtotal,
    };

    setCurrentOrder(orderData);
    setSelectedMenuItem(null); // Close modal
    setAppState('payment');
    setMockReceiptName(null);
  };

  // Simulate file upload logic for QRIS confirmation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsReceiptUploading(true);
      // Simulate network request upload
      setTimeout(() => {
        setMockReceiptName(file.name);
        setIsReceiptUploading(false);
      }, 1200);
    }
  };

  // Process Payment Submit -> Tracking State
  const handleSubmitPayment = () => {
    if (paymentMethod === 'QRIS' && !mockReceiptName) {
      alert('Harap unggah bukti pembayaran QRIS terlebih dahulu.');
      return;
    }

    if (!currentOrder) return;

    // Generate simulated Queue
    const randomQueueNum = `#A-${Math.floor(100 + Math.random() * 900)}`;

    const queue: OrderQueueStatus = {
      queueNumber: randomQueueNum,
      currentStep: 1, // Start with Step 1: Menunggu Validasi
      customerName: currentOrder.customerName,
      orderDetails: currentOrder,
    };

    setQueueStatus(queue);
    setAppState('tracking');
  };

  // Reset to brand new order flow
  const handleNewOrder = () => {
    setCurrentOrder(null);
    setPaymentState(null);
    setQueueStatus(null);
    setCustomerName('');
    setAppState('menu');
  };

  // Dev helpers to status-toggle
  const handleToggleMockStatus = () => {
    if (!queueStatus) return;
    setQueueStatus((prev) => {
      if (!prev) return null;
      const nextStep = (prev.currentStep === 4 ? 1 : prev.currentStep + 1) as QueueStep;
      return {
        ...prev,
        currentStep: nextStep,
      };
    });
  };

  // Categories helper descriptions
  const categoriesList: { id: 'all' | 'sweet' | 'savory'; label: string }[] = [
    { id: 'all', label: 'Semua Menu' },
    { id: 'sweet', label: 'Manis Lumer (Sweet)' },
    { id: 'savory', label: 'Gurih Keju (Savory)' }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#FCF9F2] text-brand-charcoal overflow-x-hidden antialiased">
      {/* Dev Mock Status Stepper Controller Panel */}
      {appState === 'tracking' && queueStatus && (
        <div className="fixed top-4 right-4 z-40 bg-white border border-brand-brown/20 p-3 rounded-xl shadow-lg flex items-center gap-3 text-xs w-[280px] backdrop-blur-md bg-white/95">
          <div className="bg-amber-50 p-2 rounded-lg">
            <span className="font-bold text-brand-brown">Dev Controller</span>
            <p className="text-[10px] text-neutral-500">Klik tombol ke status berikutnya.</p>
          </div>
          <button
            onClick={handleToggleMockStatus}
            className="flex-1 bg-brand-brown hover:bg-brand-brown/85 text-brand-yellow font-semibold py-2 px-3 rounded-lg transition-colors cursor-pointer text-center"
          >
            Ubah Status Stepper ({queueStatus.currentStep}/4)
          </button>
        </div>
      )}

      {/* HEADER / NAVIGATION BAR */}
      <header className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-brand-brown/5 z-30 transition-all">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div onClick={handleNewOrder} className="cursor-pointer flex items-center gap-2">
            <div className="w-10 h-10 bg-brand-yellow rounded-xl flex items-center justify-center shadow-md rotate-3 hover:rotate-12 transition-all">
              <span className="text-white font-extrabold text-xl font-serif">P</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-brand-brown font-serif tracking-tight leading-4">Pancong Lumer</h1>
              <span className="text-[9px] uppercase tracking-wider text-brand-yellow font-bold">Booths & Desserts</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {appState === 'menu' && (
              <IconShoppingCart count={customerName.trim() ? 1 : 0} />
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">

        {/* STATE 1: MENU VIEW STATE */}
        {appState === 'menu' && (
          <div className="space-y-6">

            {/* HERO HERO SECTION */}
            <div className="relative bg-gradient-to-br from-brand-brown to-[#4E2207] text-brand-cream rounded-3xl p-6 sm:p-10 overflow-hidden shadow-xl">
              <div className="absolute right-0 bottom-0 top-0 opacity-20 sm:opacity-40 w-1/2 bg-[url('https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500')] bg-cover bg-center rounded-l-3xl"></div>
              <div className="relative z-10 max-w-lg space-y-4">
                <span className="bg-brand-yellow/30 text-brand-yellow font-bold text-xs uppercase tracking-widest px-3 py-1 rounded-full">
                  🔥 Best Seller Culinary UMKM
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-white tracking-tight leading-tight">
                  Sensasi Lumernya Cokelat & Keju di Mulut!
                </h2>
                <p className="text-sm text-brand-cream/80 font-normal leading-relaxed">
                  Pesan langsung dari handphone Anda saat berada di dekat booth kami. Cepat, hangat, dan lumer instan!
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs bg-white/10 px-3 py-1.5 rounded-xl text-white font-medium">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                    Booth Buka (10:00 - 22:00)
                  </div>
                </div>
              </div>
            </div>

            {/* CATEGORY SWIPE TABS */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-brand-charcoal font-serif">Pilih Kategori Menu</h3>
                <span className="text-xs text-neutral-500 font-medium">Swipe ke samping untuk melihat kategori</span>
              </div>

              {/* Category tabs: Swipeable on mobile */}
              <div className="flex gap-2.5 overflow-x-auto pb-3 pt-1 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth">
                {categoriesList.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex-none px-5 py-3 rounded-2xl text-sm font-semibold tracking-wide transition-all border outline-none cursor-pointer duration-300 ${activeCategory === cat.id
                      ? 'bg-brand-brown text-white border-brand-brown shadow-md shadow-brand-brown/20 scale-102'
                      : 'bg-white text-neutral-600 border-brand-brown/10 hover:border-brand-brown/35'
                      }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* MENU CARD GRID */}
            <div className="space-y-4">
              <div className="border-b border-brand-brown/5 pb-2">
                <h3 className="font-bold text-xl text-brand-brown font-serif capitalize">
                  {activeCategory === 'all' ? 'Semua Menu Pancong' : activeCategory === 'sweet' ? 'Pancong Manis Lumer' : 'Pancong Gurih Keju'}
                </h3>
              </div>

              {/* Grid: 1 col on mobile, 2 col on tablet, 4 col on desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredMenuItems.map((item) => (
                  <div
                    key={item.id}
                    className={`bg-white rounded-2xl shadow-sm border border-brand-brown/5 overflow-hidden flex flex-col transition-all duration-300 ${item.isAvailable
                      ? 'hover:shadow-lg hover:-translate-y-1 hover:border-brand-yellow/30'
                      : 'opacity-75'
                      }`}
                  >
                    {/* Floating Stock Badge */}
                    <div className="relative h-48 w-full bg-neutral-100 overflow-hidden">
                      {/* Image placeholder with fallback visual */}
                      <img
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                      />
                      <div className="absolute top-3 left-3">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold shadow-md uppercase tracking-wider ${item.isAvailable
                          ? 'bg-emerald-500 text-white'
                          : 'bg-rose-500 text-white'
                          }`}>
                          {item.isAvailable ? 'Tersedia' : 'Habis'}
                        </span>
                      </div>

                      <div className="absolute bottom-3 right-3 bg-brand-charcoal/85 backdrop-blur-sm text-brand-cream text-xs font-bold px-3 py-1 rounded-xl">
                        Rp {item.price.toLocaleString('id-ID')}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-brand-yellow">
                          {item.category === 'sweet' ? '🍩 Manis Lumer' : '🥓 Gurih Asin'}
                        </span>
                        <h4 className="font-bold text-base text-brand-charcoal font-serif line-clamp-1 group-hover:text-brand-brown">
                          {item.name}
                        </h4>
                        <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Card Button */}
                      <button
                        disabled={!item.isAvailable}
                        onClick={() => handleOpenOrderModal(item)}
                        className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer ${item.isAvailable
                          ? 'bg-brand-yellow text-brand-brown hover:bg-brand-yellow/90 hover:shadow-md'
                          : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                          }`}
                      >
                        {item.isAvailable ? 'Pesan Sekarang' : 'Stok Kosong'}
                        {item.isAvailable && <IconChevronRight />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STATE 3: PAYMENT STATE */}
        {appState === 'payment' && currentOrder && (
          <div className="max-w-2xl mx-auto space-y-6">

            {/* Header Back Button */}
            <button
              onClick={() => setAppState('menu')}
              className="flex items-center text-sm font-semibold text-brand-brown hover:text-brand-yellow transition-colors cursor-pointer"
            >
              <IconArrowLeft /> Kembali ke Menu
            </button>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-brown/10 shadow-lg space-y-6">
              <div className="border-b border-brand-brown/10 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-yellow">Invoice Tagihan</span>
                <h3 className="font-bold text-2xl font-serif text-brand-brown">Pembayaran</h3>
                <p className="text-xs text-neutral-500">Selesaikan pembayaran untuk memproses antrian pesanan Anda</p>
              </div>

              {/* Rincian Pesanan */}
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-neutral-700 uppercase tracking-wider">Rincian Pesanan:</h4>
                <div className="bg-[#FCF9F2] p-4 rounded-2xl border border-brand-brown/5 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="bg-brand-cream/80 text-brand-brown text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mb-1">
                        {currentOrder.variant}
                      </span>
                      <h5 className="font-bold text-base text-brand-charcoal">{currentOrder.menuItem.name}</h5>
                      <span className="text-xs text-neutral-500">Qty: {currentOrder.quantity}x</span>
                    </div>
                    <span className="font-bold text-sm text-brand-brown">
                      Rp {(currentOrder.menuItem.price * currentOrder.quantity).toLocaleString('id-ID')}
                    </span>
                  </div>

                  {/* Toppings list */}
                  {currentOrder.selectedToppings.length > 0 && (
                    <div className="border-t border-brand-brown/5 pt-2 mt-2 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-brand-yellow tracking-wider">Extra Toppings:</span>
                      {currentOrder.selectedToppings.map((top) => (
                        <div key={top.id} className="flex justify-between text-xs text-neutral-600">
                          <span>+ {top.name}</span>
                          <span>Rp {(top.price * currentOrder.quantity).toLocaleString('id-ID')}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Special Notes */}
                  {currentOrder.notes.trim() && (
                    <div className="border-t border-brand-brown/5 pt-2 mt-2">
                      <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Catatan:</span>
                      <p className="text-xs text-neutral-600 italic bg-white p-2 rounded-lg border border-brand-brown/5 mt-1">
                        "{currentOrder.notes}"
                      </p>
                    </div>
                  )}

                  {/* Customer Name */}
                  <div className="border-t border-brand-brown/10 pt-3 flex justify-between text-sm">
                    <span className="text-neutral-500 font-medium">Nama Pembeli:</span>
                    <span className="font-bold text-brand-brown bg-brand-cream/40 px-2 py-0.5 rounded-lg">{currentOrder.customerName}</span>
                  </div>
                </div>

                {/* Total tagihan */}
                <div className="flex justify-between items-center bg-brand-brown text-white p-4 rounded-2xl shadow-md">
                  <span className="font-bold text-sm tracking-wide">Total Harus Dibayar</span>
                  <span className="font-extrabold text-xl text-brand-yellow">
                    Rp {currentOrder.subtotal.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* PAYMENT METHOD SELECTOR */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-neutral-700 uppercase tracking-wider">Metode Pembayaran:</h4>
                <div className="grid grid-cols-2 gap-4">
                  {/* QRIS Option */}
                  <button
                    onClick={() => setPaymentMethod('QRIS')}
                    className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${paymentMethod === 'QRIS'
                      ? 'border-brand-yellow bg-brand-cream/20 shadow-md shadow-brand-yellow/10'
                      : 'border-brand-brown/10 bg-white hover:border-brand-brown/30'
                      }`}
                  >
                    <div className="w-10 h-8 flex items-center justify-center bg-sky-100 text-sky-600 rounded-lg font-extrabold text-xs">
                      QRIS
                    </div>
                    <span className="font-bold text-xs">QRIS Instan</span>
                  </button>

                  {/* Cash Option */}
                  <button
                    onClick={() => setPaymentMethod('Cash')}
                    className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${paymentMethod === 'Cash'
                      ? 'border-brand-yellow bg-brand-cream/20 shadow-md shadow-brand-yellow/10'
                      : 'border-brand-brown/10 bg-white hover:border-brand-brown/30'
                      }`}
                  >
                    <div className="w-10 h-8 flex items-center justify-center bg-green-100 text-green-600 rounded-lg font-extrabold text-xs">
                      TUNAI
                    </div>
                    <span className="font-bold text-xs">Bayar di Kasir / Transfer</span>
                  </button>
                </div>
              </div>

              {/* IF QRIS : DISPLAY QR CONTAINER & UPLOAD RECEIPT */}
              {paymentMethod === 'QRIS' && (
                <div className="bg-[#FAF7F0] border border-brand-brown/10 p-6 rounded-2xl space-y-6 animate-fade-in">

                  {/* QR Code Container */}
                  <div className="flex flex-col items-center space-y-3">
                    <span className="font-bold text-xs text-brand-brown uppercase tracking-wider">Scan Kode QRIS di Bawah Ini:</span>

                    {/* Mock QR Code Frame */}
                    <div className="w-48 h-48 bg-white border border-brand-brown/20 p-2.5 rounded-2xl shadow-md flex items-center justify-center relative">
                      <div className="w-full h-full bg-[url('https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=PancongLumerPaymentMock')] bg-contain bg-no-repeat bg-center"></div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-brand-brown rounded-lg flex items-center justify-center border-2 border-white shadow-md">
                        <span className="text-brand-yellow font-extrabold text-xs font-serif">P</span>
                      </div>
                    </div>

                    <span className="text-[10px] text-neutral-500 font-medium">A/N PANCONG LUMER BOOTH</span>
                  </div>

                  {/* Receipt Upload Button */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-widest">
                      Unggah Bukti Pembayaran (Wajib QRIS)
                    </label>
                    <div className="group relative border-2 border-dashed border-brand-brown/20 bg-white rounded-2xl p-4 text-center cursor-pointer hover:border-brand-brown/50 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />

                      {isReceiptUploading ? (
                        <div className="flex flex-col items-center gap-2 py-2">
                          <div className="w-8 h-8 rounded-full border-4 border-brand-yellow border-t-brand-brown animate-spin"></div>
                          <span className="text-xs text-brand-brown font-semibold">Mengunggah bukti...</span>
                        </div>
                      ) : mockReceiptName ? (
                        <div className="flex flex-col items-center gap-1.5 py-1">
                          <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center shadow-md animate-bounce">
                            <IconCheck />
                          </div>
                          <span className="text-xs font-bold text-green-600">Berhasil Diunggah!</span>
                          <span className="text-[10px] text-neutral-400 line-clamp-1 max-w-[240px]">{mockReceiptName}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 py-2">
                          <IconUpload />
                          <div className="text-xs font-bold text-neutral-600">
                            Pilih gambar atau foto struk
                          </div>
                          <p className="text-[10px] text-neutral-400">PNG, JPG up to 5MB</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Cash Description Box */}
              {paymentMethod === 'Cash' && (
                <div className="bg-amber-50/50 border border-brand-yellow/10 p-5 rounded-2xl text-center space-y-2 animate-fade-in">
                  <span className="font-bold text-xs text-brand-brown uppercase tracking-wider block">💵 Instruksi Pembayaran Tunai:</span>
                  <p className="text-xs text-neutral-600 max-w-md mx-auto leading-relaxed">
                    Pesanan Anda akan masuk ke sistem sebagai <strong className="text-brand-brown">"Menunggu Validasi"</strong>. Silakan hubungi kasir di booth dan infokan nama pembeli (<strong className="text-brand-brown">{currentOrder.customerName}</strong>) untuk melunasi pembayaran sebelum pesanan dimasak.
                  </p>
                </div>
              )}

              {/* Action payment complete */}
              <button
                onClick={handleSubmitPayment}
                className="w-full bg-brand-brown hover:bg-brand-brown/95 text-brand-yellow font-extrabold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all tracking-wider text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                {paymentMethod === 'QRIS' ? 'Selesaikan Pembayaran' : 'Proses Pesanan Ke Antrian'}
                <IconChevronRight />
              </button>
            </div>
          </div>
        )}

        {/* STATE 4: REAL-TIME QUEUE & STATUS TRACKING STATE */}
        {appState === 'tracking' && queueStatus && (
          <div className="max-w-xl mx-auto space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-brown/10 shadow-lg text-center space-y-6">

              {/* Stepper Header */}
              <div className="space-y-1">
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Pesanan Aktif
                </span>
                <h3 className="font-bold text-2xl font-serif text-brand-brown">Lacak Antrian Anda</h3>
                <p className="text-xs text-neutral-500">Mohon tunggu sementara pesanan dipersiapkan oleh koki kami</p>
              </div>

              {/* Queue Card */}
              <div className="bg-gradient-to-tr from-brand-cream/40 to-amber-50 p-6 rounded-3xl border border-brand-brown/10 relative overflow-hidden">
                <div className="absolute -top-12 -left-12 w-24 h-24 bg-brand-yellow/10 rounded-full"></div>
                <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-brand-brown/5 rounded-full"></div>

                <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-yellow block my-1">
                  NO. ANTRIAN ANDA
                </span>
                <h2 className="text-5xl font-black text-brand-brown leading-tight tracking-tight drop-shadow-sm font-serif">
                  {queueStatus.queueNumber}
                </h2>

                <div className="border-t border-brand-brown/10 mt-3 pt-3 flex justify-between text-xs text-neutral-500 font-medium max-w-[280px] mx-auto">
                  <span>Pembeli: <strong>{queueStatus.customerName}</strong></span>
                  <span>Menu: <strong>{queueStatus.orderDetails.menuItem.name}</strong></span>
                </div>
              </div>

              {/* LIVE STEPPER / PROGRESS STEPPER */}
              <div className="space-y-6 pt-4 text-left">
                <h4 className="font-bold text-xs uppercase text-neutral-400 tracking-widest border-b border-brand-brown/5 pb-2">
                  Status Pembuatan
                </h4>

                <div className="relative pl-8 space-y-8 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-neutral-200">
                  {/* Step 1 */}
                  <div className="relative">
                    <div className={`absolute -left-[27px] top-0 w-6 h-6 rounded-full flex items-center justify-center transition-all ${queueStatus.currentStep >= 1
                      ? queueStatus.currentStep === 1
                        ? 'bg-brand-yellow text-brand-brown ring-4 ring-brand-yellow/30 animate-pulse'
                        : 'bg-green-500 text-white'
                      : 'bg-neutral-200 text-neutral-400'
                      }`}>
                      {queueStatus.currentStep > 1 ? <IconCheck /> : <span className="text-[10px] font-bold">1</span>}
                    </div>
                    <div>
                      <h5 className={`font-bold text-sm leading-5 ${queueStatus.currentStep >= 1 ? 'text-brand-brown' : 'text-neutral-400'}`}>
                        Pesanan Baru / Menunggu Validasi
                      </h5>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Pesanan Anda telah diterima oleh server kami. Menunggu validasi pembayaran.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="relative">
                    <div className={`absolute -left-[27px] top-0 w-6 h-6 rounded-full flex items-center justify-center transition-all ${queueStatus.currentStep >= 2
                      ? queueStatus.currentStep === 2
                        ? 'bg-brand-yellow text-brand-brown ring-4 ring-brand-yellow/30 animate-pulse'
                        : 'bg-green-500 text-white'
                      : 'bg-neutral-200 text-neutral-400'
                      }`}>
                      {queueStatus.currentStep > 2 ? <IconCheck /> : <span className="text-[10px] font-bold">2</span>}
                    </div>
                    <div>
                      <h5 className={`font-bold text-sm leading-5 ${queueStatus.currentStep >= 2 ? 'text-brand-brown' : 'text-neutral-400'}`}>
                        Sedang Diproses
                      </h5>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Pembayaran tervalidasi. Koki sedang menyiapkan adonan lumer premium dan topping pilihan Anda.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="relative">
                    <div className={`absolute -left-[27px] top-0 w-6 h-6 rounded-full flex items-center justify-center transition-all ${queueStatus.currentStep >= 3
                      ? queueStatus.currentStep === 3
                        ? 'bg-brand-yellow text-brand-brown ring-4 ring-brand-yellow/30 animate-pulse'
                        : 'bg-green-500 text-white'
                      : 'bg-neutral-200 text-neutral-400'
                      }`}>
                      {queueStatus.currentStep > 3 ? <IconCheck /> : <span className="text-[10px] font-bold">3</span>}
                    </div>
                    <div>
                      <h5 className={`font-bold text-sm leading-5 ${queueStatus.currentStep >= 3 ? 'text-brand-brown' : 'text-neutral-400'}`}>
                        Sedang Dimasak
                      </h5>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Adonan pancong sedang dipanggang di wajan tradisional dalam tingkat kematangan ({queueStatus.orderDetails.variant}).
                      </p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="relative">
                    <div className={`absolute -left-[27px] top-0 w-6 h-6 rounded-full flex items-center justify-center transition-all ${queueStatus.currentStep === 4
                      ? 'bg-green-500 text-white ring-4 ring-green-105 shadow-md shadow-green-500/20'
                      : 'bg-neutral-200 text-neutral-400'
                      }`}>
                      {queueStatus.currentStep === 4 ? <IconCheck /> : <span className="text-[10px] font-bold">4</span>}
                    </div>
                    <div>
                      <h5 className={`font-bold text-sm leading-5 ${queueStatus.currentStep === 4 ? 'text-green-600 font-extrabold' : 'text-neutral-400'}`}>
                        Pesanan Selesai / Siap Diambil!
                      </h5>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Hore! Pancong Lumer hangat Anda siap diambil di meja penyerahan. Silakan tunjukkan layar ini ke kasir.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Back to menu button */}
              <button
                onClick={handleNewOrder}
                className="w-full mt-6 bg-brand-yellow text-brand-brown hover:bg-brand-yellow/90 font-extrabold py-3.5 px-6 rounded-2xl transition-all shadow-md cursor-pointer text-sm"
              >
                Kembali & Pesan Menu Lain
              </button>
            </div>
          </div>
        )}

      </main>

      {/* STATE 2: ORDER COMPONENT / MODAL STATE (Customization Bottom Sheet & Desktop Modal Combined) */}
      {selectedMenuItem && (
        <div className="fixed inset-0 bg-brand-charcoal/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center transition-opacity duration-300">
          <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-slide-up">

            {/* Modal Header */}
            <div className="p-5 border-b border-brand-brown/5 flex items-center justify-between bg-[#FCF9F2]">
              <div>
                <span className="text-[10px] uppercase font-bold text-brand-yellow tracking-widest">{selectedMenuItem.category === 'sweet' ? '🍩 Manis Lumer' : '🥓 Gurih Asin'}</span>
                <h3 className="font-bold text-lg font-serif text-brand-brown leading-5">{selectedMenuItem.name}</h3>
              </div>
              <button
                onClick={() => setSelectedMenuItem(null)}
                className="p-1 px-2.5 rounded-full bg-brand-brown/5 text-neutral-500 hover:bg-brand-brown/10 transition-colors text-xs font-semibold cursor-pointer"
              >
                Tutup
              </button>
            </div>

            {/* Scrollable Modal Content */}
            <div className="p-5 overflow-y-auto space-y-6 flex-1">

              {/* Product Info inside Modal */}
              <div className="flex gap-4 items-start pb-4 border-b border-brand-brown/5">
                <img
                  className="w-20 h-20 object-cover rounded-xl shadow-inner flex-none border border-brand-brown/5"
                  src={selectedMenuItem.image}
                  alt={selectedMenuItem.name}
                />
                <div className="space-y-1">
                  <p className="text-xs text-neutral-500 leading-normal">
                    {selectedMenuItem.description}
                  </p>
                  <span className="block font-extrabold text-sm text-brand-brown">
                    Rp {selectedMenuItem.price.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* 1. CUSTOM NAMA PEMBELI (Mandatory input) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-widest">
                  Nama Pembeli <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Masukkan nama Anda (misal: Annas)"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    if (e.target.value.trim()) setErrorMessage('');
                  }}
                  className="w-full p-3 rounded-xl border border-brand-brown/25 outline-none focus:border-brand-yellow font-medium text-sm transition-all focus:ring-2 focus:ring-brand-yellow/15"
                />
                {errorMessage && (
                  <p className="text-rose-500 text-xs font-semibold mt-1">⚠️ {errorMessage}</p>
                )}
              </div>

              {/* 2. VARIANT CHOICE (Matang vs Setengah Matang) */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-widest">
                  Pilih Tingkat Kematangan:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['Setengah Matang', 'Matang'] as VariantType[]).map((v) => (
                    <label
                      key={v}
                      className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${variant === v
                        ? 'border-brand-yellow bg-brand-cream/25 text-brand-brown font-bold'
                        : 'border-brand-brown/15 text-neutral-600 bg-white hover:border-brand-brown/30'
                        }`}
                    >
                      <div className="flex flex-col text-left">
                        <span className="text-xs">{v}</span>
                        <span className="text-[9px] text-neutral-400 font-normal">
                          {v === 'Setengah Matang' ? 'Sangat lumer, basah lumer' : 'Matang empuk renyah'}
                        </span>
                      </div>
                      <input
                        type="radio"
                        name="variantSelector"
                        checked={variant === v}
                        onChange={() => setVariant(v)}
                        className="w-4 h-4 text-brand-yellow border-neutral-300 focus:ring-brand-yellow cursor-pointer"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* 3. EXTRA TOPPING CHECKBOXES */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-widest">
                  Tambahan Topping:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {MOCK_TOPPING_OPTIONS.map((topping) => {
                    const isSelected = selectedToppings.some((t) => t.id === topping.id);
                    return (
                      <label
                        key={topping.id}
                        onClick={() => handleToggleTopping(topping)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-[border-color,background-color] ${isSelected
                          ? 'border-brand-yellow bg-brand-cream/25 font-bold text-brand-brown'
                          : 'border-brand-brown/10 text-neutral-600 hover:border-brand-brown/30 bg-white'
                          }`}
                      >
                        <div className="flex flex-col text-left">
                          <span className="text-xs">{topping.name}</span>
                          <span className="text-[10px] text-neutral-400 font-normal">
                            + Rp {topping.price.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          className="w-4 h-4 text-brand-yellow border-neutral-300 rounded focus:ring-brand-yellow cursor-pointer"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 4. CATATAN TAMBAHAN (Textarea) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-widest">
                  Catatan Tambahan:
                </label>
                <textarea
                  rows={2}
                  maxLength={150}
                  placeholder="Contoh: Susu kental manis dipisah, atau hilangkan kacang"
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  className="w-full p-3 rounded-xl border border-brand-brown/25 outline-none focus:border-brand-yellow font-medium text-xs resize-none focus:ring-2 focus:ring-brand-yellow/15"
                />
              </div>

              {/* 5. QUANTITY COUNTER */}
              <div className="flex items-center justify-between p-3.5 bg-neutral-50 rounded-2xl border border-brand-brown/5">
                <div className="flex flex-col">
                  <span className="block text-xs font-bold text-neutral-600 uppercase tracking-wider">Jumlah Pesanan</span>
                  <span className="text-[10px] text-neutral-400 font-medium">Bisa pesan lebih dari satu porsi</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    disabled={quantity <= 1}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${quantity <= 1
                      ? 'border-neutral-200 text-neutral-300 cursor-not-allowed bg-neutral-100'
                      : 'border-brand-brown/20 text-brand-brown hover:bg-neutral-100 hover:scale-105 active:scale-95'
                      }`}
                  >
                    <IconMinus />
                  </button>
                  <span className="font-extrabold text-neutral-800 text-base w-6 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center border border-brand-brown/20 text-brand-brown hover:bg-neutral-100 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    <IconPlus />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer / Live Calculation Subtotal */}
            <div className="p-5 border-t border-brand-brown/5 bg-[#FCF9F2] flex items-center justify-between gap-4">
              <div className="text-left">
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Subtotal</span>
                <span className="font-extrabold text-lg text-brand-brown leading-tight">
                  Rp {currentSubtotal.toLocaleString('id-ID')}
                </span>
              </div>

              <button
                onClick={handleProceedToPayment}
                className="flex-1 bg-brand-brown hover:bg-[#5E2606] text-white font-extrabold py-3.5 px-4 rounded-xl text-center shadow-md hover:shadow-lg transition-all text-xs tracking-wider cursor-pointer flex items-center justify-center gap-2"
              >
                Lanjut ke Pembayaran <IconChevronRight />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-brand-charcoal text-amber-50/50 py-8 border-t border-brand-brown/20 mt-12 text-center text-xs space-y-3">
        <p className="font-bold text-brand-yellow font-serif text-sm">Pancong Lumer UMKM</p>
        <p>© 2026 Pancong Lumer Booth. All Rights Reserved. Made for Freshly Baked Culinary.</p>
        <p className="text-[10px] text-amber-100/30">Client ordering system is responsive and support mobile-first booth orders.</p>
      </footer>
    </div>
  );
}
