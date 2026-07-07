'use client';

import React, { useState, useMemo } from 'react';
import { MOCK_MENU_ITEMS } from '../../data/mockData';
import { MenuItem, VariantType, ToppingOption } from '../../types';

// Structured interface for Admin Orders
interface AdminOrder {
    id: string;
    queueNumber: string;
    customerName: string;
    itemName: string;
    quantity: number;
    variant: VariantType;
    toppings: string[];
    notes: string;
    subtotal: number;
    status: 'baru' | 'dimasak' | 'selesai';
    time: string;
}

// Initial Mock Orders on Penjual / Vendor Dashboard
const INITIAL_ADMIN_ORDERS: AdminOrder[] = [
    {
        id: 'ord1',
        queueNumber: '#A-024',
        customerName: 'Annas Dzaki Pratama',
        itemName: 'Pancong Choco Lava Premium',
        quantity: 2,
        variant: 'Setengah Matang',
        toppings: ['Keju Kraft Cheddar Parut', 'Meses Cokelat Classic'],
        notes: 'Susu kental manis cokelat tolong dibanyakin di bagian pinggir',
        subtotal: 40000,
        status: 'baru',
        time: '16:40',
    },
    {
        id: 'ord2',
        queueNumber: '#A-023',
        customerName: 'Siti Rahma',
        itemName: 'Pancong Cheese Melt Special',
        quantity: 1,
        variant: 'Matang',
        toppings: ['Susu Kental Manis Premium'],
        notes: '',
        subtotal: 17500,
        status: 'dimasak',
        time: '16:32',
    },
    {
        id: 'ord3',
        queueNumber: '#A-022',
        customerName: 'Rian Hidayat',
        itemName: 'Pancong Tiramisu Almond Crunchy',
        quantity: 1,
        variant: 'Setengah Matang',
        toppings: [],
        notes: 'Jangan terlalu basah ya koki',
        subtotal: 17500,
        status: 'selesai',
        time: '16:15',
    },
    {
        id: 'ord4',
        queueNumber: '#A-021',
        customerName: 'Budi Santoso',
        itemName: 'Pancong Classic Original Susu',
        quantity: 3,
        variant: 'Matang',
        toppings: ['Keju Kraft Cheddar Parut'],
        notes: 'Manis sedang',
        subtotal: 45000,
        status: 'selesai',
        time: '15:58',
    },
];

