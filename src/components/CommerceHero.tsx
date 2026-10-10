import React from 'react';
import { BookOpen, Download, ShieldCheck } from 'lucide-react';
export function CommerceHero({ onShopNow }: { onShopNow(): void }) {
  return <section className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
    <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-cyan-300">Ebooks & digital products</p>
    <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-6xl">Good ideas. Useful tools.<br /><span className="text-cyan-300">Yours to download.</span></h1>
    <p className="my-6 max-w-xl text-base leading-relaxed text-zinc-400">Explore ebooks, guides and digital resources. Pay securely, then find your files in My Purchases whenever you need them.</p>
    <button onClick={onShopNow} className="rounded-xl bg-cyan-400 px-6 py-3 font-semibold text-zinc-950">Explore products</button>
    <div className="mt-10 grid gap-5 text-sm sm:grid-cols-3">
      <div className="flex items-center gap-3"><BookOpen className="text-cyan-300" /> Clear product contents</div>
      <div className="flex items-center gap-3"><ShieldCheck className="text-cyan-300" /> Payment confirmed before access</div>
      <div className="flex items-center gap-3"><Download className="text-cyan-300" /> Downloads in your account</div>
    </div>
  </section>;
}
