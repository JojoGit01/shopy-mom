"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Item } from "./src/types/item";
import { supabase } from "./src/lib/supabaseClient";
import Header from "./src/components/Header";
import Footer from "./src/components/Footer";

const LIST_CODE = process.env.NEXT_PUBLIC_LIST_CODE || "shopmom-x";

function normalizeRef(input: string): string {
  const s = input.trim();
  if (!s) return "";

  if (s.startsWith("http://") || s.startsWith("https://")) {
    const match = s.match(/(\d{6,})/);
    return match ? match[1] : s;
  }

  return s;
}

function formatForClipboard(items: Item[]): string {
  if (!items.length) return "Liste Shopy Mom : (vide)";
  const lines = items.map((it) => {
    const parts: string[] = [];
    parts.push(`• ${it.ref}`);
    if (it.name) parts.push(`— ${it.name}`);
    const details: string[] = [];
    if (it.color) details.push(`Couleur: ${it.color}`);
    if (it.size) details.push(`Taille: ${it.size}`);
    if (it.other) details.push(`Autre: ${it.other}`);
    details.push(`x${it.quantity}`);
    return `${parts.join(" ")} (${details.join(" • ")})`;
  });

  return `Shopy Mom 🛍️\n\n${lines.join("\n")}`;
}

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Form
  const [refOrLink, setRefOrLink] = useState("");
  const [name, setName] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [other, setOther] = useState("");

  const [items, setItems] = useState<Item[]>([]);
  const clipboardPreview = useMemo(() => formatForClipboard(items), [items]);

  useEffect(() => {
    const t = toast ? setTimeout(() => setToast(null), 2200) : undefined;
    return () => {
      if (t) clearTimeout(t);
    };
  }, [toast]);

  async function fetchItems() {
    setLoading(true);
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("list_code", LIST_CODE)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setToast("Erreur: impossible de charger la liste.");
      setLoading(false);
      return;
    }

    setItems((data || []) as Item[]);
    setLoading(false);
  }

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handlePasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      if (!text?.trim()) {
        setToast("Presse-papier vide.");
        return;
      }
      setRefOrLink(text);
      setToast("Collé ✅");
    } catch {
      setToast("Impossible de lire le presse-papier (permission).");
    }
  }

  async function handleAddItem() {
    const ref = normalizeRef(refOrLink);
    if (!ref) {
      setToast("Ajoute une référence ou un lien.");
      return;
    }
    if (quantity < 1) {
      setToast("Quantité invalide.");
      return;
    }

    setBusy(true);

    const payload = {
      list_code: LIST_CODE,
      ref,
      name: name.trim() || null,
      color: color.trim() || null,
      size: size.trim() || null,
      quantity,
      other: other.trim() || null,
    };

    const { error } = await supabase.from("items").insert(payload);

    if (error) {
      console.error(error);
      setToast("Erreur: ajout impossible (RLS ou table).");
      setBusy(false);
      return;
    }

    setRefOrLink("");
    setName("");
    setColor("");
    setSize("");
    setOther("");
    setQuantity(1);
    setToast("Article ajouté ✅");

    await fetchItems();
    setBusy(false);
  }

  async function handleDeleteItem(id: string) {
    setBusy(true);
    const { error } = await supabase.from("items").delete().eq("id", id);
    if (error) {
      console.error(error);
      setToast("Erreur: suppression impossible.");
      setBusy(false);
      return;
    }
    setToast("Supprimé 🗑️");
    await fetchItems();
    setBusy(false);
  }

  async function handleClearList() {
    if (!items.length) {
      setToast("Liste déjà vide.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("items").delete().eq("list_code", LIST_CODE);
    if (error) {
      console.error(error);
      setToast("Erreur: impossible de vider la liste.");
      setBusy(false);
      return;
    }
    setToast("Liste vidée ✅");
    await fetchItems();
    setBusy(false);
  }

  async function handleCopyAll() {
    try {
      await navigator.clipboard.writeText(clipboardPreview);
      setToast("Liste copiée ✅");
    } catch {
      setToast("Impossible de copier (permission).");
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 text-slate-100">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-[1400px] px-8 py-10 w-full">

          {/* Content grid */}
          <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            {/* Form card */}
            <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold">Ajouter un article</h2>
                <button
                  onClick={handlePasteFromClipboard}
                  className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm hover:bg-white/15 transition disabled:opacity-50"
                  disabled={busy}
                >
                  📋 Coller
                </button>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="text-sm text-slate-300">Référence ou lien SHEIN</label>
                  <input
                    value={refOrLink}
                    onChange={(e) => setRefOrLink(e.target.value)}
                    placeholder="Colle une ref (ex: 12345678) ou un lien…"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 outline-none focus:border-teal-400/50"
                  />
                  <p className="mt-2 text-xs text-slate-400">
                    Si tu colles un lien, on essaie d’extraire l’ID automatiquement.
                  </p>
                </div>

                <div>
                  <label className="text-sm text-slate-300">Nom (optionnel)</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Robe noire"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 outline-none focus:border-teal-400/50"
                  />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="flex-1">
                    <label className="text-sm text-slate-300">Quantité</label>
                    <input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Number(e.target.value || 1)))}
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 outline-none focus:border-teal-400/50"
                    />
                  </div>

                  <div className="flex-1">
                    <label className="text-sm text-slate-300">Taille (optionnel)</label>
                    <input
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                      placeholder="S / M / L / 36 / 38…"
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 outline-none focus:border-teal-400/50"
                    />
                  </div>
                </div>

                {/* Details collapsible */}
                <button
                  onClick={() => setShowDetails((v) => !v)}
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-left text-sm hover:bg-white/15 transition"
                  type="button"
                >
                  {showDetails ? "▾ Masquer les détails" : "▸ Ajouter des détails (optionnel)"}
                </button>

                {showDetails && (
                  <div className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                    <div>
                      <label className="text-sm text-slate-300">Couleur (optionnel)</label>
                      <input
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        placeholder="Ex: Noir"
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 outline-none focus:border-teal-400/50"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-slate-300">Autre (optionnel)</label>
                      <input
                        value={other}
                        onChange={(e) => setOther(e.target.value)}
                        placeholder="Ex: 2ème choix / matière / commentaire…"
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 outline-none focus:border-teal-400/50"
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={handleAddItem}
                  disabled={busy}
                  className="w-full rounded-2xl bg-teal-500/90 px-4 py-3 font-semibold text-slate-950 hover:bg-teal-400 transition disabled:opacity-50"
                >
                  {busy ? "..." : "Ajouter à la liste"}
                </button>
              </div>
            </section>

            {/* List + actions */}
            <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Liste</h2>
                <span className="text-sm text-slate-300">
                  {loading ? "Chargement…" : `${items.length} article(s)`}
                </span>
              </div>

              {!loading && items.length === 0 && (
                <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/30 p-6 text-center">
                  <div className="text-3xl">🛍️</div>
                  <p className="mt-2 text-slate-200">Ta liste est vide.</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Ajoute une référence SHEIN pour commencer.
                  </p>
                </div>
              )}

              <div className="mt-6 space-y-3">
                {items.map((it) => (
                  <div
                    key={it.id}
                    className="rounded-2xl border border-white/10 bg-slate-950/30 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-lg bg-white/10 px-2 py-1 font-mono text-sm text-teal-200">
                            {it.ref}
                          </span>
                          {it.name && <span className="text-slate-100">{it.name}</span>}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-300">
                          {it.color && (
                            <span className="rounded-lg bg-white/5 px-2 py-1">🎨 {it.color}</span>
                          )}
                          {it.size && (
                            <span className="rounded-lg bg-white/5 px-2 py-1">📏 {it.size}</span>
                          )}
                          {it.other && (
                            <span className="rounded-lg bg-white/5 px-2 py-1">📝 {it.other}</span>
                          )}
                          <span className="rounded-lg bg-white/5 px-2 py-1">x{it.quantity}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteItem(it.id)}
                        disabled={busy}
                        className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm hover:bg-white/15 transition disabled:opacity-50"
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  onClick={handleCopyAll}
                  disabled={busy || loading}
                  className="rounded-2xl bg-sky-500/90 px-4 py-3 font-semibold text-slate-950 hover:bg-sky-400 transition disabled:opacity-50"
                >
                  📤 Copier / Envoyer à Jo
                </button>

                <button
                  onClick={handleClearList}
                  disabled={busy || loading}
                  className="rounded-2xl border border-red-400/30 bg-red-500/15 px-4 py-3 font-semibold text-red-200 hover:bg-red-500/25 transition disabled:opacity-50"
                >
                  🧹 Vider la liste
                </button>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-300">Aperçu du message</p>
                  <button
                    onClick={handleCopyAll}
                    disabled={busy || loading}
                    className="text-xs text-teal-200 hover:text-teal-100"
                  >
                    Copier
                  </button>
                </div>
                <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-xs text-slate-200">
{clipboardPreview}
                </pre>
              </div>
            </section>
          </div>

          {toast && (
            <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 shadow-lg backdrop-blur">
              {toast}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