export default function AdminDashboardPage() {
    // State 1: Login authenticate
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');

    // Sidebar collapse mobile drawer
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // State 2: Active Tab ('orders' | 'menu' | 'reports')
    const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'reports'>('orders');

    // Kanban status switcher on mobile ('baru' | 'dimasak' | 'selesai')
    const [mobileKanbanTab, setMobileKanbanTab] = useState<'baru' | 'dimasak' | 'selesai'>('baru');

    // Orders State
    const [orders, setOrders] = useState<AdminOrder[]>(INITIAL_ADMIN_ORDERS);

    // Menu items list state (for adding and updating)
    const [menuItems, setMenuItems] = useState<MenuItem[]>(MOCK_MENU_ITEMS);
    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

    // Add Menu Form state
    const [newMenuName, setNewMenuName] = useState('');
    const [newMenuPrice, setNewMenuPrice] = useState('');
    const [newMenuCategory, setNewMenuCategory] = useState<'sweet' | 'savory'>('sweet');
    const [newMenuDescription, setNewMenuDescription] = useState('');
    const [newMenuImage, setNewMenuImage] = useState('');
    const [formError, setFormError] = useState('');

    // Handle Login Check (mocked bypass)
    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (username.trim() === 'admin' && password === 'pancong123') {
            setIsLoggedIn(true);
            setLoginError('');
        } else {
            setLoginError('Username atau password salah. Coba username "admin" & password "pancong123".');
        }
    };

    // Switch Order Status in Pipeline
    const handleMoveOrder = (orderId: string, nextStatus: 'baru' | 'dimasak' | 'selesai' | 'delete') => {
        if (nextStatus === 'delete') {
            if (confirm('Apakah Anda yakin ingin menghapus pesanan ini dari antrian?')) {
                setOrders((prev) => prev.filter((o) => o.id !== orderId));
            }
        } else {
            setOrders((prev) =>
                prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
            );
        }
    };

    // Toggle Menu item stock status ("Tersedia" <=> "Habis")
    const handleToggleMenuAvailability = (menuId: string) => {
        setMenuItems((prev) =>
            prev.map((item) =>
                item.id === menuId ? { ...item, isAvailable: !item.isAvailable } : item
            )
        );
    };

    // Delete product from store
    const handleDeleteProduct = (menuId: string) => {
        if (confirm('Apakah Anda yakin ingin menghapus produk ini dari katalog menu?')) {
            setMenuItems((prev) => prev.filter((item) => item.id !== menuId));
        }
    };

    // Handle Add New Product Form submission
    const handleAddProductSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMenuName.trim() || !newMenuPrice.trim()) {
            setFormError('Nama menu dan Harga wajib diisi.');
            return;
        }

        const priceNum = parseInt(newMenuPrice.replace(/\D/g, ''));
        if (isNaN(priceNum) || priceNum <= 0) {
            setFormError('Harga harus berupa angka positif.');
            return;
        }

        const defaultImg = newMenuCategory === 'sweet'
            ? 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500' // default sweet photo
            : 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500'; // default savory smoke beef photo

        const newItem: MenuItem = {
            id: `m-${Date.now()}`,
            name: newMenuName,
            price: priceNum,
            description: newMenuDescription || 'Deskripsi lumerian lezat buatan koki stan.',
            category: newMenuCategory,
            image: newMenuImage.trim() || defaultImg,
            isAvailable: true,
        };

        setMenuItems((prev) => [newItem, ...prev]);

        // Reset Form fields
        setNewMenuName('');
        setNewMenuPrice('');
        setNewMenuCategory('sweet');
        setNewMenuDescription('');
        setNewMenuImage('');
        setFormError('');
        setIsAddMenuOpen(false);
    };

    // Financial Sales Statistics Calculators (Tab 4)
    const salesStats = useMemo(() => {
        const completedOrders = orders.filter((o) => o.status === 'selesai');
        const cookingOrders = orders.filter((o) => o.status === 'dimasak');
        const newOrders = orders.filter((o) => o.status === 'baru');

        const totalRevenue = completedOrders.reduce((sum, o) => sum + o.subtotal, 0);
        const averageOrderValue = completedOrders.length > 0 ? Math.round(totalRevenue / completedOrders.length) : 0;

        return {
            revenue: totalRevenue,
            completedCount: completedOrders.length,
            cookingCount: cookingOrders.length,
            pendingCount: newOrders.length,
            avgValue: averageOrderValue,
        };
    }, [orders]);

    // LOGIN SCREEN (Authentication State 1)
    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-brand-charcoal flex items-center justify-center p-4">
                {/* Decorative background elements */}
                <div className="absolute top-10 left-10 w-24 h-24 bg-brand-yellow/10 rounded-full blur-xl"></div>
                <div className="absolute bottom-10 right-10 w-36 h-36 bg-brand-cream/5 rounded-full blur-xl"></div>

                <div className="w-full max-w-md bg-[#FCF9F2] rounded-3xl overflow-hidden shadow-2xl border border-brand-yellow/20 p-8 space-y-8 relative">

                    {/* Logo Header */}
                    <div className="text-center space-y-2">
                        <div className="w-14 h-14 bg-brand-yellow rounded-2xl mx-auto flex items-center justify-center shadow-lg rotate-6 hover:rotate-12 transition-transform">
                            <span className="text-brand-brown font-black text-2xl font-serif">P</span>
                        </div>
                        <h1 className="text-2xl font-extrabold text-brand-brown font-serif tracking-tight mt-3">
                            Dashboard Booth Vendor
                        </h1>
                        <p className="text-xs text-neutral-500 font-medium">
                            Pancong Lumer Booth Management System Portal
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLoginSubmit} className="space-y-5">
                        {loginError && (
                            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold">
                                ⚠️ {loginError}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-bold text-neutral-700 uppercase tracking-widest">
                                Username Penjual
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="Ex: admin"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full p-3.5 rounded-xl border border-brand-brown/20 bg-white font-medium text-sm outline-none focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/10"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-bold text-neutral-700 uppercase tracking-widest">
                                Password
                            </label>
                            <input
                                type="password"
                                required
                                placeholder="Ex: pancong123"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3.5 rounded-xl border border-brand-brown/20 bg-white font-medium text-sm outline-none focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/10"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-brand-brown hover:bg-brand-brown/90 text-brand-yellow font-extrabold py-4 px-6 rounded-xl hover:shadow-lg transition-all text-sm tracking-widest cursor-pointer"
                        >
                            MASUK DASHBOARD
                        </button>
                    </form>

                    {/* Helper credentials hint */}
                    <div className="bg-amber-50 rounded-xl p-3 border border-brand-yellow/20 text-center">
                        <span className="text-[9px] font-bold text-emerald-800 uppercase tracking-wider block">🔑 Dummy Access Credentials:</span>
                        <p className="text-[10px] text-neutral-600 mt-0.5">
                            User: <strong className="text-brand-brown font-mono">admin</strong> &nbsp;|&nbsp; Pass: <strong className="text-brand-brown font-mono">pancong123</strong>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // HEADER / WORKSPACE WRAPPER (After Login)
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row antialiased">

            {/* SIDEBAR NAVIGATION PANEL (Fixed on Desktop, collapsing drawer overlay on Mobile) */}
            <aside className={`fixed md:sticky top-0 bottom-0 left-0 z-40 bg-brand-charcoal text-white w-64 p-5 flex flex-col justify-between transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                } h-screen`}>

                <div className="space-y-8">
                    {/* Logo & Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 bg-brand-yellow rounded-xl flex items-center justify-center shadow-md rotate-3">
                                <span className="text-brand-brown font-extrabold text-lg font-serif">P</span>
                            </div>
                            <div>
                                <h2 className="text-sm font-bold font-serif text-white tracking-tight leading-4">Pancong Lumer</h2>
                                <span className="text-[9px] uppercase tracking-wider text-brand-yellow font-bold">Admin Vendor</span>
                            </div>
                        </div>
                        {/* Collapse Close Button on mobile */}
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="md:hidden p-1 rounded-lg text-neutral-400 hover:text-white"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Nav Items */}
                    <nav className="flex flex-col gap-2">
                        {[
                            { id: 'orders', label: '📥 Pesanan Masuk', desc: 'Kelola order pipeline' },
                            { id: 'menu', label: '🍕 Kelola Menu', desc: 'Produk & inventaris stok' },
                            { id: 'reports', label: '📊 Laporan Penjualan', desc: 'Stat ringkasan finansial' },
                        ].map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveTab(tab.id as any);
                                        setIsSidebarOpen(false);
                                    }}
                                    className={`w-full text-left p-3.5 rounded-xl cursor-pointer transition-all flex items-center justify-between border ${isActive
                                            ? 'bg-brand-yellow text-brand-brown border-brand-yellow font-semibold shadow-md shadow-brand-yellow/10'
                                            : 'border-transparent text-neutral-300 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <div>
                                        <span className="text-xs uppercase tracking-wide">{tab.label}</span>
                                        <span className={`block text-[9px] font-normal ${isActive ? 'text-brand-brown/70' : 'text-neutral-500'}`}>
                                            {tab.desc}
                                        </span>
                                    </div>
                                    {isActive && <div className="w-1.5 h-1.5 bg-brand-brown rounded-full"></div>}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* User Logged In Profile Card & Logout */}
                <div className="space-y-4 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-yellow/20 flex items-center justify-center text-xs font-bold text-white border border-brand-yellow/30">
                            AD
                        </div>
                        <div>
                            <p className="text-xs font-bold text-neutral-200">Annas Dzaki</p>
                            <span className="text-[9px] text-[#F59E0B] font-semibold">Role: Administrator</span>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            if (confirm('Apakah Anda yakin ingin keluar dari antarmuka admin?')) {
                                setIsLoggedIn(false);
                            }
                        }}
                        className="w-full py-2 px-3 border border-red-500/23 hover:bg-rose-950 text-white rounded-lg text-xs font-bold transition-all text-center cursor-pointer"
                    >
                        ❌ Keluar Portal
                    </button>
                </div>
            </aside>

            {/* MOBILE HEADER BAR (Hamburger trigger banner) */}
            <div className="md:hidden sticky top-0 bg-brand-charcoal text-white h-16 px-4 flex items-center justify-between z-30 shadow-md">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 rounded-lg text-neutral-300 hover:text-white"
                    >
                        {/* Hamburger icon */}
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    <div>
                        <h2 className="text-sm font-bold font-serif text-white tracking-tight">Pancong Lumer</h2>
                        <span className="text-[9px] uppercase tracking-wider text-brand-yellow font-bold">Admin Portal</span>
                    </div>
                </div>

                {/* Tab state indicator on mobile header */}
                <div className="text-xs font-bold text-brand-yellow capitalize bg-white/5 py-1 px-2.5 rounded-lg border border-white/10">
                    {activeTab === 'orders' ? 'Pesanan' : activeTab === 'menu' ? 'Menu' : 'Laporan'}
                </div>
            </div>

            {/* BACKGROUND DRAWER BACKDROP FOR MOBILE */}
            {isSidebarOpen && (
                <div
                    onClick={() => setIsSidebarOpen(false)}
                    className="md:hidden fixed inset-0 bg-black/60 z-35 backdrop-blur-sm"
                />
            )}

            {/* MAIN CONTENT PORT (Scrollable container Area) */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="hidden md:flex bg-white h-16 border-b border-neutral-200 items-center justify-between px-8 shadow-sm">
                    <div>
                        <h3 className="font-bold text-lg text-neutral-800 capitalize font-serif">
                            {activeTab === 'orders' ? 'Order Pipeline Antrian' : activeTab === 'menu' ? 'Katalog & Jumlah Stok' : 'Laporan Ringkasan Penjualan'}
                        </h3>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-xs text-neutral-500 font-medium">Hari ini: <strong>06 Juli 2026</strong></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-xs font-bold text-emerald-600">Online & Sinkron</span>
                    </div>
                </header>

                {/* WORKING AREA */}
                <div className="flex-1 p-4 md:p-8 overflow-y-auto">

                    {/* TAB STATE 2: DASHBOARD - PESANAN MASUK */}
                    {activeTab === 'orders' && (
                        <div className="space-y-6">

                            {/* MOBILE PIPELINE TAB SWITCHER (For mobile layout swap) */}
                            <div className="md:hidden flex gap-1.5 p-1 bg-neutral-200/60 rounded-2xl border border-neutral-35 mb-4">
                                {(['baru', 'dimasak', 'selesai'] as const).map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setMobileKanbanTab(status)}
                                        className={`flex-1 py-3 text-center text-xs font-extrabold rounded-xl capitalize transition-all cursor-pointer ${mobileKanbanTab === status
                                                ? 'bg-brand-brown text-white shadow-md'
                                                : 'text-neutral-600 hover:bg-white/10'
                                            }`}
                                    >
                                        {status === 'baru' ? 'Pesanan Baru' : status === 'dimasak' ? 'Sedang Dimasak' : 'Siap Diambil'}
                                        <span className="ml-1 text-[9px] bg-white/20 px-1.5 py-0.5 rounded-full text-white">
                                            {orders.filter((o) => o.status === status).length}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {/* KANBAN BOARD SYSTEM: Desktop (3 columns side by side) / Mobile (filtered vertical stack) */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                                {/* COLUMN 1: PESANAN BARU (Shown on desktop OR when mobileKanbanTab is 'baru') */}
                                <div className={`space-y-4 ${mobileKanbanTab === 'baru' ? 'block' : 'hidden md:block'
                                    }`}>
                                    <div className="bg-[#EBF5FF] border border-blue-100 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                                        <span className="font-extrabold text-[#1E40AF] text-xs uppercase tracking-wider">
                                            🔵 Pesanan Baru / Validasi
                                        </span>
                                        <span className="bg-[#1E40AF] text-white text-xs font-black px-2.5 py-1 rounded-full drop-shadow-sm">
                                            {orders.filter((o) => o.status === 'baru').length}
                                        </span>
                                    </div>

                                    <div className="space-y-3.5 max-h-[70vh] overflow-y-auto pr-1">
                                        {orders.filter((o) => o.status === 'baru').map((order) => (
                                            <div key={order.id} className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-100 hover:shadow-md transition-shadow relative overflow-hidden">
                                                {/* Orange top edge highlight */}
                                                <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500"></div>

                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-base font-black text-brand-brown font-serif bg-brand-cream/60 px-2 py-0.5 rounded-lg">{order.queueNumber}</span>
                                                    <span className="text-[10px] text-neutral-400 font-medium">Jam: {order.time}</span>
                                                </div>

                                                <div className="space-y-2">
                                                    <div>
                                                        <span className="text-[10px] text-neutral-500 font-bold block">NAMA PEMBELI:</span>
                                                        <span className="text-sm font-bold text-neutral-800 block">{order.customerName}</span>
                                                    </div>

                                                    <div>
                                                        <div className="flex items-center justify-between text-xs font-semibold text-brand-charcoal">
                                                            <span>{order.itemName} ({order.variant})</span>
                                                            <span className="bg-brand-cream/80 text-brand-brown px-1.5 py-0.5 rounded text-[10px] font-bold">x{order.quantity}</span>
                                                        </div>

                                                        {/* Toppings list */}
                                                        {order.toppings.length > 0 && (
                                                            <p className="text-[10px] text-neutral-500 mt-1 italic pl-1 leading-relaxed">
                                                                + toppings: {order.toppings.join(', ')}
                                                            </p>
                                                        )}

                                                        {/* Additional notes */}
                                                        {order.notes && (
                                                            <p className="text-[10px] bg-rose-50 border border-rose-100 rounded-lg p-2 mt-2 text-rose-600 font-medium italic">
                                                                "Catatan: {order.notes}"
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="border-t border-neutral-100 pt-3 mt-3 flex items-center justify-between gap-2.5">
                                                    <button
                                                        onClick={() => handleMoveOrder(order.id, 'delete')}
                                                        className="p-2 border border-red-200 hover:bg-rose-50 text-rose-500 rounded-xl transition-colors cursor-pointer text-xs"
                                                    >
                                                        Tolak
                                                    </button>
                                                    <button
                                                        onClick={() => handleMoveOrder(order.id, 'dimasak')}
                                                        className="flex-1 bg-brand-yellow hover:bg-brand-yellow/90 text-brand-brown font-bold text-xs py-2 px-3 rounded-xl transition-colors cursor-pointer text-center"
                                                    >
                                                        Proses Masak 🍳
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {orders.filter((o) => o.status === 'baru').length === 0 && (
                                            <div className="text-center py-10 bg-white/40 border-2 border-dashed border-neutral-200 rounded-2xl">
                                                <span className="text-xs text-neutral-400">Tidak ada pesanan baru</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* COLUMN 2: SEDANG DIMASAK (Shown on desktop OR when mobileKanbanTab is 'dimasak') */}
                                <div className={`space-y-4 ${mobileKanbanTab === 'dimasak' ? 'block' : 'hidden md:block'
                                    }`}>
                                    <div className="bg-[#FFF8E6] border border-amber-100 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                                        <span className="font-extrabold text-[#D97706] text-xs uppercase tracking-wider">
                                            🍳 Sedang Dipanggang
                                        </span>
                                        <span className="bg-[#D97706] text-white text-xs font-black px-2.5 py-1 rounded-full drop-shadow-sm">
                                            {orders.filter((o) => o.status === 'dimasak').length}
                                        </span>
                                    </div>

                                    <div className="space-y-3.5 max-h-[70vh] overflow-y-auto pr-1">
                                        {orders.filter((o) => o.status === 'dimasak').map((order) => (
                                            <div key={order.id} className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-100 hover:shadow-md transition-shadow relative overflow-hidden">
                                                <div className="absolute top-0 left-0 right-0 h-1 bg-yellow-500"></div>

                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-base font-black text-brand-brown font-serif bg-brand-cream/60 px-2 py-0.5 rounded-lg">{order.queueNumber}</span>
                                                    <span className="text-[10px] text-neutral-400 font-medium">Jam: {order.time}</span>
                                                </div>

                                                <div className="space-y-2">
                                                    <div>
                                                        <span className="text-[10px] text-neutral-500 font-bold block">NAMA PEMBELI:</span>
                                                        <span className="text-sm font-bold text-neutral-800 block">{order.customerName}</span>
                                                    </div>

                                                    <div>
                                                        <div className="flex items-center justify-between text-xs font-semibold text-brand-charcoal">
                                                            <span>{order.itemName} ({order.variant})</span>
                                                            <span className="bg-brand-cream/80 text-brand-brown px-1.5 py-0.5 rounded text-[10px] font-bold">x{order.quantity}</span>
                                                        </div>

                                                        {order.toppings.length > 0 && (
                                                            <p className="text-[10px] text-neutral-500 mt-1 italic pl-1 leading-relaxed">
                                                                + toppings: {order.toppings.join(', ')}
                                                            </p>
                                                        )}

                                                        {order.notes && (
                                                            <p className="text-[10px] bg-rose-50 border border-rose-100 rounded-lg p-2 mt-2 text-rose-600 font-medium italic">
                                                                "Catatan: {order.notes}"
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="border-t border-neutral-100 pt-3 mt-3 flex items-center justify-between gap-2.5">
                                                    <button
                                                        onClick={() => handleMoveOrder(order.id, 'baru')}
                                                        className="p-2 border border-neutral-35 hover:bg-neutral-100 text-neutral-500 rounded-xl transition-colors cursor-pointer text-xs"
                                                    >
                                                        Kembalikan
                                                    </button>
                                                    <button
                                                        onClick={() => handleMoveOrder(order.id, 'selesai')}
                                                        className="flex-1 bg-brand-brown hover:bg-brand-brown/90 text-brand-yellow font-bold text-xs py-2 px-3 rounded-xl transition-colors cursor-pointer text-center"
                                                    >
                                                        Siap Diambil ✅
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {orders.filter((o) => o.status === 'dimasak').length === 0 && (
                                            <div className="text-center py-10 bg-white/40 border-2 border-dashed border-neutral-200 rounded-2xl">
                                                <span className="text-xs text-neutral-400">Tidak ada pesanan dimasak</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* COLUMN 3: SIAP DIAMPIL / SELESAI (Shown on desktop OR when mobileKanbanTab is 'selesai') */}
                                <div className={`space-y-4 ${mobileKanbanTab === 'selesai' ? 'block' : 'hidden md:block'
                                    }`}>
                                    <div className="bg-[#EAFDF3] border border-emerald-100 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                                        <span className="font-extrabold text-[#059669] text-xs uppercase tracking-wider">
                                            🟢 Siap Diambil / Selesai
                                        </span>
                                        <span className="bg-[#059669] text-white text-xs font-black px-2.5 py-1 rounded-full drop-shadow-sm">
                                            {orders.filter((o) => o.status === 'selesai').length}
                                        </span>
                                    </div>

                                    <div className="space-y-3.5 max-h-[70vh] overflow-y-auto pr-1">
                                        {orders.filter((o) => o.status === 'selesai').map((order) => (
                                            <div key={order.id} className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-100 hover:shadow-md transition-shadow relative overflow-hidden">
                                                <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500"></div>

                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-base font-black text-[#059669] font-serif bg-emerald-50 px-2 py-0.5 rounded-lg">{order.queueNumber}</span>
                                                    <span className="text-[10px] text-neutral-400 font-medium">Jam selesai: {order.time}</span>
                                                </div>

                                                <div className="space-y-2">
                                                    <div>
                                                        <span className="text-[10px] text-neutral-500 font-bold block">NAMA PEMBELI:</span>
                                                        <span className="text-sm font-bold text-neutral-800 block text-neutral-500 line-through">{order.customerName}</span>
                                                    </div>

                                                    <div>
                                                        <div className="flex items-center justify-between text-xs font-semibold text-neutral-500">
                                                            <span>{order.itemName} ({order.variant})</span>
                                                            <span className="bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded text-[10px] font-bold">x{order.quantity}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="border-t border-neutral-100 pt-3 mt-3 flex items-center justify-between gap-2.5">
                                                    <button
                                                        onClick={() => handleMoveOrder(order.id, 'dimasak')}
                                                        className="flex-1 hover:bg-neutral-100 text-neutral-500 border border-neutral-200 font-bold text-xs py-2 px-3 rounded-xl transition-colors cursor-pointer text-center"
                                                    >
                                                        Masak Kembali
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {orders.filter((o) => o.status === 'selesai').length === 0 && (
                                            <div className="text-center py-10 bg-white/40 border-2 border-dashed border-neutral-200 rounded-2xl">
                                                <span className="text-xs text-neutral-400">Tidak ada pesanan selesai</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </div>
                        </div>
                    )}

                    {/* TAB STATE 3: KELOLA MENU (Product & Stock Catalog Management) */}
                    {activeTab === 'menu' && (
                        <div className="space-y-6">

                            {/* Custom Tool bar list actions */}
                            <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
                                <div>
                                    <h4 className="font-bold text-lg text-brand-brown font-serif">Katalog Produk Pancong</h4>
                                    <p className="text-xs text-neutral-500">Total {menuItems.length} menu terdaftar di etalase penjualan</p>
                                </div>

                                <button
                                    onClick={() => setIsAddMenuOpen(true)}
                                    className="bg-brand-brown hover:bg-brand-brown/90 text-brand-yellow font-extrabold text-xs py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-transform cursor-pointer flex items-center gap-1.5"
                                >
                                    ➕ Tambah Menu Baru
                                </button>
                            </div>

                            {/* TABLE CONTAINER: Desktop (Grid Table) / Mobile (Swaps to Compact cards) */}
                            {/* Desktop view table */}
                            <div className="hidden md:block bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#FCF9F2] border-b border-neutral-200 text-xs font-bold text-neutral-600 uppercase tracking-widest">
                                            <th className="px-6 py-4 w-12">No</th>
                                            <th className="px-6 py-4 w-16">Foto</th>
                                            <th className="px-6 py-4">Nama Menu</th>
                                            <th className="px-6 py-4">Kategori</th>
                                            <th className="px-6 py-4">Harga Dasar</th>
                                            <th className="px-6 py-4 w-32">Status Stok</th>
                                            <th className="px-6 py-4 text-center w-28">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100 text-slate-700 text-sm">
                                        {menuItems.map((item, idx) => (
                                            <tr key={item.id} className="hover:bg-neutral-50/50 transition-colors">
                                                <td className="px-6 py-4 font-bold text-neutral-400">{idx + 1}</td>
                                                <td className="px-6 py-4">
                                                    <img
                                                        src={item.image}
                                                        alt=""
                                                        className="w-12 h-12 object-cover rounded-xl shadow-inner border border-brand-brown/5"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-brand-charcoal">{item.name}</div>
                                                    <p className="text-[11px] text-neutral-400 line-clamp-1 max-w-sm mt-0.5">{item.description}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.category === 'sweet'
                                                            ? 'bg-amber-100 text-brand-brown'
                                                            : 'bg-stone-100 text-neutral-600'
                                                        }`}>
                                                        {item.category === 'sweet' ? 'Sweet' : 'Savory'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-bold text-brand-brown">
                                                    Rp {item.price.toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={item.isAvailable}
                                                            onChange={() => handleToggleMenuAvailability(item.id)}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                                                        <span className={`ml-2 text-xs font-bold ${item.isAvailable ? 'text-emerald-600' : 'text-rose-500'}`}>
                                                            {item.isAvailable ? 'Tersedia' : 'Habis'}
                                                        </span>
                                                    </label>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => handleDeleteProduct(item.id)}
                                                        className="text-xs font-bold text-red-500 hover:text-red-700 hover:underline cursor-pointer"
                                                    >
                                                        Hapus
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile view catalog cards */}
                            <div className="md:hidden space-y-4">
                                {menuItems.map((item, idx) => (
                                    <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-100 flex gap-4 items-start">
                                        <img
                                            src={item.image}
                                            alt=""
                                            className="w-16 h-16 object-cover rounded-xl border border-brand-brown/5 flex-none"
                                        />

                                        <div className="flex-1 space-y-3 min-w-0">
                                            <div>
                                                <div className="flex justify-between items-start gap-1">
                                                    <h5 className="font-bold text-brand-charcoal text-sm font-serif line-clamp-1">{item.name}</h5>
                                                    <span className="text-[10px] text-neutral-400 font-bold block">#{idx + 1}</span>
                                                </div>
                                                <span className="text-[10px] font-bold text-brand-yellow uppercase tracking-widest mt-0.5 inline-block">
                                                    {item.category === 'sweet' ? '🍩 Sweet' : '🥓 Savory'}
                                                </span>

                                                <p className="text-xs font-bold text-brand-brown mt-1">Rp {item.price.toLocaleString('id-ID')}</p>
                                            </div>

                                            {/* Stock Toggle & actions */}
                                            <div className="flex items-center justify-between border-t border-neutral-50 pt-2.5 mt-2">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={item.isAvailable}
                                                        onChange={() => handleToggleMenuAvailability(item.id)}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-8 h-4 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
                                                    <span className={`ml-2 text-[10px] font-bold ${item.isAvailable ? 'text-emerald-600' : 'text-rose-500'}`}>
                                                        {item.isAvailable ? 'Tersedia' : 'Habis'}
                                                    </span>
                                                </label>

                                                <button
                                                    onClick={() => handleDeleteProduct(item.id)}
                                                    className="text-[11px] font-bold text-red-500 hover:text-red-700 cursor-pointer"
                                                >
                                                    Hapus Menu
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </div>
                    )}

                    {/* TAB STATE 4: LAPORAN PENJUALAN (Sales Summary Reports) */}
                    {activeTab === 'reports' && (
                        <div className="space-y-6">

                            {/* Stat Cards - Horizontal on desktop, stacked vertically on mobile */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Total Revenue */}
                                <div className="bg-white rounded-2xl p-5 border border-neutral-100 shadow-sm flex items-center justify-between">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Total Omset Penjualan</span>
                                        <h3 className="text-xl font-extrabold text-neutral-800 font-serif">
                                            Rp {salesStats.revenue.toLocaleString('id-ID')}
                                        </h3>
                                        <p className="text-[10px] text-emerald-600 font-semibold">📈 Dari {salesStats.completedCount} pesanan selesai</p>
                                    </div>
                                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold text-lg shadow-inner">
                                        💰
                                    </div>
                                </div>

                                {/* Complete Orders */}
                                <div className="bg-white rounded-2xl p-5 border border-neutral-100 shadow-sm flex items-center justify-between">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Pesanan Sukses</span>
                                        <h3 className="text-xl font-extrabold text-neutral-800 font-serif">
                                            {salesStats.completedCount} Porsi
                                        </h3>
                                        <p className="text-[10px] text-neutral-500">Antrian berhasil disajikan hangat</p>
                                    </div>
                                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold text-lg shadow-inner">
                                        📦
                                    </div>
                                </div>

                                {/* Net cooking stack */}
                                <div className="bg-white rounded-2xl p-5 border border-neutral-100 shadow-sm flex items-center justify-between">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Sedang Dimasak / Antre</span>
                                        <h3 className="text-xl font-extrabold text-neutral-800 font-serif">
                                            {salesStats.cookingCount + salesStats.pendingCount} Order
                                        </h3>
                                        <p className="text-[10px] text-amber-600 font-semibold">{salesStats.pendingCount} Menunggu Validasi</p>
                                    </div>
                                    <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-bold text-lg shadow-inner">
                                        🍳
                                    </div>
                                </div>

                                {/* Average order value */}
                                <div className="bg-white rounded-2xl p-5 border border-neutral-100 shadow-sm flex items-center justify-between">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Rata-rata Keranjang</span>
                                        <h3 className="text-xl font-extrabold text-neutral-800 font-serif">
                                            Rp {salesStats.avgValue.toLocaleString('id-ID')}
                                        </h3>
                                        <p className="text-[10px] text-purple-650 font-semibold">Tingkat belanja per antrian</p>
                                    </div>
                                    <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center font-bold text-lg shadow-inner">
                                        🛒
                                    </div>
                                </div>
                            </div>

                            {/* Graphical Overview & Mock Charts */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                                {/* 1. Bar Chart Mock */}
                                <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm space-y-6">
                                    <div>
                                        <h5 className="font-bold text-sm text-neutral-800 font-serif">Grafik Penjualan Per Jam (Hari Ini)</h5>
                                        <p className="text-[11px] text-neutral-400">Menampilkan pola kepadatan antrian booth lumer</p>
                                    </div>

                                    <div className="h-64 flex items-end justify-between gap-4 pt-6 border-b border-l border-neutral-100 pl-4 pb-1 relative">
                                        {/* Simulated bars */}
                                        {[
                                            { label: '10:00', val: '25%', count: 4 },
                                            { label: '12:00', val: '65%', count: 12 },
                                            { label: '14:00', val: '40%', count: 8 },
                                            { label: '16:00', val: '85%', count: 18 },
                                            { label: '18:00', val: '100%', count: 24 },
                                            { label: '20:00', val: '75%', count: 15 },
                                            { label: '22:00', val: '30%', count: 5 }
                                        ].map((bar, i) => (
                                            <div key={i} className="flex-1 flex flex-col items-center group relative cursor-pointer">
                                                {/* Hover count details prompt */}
                                                <div className="absolute -top-10 scale-0 group-hover:scale-100 bg-brand-charcoal text-white text-[10px] font-bold py-1 px-2.5 rounded-lg transition-transform duration-200 shadow-md">
                                                    {bar.count} Order
                                                </div>
                                                <div
                                                    style={{ height: bar.val }}
                                                    className="w-full bg-brand-yellow hover:bg-brand-brown rounded-t-lg transition-all shadow-inner"
                                                />
                                                <span className="text-[10px] text-neutral-400 mt-2 font-medium">{bar.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 2. Top Best-Sellers list */}
                                <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm space-y-4">
                                    <div>
                                        <h5 className="font-bold text-sm text-neutral-800 font-serif">Menu Paling Populer</h5>
                                        <p className="text-[11px] text-neutral-400">Item paling laris dipesan pelanggan hari ini</p>
                                    </div>

                                    <div className="space-y-3.5 pt-2">
                                        {[
                                            { name: 'Pancong Choco Lava Premium', count: 18, share: '38%', color: 'from-amber-400 to-amber-600' },
                                            { name: 'Pancong Cheese Melt Special', count: 12, share: '25%', color: 'from-amber-600 to-amber-700' },
                                            { name: 'Pancong Tiramisu Almond Crunchy', count: 9, share: '19%', color: 'from-amber-700 to-amber-800' },
                                            { name: 'Classic Original Susu', count: 8, share: '18%', color: 'from-amber-800 to-amber-900' }
                                        ].map((item, i) => (
                                            <div key={i} className="space-y-1">
                                                <div className="flex justify-between text-xs font-semibold">
                                                    <span className="text-neutral-700 line-clamp-1">{item.name}</span>
                                                    <span className="text-brand-brown">{item.count} porsi ({item.share})</span>
                                                </div>
                                                <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                                                    <div
                                                        style={{ width: item.share }}
                                                        className={`bg-gradient-to-r ${item.color} h-full rounded-full`}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* FORM MODAL: ADD NEW ITEM TO CATALOG (Visible when isAddMenuOpen is true) */}
            {isAddMenuOpen && (
                <div className="fixed inset-0 bg-[#1C1917]/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up">

                        {/* Modal Header */}
                        <div className="p-5 border-b border-neutral-100 bg-[#FCF9F2] flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-base text-brand-brown font-serif">Tambah Menu Baru</h4>
                                <p className="text-xs text-neutral-500">Isi data di bawah untuk merilis varian pancong baru</p>
                            </div>
                            <button
                                onClick={() => setIsAddMenuOpen(false)}
                                className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer text-xs font-bold"
                            >
                                Tutup
                            </button>
                        </div>

                        {/* Modal Form Scrollable */}
                        <form onSubmit={handleAddProductSubmit} className="flex-grow flex flex-col justify-between overflow-hidden">
                            <div className="p-5 overflow-y-auto space-y-4">
                                {formError && (
                                    <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-lg">
                                        ⚠️ {formError}
                                    </div>
                                )}

                                {/* Name */}
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-widest">
                                        Nama Varian/Menu <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Contoh: Pancong Durian Lumer King"
                                        value={newMenuName}
                                        onChange={(e) => setNewMenuName(e.target.value)}
                                        className="w-full p-3 border border-neutral-300 rounded-xl outline-none focus:border-brand-yellow text-sm"
                                    />
                                </div>

                                {/* Price & Category */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold text-neutral-700 uppercase tracking-widest">
                                            Harga Dasar (Rp) <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            placeholder="Contoh: 15000"
                                            value={newMenuPrice}
                                            onChange={(e) => setNewMenuPrice(e.target.value)}
                                            className="w-full p-3 border border-neutral-300 rounded-xl outline-none focus:border-brand-yellow text-sm"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold text-neutral-700 uppercase tracking-widest">
                                            Kategori Varian
                                        </label>
                                        <select
                                            value={newMenuCategory}
                                            onChange={(e) => setNewMenuCategory(e.target.value as any)}
                                            className="w-full p-3 border border-neutral-300 rounded-xl outline-none focus:border-brand-yellow bg-white text-sm"
                                        >
                                            <option value="sweet">🍩 Manis Sweet</option>
                                            <option value="savory">🥓 Gurih Savory</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Image URL */}
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-widest">
                                        URL Link Foto Kue (Opsional)
                                    </label>
                                    <input
                                        type="url"
                                        placeholder="https://images.unsplash.com/... (kosongkan untuk default)"
                                        value={newMenuImage}
                                        onChange={(e) => setNewMenuImage(e.target.value)}
                                        className="w-full p-3 border border-neutral-300 rounded-xl outline-none focus:border-brand-yellow text-xs"
                                    />
                                </div>

                                {/* Description */}
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-widest">
                                        Deskripsi Pendek Menu
                                    </label>
                                    <textarea
                                        rows={2}
                                        maxLength={150}
                                        placeholder="Jelaskan kelezatan krim lumer atau taburan topping..."
                                        value={newMenuDescription}
                                        onChange={(e) => setNewMenuDescription(e.target.value)}
                                        className="w-full p-3 border border-neutral-300 rounded-xl outline-none focus:border-brand-yellow text-xs resize-none"
                                    />
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-5 border-t border-neutral-100 bg-[#FCF9F2] flex items-center justify-end gap-3.5">
                                <button
                                    type="button"
                                    onClick={() => setIsAddMenuOpen(false)}
                                    className="px-4 py-2.5 border border-neutral-300 hover:bg-neutral-50 text-neutral-600 rounded-xl font-bold text-xs cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-brand-brown hover:bg-brand-brown/95 text-brand-yellow font-extrabold rounded-xl text-xs cursor-pointer"
                                >
                                    Simpan Menu Baru
                                </button>
                            </div>
                        </form>

                    </div>
                </div>
            )}

        </div>
    );
}
