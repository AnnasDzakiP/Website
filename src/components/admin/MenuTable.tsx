"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "../../utils/supabase/client";
import { MenuItem } from "../../types";
import AddMenuForm from "./AddMenuForm";
import AdminSettings from "./AdminSettings"; // Import komponen setting topping

// Gunakan URL ini jika admin tidak memasukkan foto
const DEFAULT_IMAGE =
  "https://placehold.co/400x400/fcf9f2/78350f?text=Pancong+Lumer";

export default function MenuTable() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State untuk modal
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // State baru untuk pengaturan topping

  // State untuk mode edit modal menu
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<MenuItem>>({});

  // State untuk menangani upload file fisik
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supabase = createClient();

  const fetchAllMenu = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      alert("Gagal mengambil data menu: " + error.message);
    } else if (data) {
      const formattedData: MenuItem[] = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description || "",
        price: item.price,
        image: item.image || "",
        isAvailable: item.is_available,
      }));
      setMenuItems(formattedData);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAllMenu();
  }, []);

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    setIsSubmitting(true);
    let finalImageUrl = editForm.image;

    if (uploadFile) {
      const fileExt = uploadFile.name.split(".").pop();
      const fileName = `edit-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("menu-images")
        .upload(fileName, uploadFile);

      if (uploadError) {
        alert("Gagal mengunggah foto baru: " + uploadError.message);
        setIsSubmitting(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("menu-images")
        .getPublicUrl(fileName);

      finalImageUrl = urlData.publicUrl;
    }

    const priceToSave = Number(editForm.price) || 0;

    const { error } = await supabase
      .from("menu_items")
      .update({
        name: editForm.name,
        description: editForm.description,
        price: priceToSave,
        image: finalImageUrl,
        is_available: editForm.isAvailable,
      })
      .eq("id", editingId);

    if (error) {
      alert("Gagal menyimpan perubahan: " + error.message);
    } else {
      alert("Data menu berhasil diperbarui!");
      closeEditModal();
      fetchAllMenu();
    }
    setIsSubmitting(false);
  };

  const closeEditModal = () => {
    setEditingId(null);
    setUploadFile(null);
  };

  const handleToggleMenuAvailability = async (
    menuId: string,
    currentStatus: boolean,
  ) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === menuId ? { ...item, isAvailable: !currentStatus } : item,
      ),
    );
    const { error } = await supabase
      .from("menu_items")
      .update({ is_available: !currentStatus })
      .eq("id", menuId);

    if (error) {
      alert("Gagal mengubah status stok!");
      fetchAllMenu();
    }
  };

  const handleDeleteProduct = async (menuId: string) => {
    if (
      confirm("Yakin ingin menghapus menu ini secara permanen dari database?")
    ) {
      setMenuItems((prev) => prev.filter((item) => item.id !== menuId));
      const { error } = await supabase
        .from("menu_items")
        .delete()
        .eq("id", menuId);

      if (error) {
        alert("Gagal menghapus produk!");
        fetchAllMenu();
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-200 pb-4 gap-4">
        <div>
          <h4 className="font-bold text-xl text-brand-brown font-serif">
            Katalog Produk Pancong
          </h4>
          <p className="text-xs text-neutral-500 font-medium tracking-wide">
            Kelola data menu, harga, dan stok lumer Anda
          </p>
        </div>

        {/* Tombol Aksi Kanan */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="bg-white border-2 border-brand-brown/20 hover:border-brand-brown/40 text-brand-brown font-extrabold text-xs py-2.5 px-5 rounded-2xl shadow-sm transition-all cursor-pointer flex items-center gap-2"
          >
            ⚙️ Pengaturan Topping
          </button>

          <button
            onClick={() => setIsAddMenuOpen(true)}
            className="bg-brand-brown hover:bg-[#5E2606] text-brand-yellow font-extrabold text-xs py-3 px-6 rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <span>+</span> Tambah Menu
          </button>
        </div>
      </div>

      {/* MODAL PENGATURAN TOPPING */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-brand-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300">
          <div className="bg-[#FCF9F2] w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up">
            <div className="p-5 border-b border-brand-brown/10 flex items-center justify-between bg-white">
              <div>
                <h3 className="font-bold text-lg font-serif text-brand-brown leading-none mt-1">
                  Pengaturan Topping & Kategori
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="p-1 px-3 rounded-full bg-brand-brown/5 text-neutral-600 hover:bg-brand-brown/10 transition-colors text-xs font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <AdminSettings />
            </div>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH MENU */}
      {isAddMenuOpen && (
        <AddMenuForm
          onClose={() => setIsAddMenuOpen(false)}
          onSuccess={() => {
            setIsAddMenuOpen(false);
            fetchAllMenu();
          }}
        />
      )}

      {/* MODAL EDIT MENU DENGAN FITUR UPLOAD LOKAL */}
      {editingId && (
        <div className="fixed inset-0 bg-brand-charcoal/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 transition-opacity duration-300">
          <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh] border border-brand-brown/10 animate-slide-up">
            {/* HEADER MODAL EDIT */}
            <div className="p-5 border-b border-brand-brown/10 flex items-center justify-between bg-[#FCF9F2]">
              <div>
                <h3 className="font-bold text-lg font-serif text-brand-brown leading-none mt-1">
                  Edit Menu: {editForm.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                className="p-1 px-3 rounded-full bg-brand-brown/5 text-neutral-600 hover:bg-brand-brown/10 transition-colors text-xs font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>

            {/* FORM KONTEN UTAMA (SCROLLABLE) */}
            <form
              onSubmit={handleSaveEdit}
              className="p-5 overflow-y-auto space-y-5 flex-1 flex flex-col justify-between"
            >
              <div className="space-y-5">
                {/* Preview Produk Singkat dengan Live Preview */}
                <div className="flex gap-4 items-center pb-4 border-b border-brand-brown/10 bg-neutral-50/70 p-3 rounded-2xl">
                  <img
                    className="w-16 h-16 object-cover rounded-xl shadow-sm flex-none border border-brand-brown/10 bg-white"
                    src={
                      uploadFile
                        ? URL.createObjectURL(uploadFile)
                        : editForm.image || DEFAULT_IMAGE
                    }
                    alt={editForm.name}
                    onError={(e) =>
                      ((e.target as HTMLImageElement).src = DEFAULT_IMAGE)
                    }
                  />
                  <div className="space-y-1 min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                      Pratinjau Gambar
                    </span>
                    <p className="text-xs font-bold text-brand-charcoal truncate">
                      {editForm.name || "Nama Menu"}
                    </p>
                    <span className="inline-block font-extrabold text-xs text-brand-brown bg-brand-yellow/20 px-2 py-0.5 rounded-md">
                      Rp {Number(editForm.price || 0).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                {/* 1. NAMA MENU */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-widest">
                    Nama Menu <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Masukkan nama menu..."
                    value={editForm.name || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    className="w-full p-3 rounded-xl border border-brand-brown/20 outline-none focus:border-brand-yellow font-medium text-sm transition-all focus:ring-2 focus:ring-brand-yellow/15"
                  />
                </div>

                {/* 2. DESKRIPSI MENU */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-widest">
                    Deskripsi Menu <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Jelaskan kelezatan menu ini..."
                    value={editForm.description || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                    className="w-full p-3 rounded-xl border border-brand-brown/20 outline-none focus:border-brand-yellow font-medium text-xs resize-none transition-all focus:ring-2 focus:ring-brand-yellow/15"
                  />
                </div>

                {/* 3. HARGA */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-widest">
                      Harga (Rp) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="Contoh: 15000"
                      value={editForm.price || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          price: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full p-3 rounded-xl border border-brand-brown/20 outline-none focus:border-brand-yellow font-bold text-sm text-brand-brown transition-all focus:ring-2 focus:ring-brand-yellow/15"
                    />
                  </div>
                </div>

                {/* 4. UPLOAD FOTO DARI LAPTOP/HP */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-widest">
                    Ganti Foto Menu (Upload)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="w-full p-2 rounded-xl border border-brand-brown/20 outline-none text-xs file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-brand-brown/5 file:text-brand-brown hover:file:bg-brand-brown/10 transition-all cursor-pointer"
                  />
                  <span className="text-[10px] text-neutral-400 block italic">
                    *Pilih file dari perangkat. Biarkan kosong jika tidak ingin
                    mengganti foto yang sudah ada.
                  </span>
                </div>

                {/* 5. STATUS KETERSEDIAAN (RADIO CARDS) */}
                <div className="space-y-2 pt-1">
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-widest">
                    Status Stok Penjualan:
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {
                        label: "Ready (Tersedia)",
                        val: true,
                        desc: "Siap dipesan pembeli",
                      },
                      {
                        label: "Habis (Kosong)",
                        val: false,
                        desc: "Sembunyikan dari antrian",
                      },
                    ].map((status) => (
                      <label
                        key={String(status.val)}
                        onClick={() =>
                          setEditForm({ ...editForm, isAvailable: status.val })
                        }
                        className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          editForm.isAvailable === status.val
                            ? "border-brand-yellow bg-brand-cream/30 text-brand-brown font-bold shadow-sm"
                            : "border-neutral-200 text-neutral-500 bg-white hover:border-brand-brown/30"
                        }`}
                      >
                        <div className="flex flex-col text-left">
                          <span className="text-xs">{status.label}</span>
                          <span className="text-[9px] text-neutral-400 font-normal">
                            {status.desc}
                          </span>
                        </div>
                        <input
                          type="radio"
                          checked={editForm.isAvailable === status.val}
                          onChange={() => {}}
                          className="w-4 h-4 text-brand-yellow border-neutral-300 focus:ring-brand-yellow cursor-pointer"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* FOOTER MODAL - TOMBOL AKSI */}
              <div className="pt-5 border-t border-brand-brown/10 flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={isSubmitting}
                  className="bg-neutral-100 hover:bg-neutral-200 text-neutral-600 font-extrabold py-3.5 px-5 rounded-xl text-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-initial bg-brand-brown hover:bg-[#5E2606] text-brand-yellow font-extrabold py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all text-xs tracking-wider cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STATUS LOADING */}
      {isLoading ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-neutral-100 shadow-sm">
          <div className="w-10 h-10 border-4 border-brand-brown border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-bold text-neutral-500">
            Memuat katalog dari database...
          </p>
        </div>
      ) : (
        /* Tabel Data */
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="bg-[#FCF9F2] text-xs font-bold text-neutral-500 uppercase tracking-widest border-b border-neutral-100">
                <th className="px-6 py-5">Info Menu & Foto</th>
                <th className="px-6 py-5">Harga</th>
                <th className="px-6 py-5">Stok</th>
                <th className="px-6 py-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {menuItems.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-neutral-50/50 transition-colors"
                >
                  {/* KOLOM INFO MENU */}
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-4">
                      <img
                        src={item.image || DEFAULT_IMAGE}
                        alt={item.name}
                        onError={(e) =>
                          ((e.target as HTMLImageElement).src = DEFAULT_IMAGE)
                        }
                        className="w-16 h-16 rounded-2xl object-cover border border-neutral-200 shadow-sm flex-shrink-0 bg-white"
                      />
                      <div className="flex flex-col space-y-1">
                        <span className="font-bold text-brand-charcoal leading-tight">
                          {item.name}
                        </span>
                        <span className="text-[11px] text-neutral-500 leading-snug line-clamp-2 max-w-[220px]">
                          {item.description || "Tidak ada deskripsi"}
                        </span>
                      </div>
                    </div>
                  </td>
                  {/* KOLOM HARGA */}
                  <td className="px-6 py-4 align-top pt-6 font-bold text-brand-brown">
                    Rp {item.price.toLocaleString("id-ID")}
                  </td>
                  {/* KOLOM STOK */}
                  <td className="px-6 py-4 align-top pt-6">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={item.isAvailable}
                        onChange={() =>
                          handleToggleMenuAvailability(
                            item.id,
                            item.isAvailable,
                          )
                        }
                        className="w-5 h-5 accent-emerald-500 cursor-pointer rounded"
                      />
                      <span
                        className={`text-[11px] font-bold uppercase tracking-wider ${item.isAvailable ? "text-emerald-600" : "text-rose-500"}`}
                      >
                        {item.isAvailable ? "Ready" : "Habis"}
                      </span>
                    </div>
                  </td>
                  {/* KOLOM AKSI */}
                  <td className="px-6 py-4 align-top pt-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          setEditingId(item.id);
                          setEditForm(item);
                        }}
                        className="bg-brand-brown/5 hover:bg-brand-brown/15 text-brand-brown font-extrabold text-xs py-2 px-4 rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(item.id)}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold text-xs py-2 px-3 rounded-xl transition-all cursor-pointer shadow-sm"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {menuItems.length === 0 && !isLoading && (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-12 text-sm text-neutral-400 font-medium"
                  >
                    Belum ada data menu. Silakan klik "Tambah Menu".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
