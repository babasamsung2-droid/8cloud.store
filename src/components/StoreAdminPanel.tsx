import React, { useEffect, useState } from 'react';
import { X, Plus, Upload, RefreshCw, BookOpen, ShoppingBag, ShieldCheck } from 'lucide-react';
import { auth } from '../firebase';
import { STORE_RUNTIME_CONFIG } from '../config/storeMode';
import { commerceRequest, formatSettlement, Purchase } from '../services/commerce';
import { useDialog } from './useDialog';

type Asset = { id: string; name: string; objectPath: string; generation: string };
type CatalogProduct = { id: string; name: string; active: boolean; amount: number; revision?: string; files: Asset[];
  display: { categoryId: string; tagline: string; description: string; longDescription?: string; deliveryFormat: string;
    downloadSize: string; version: string; licenseType: string; features: string[]; tags: string[] } };
type Dashboard = { products: CatalogProduct[]; orders: (Purchase & { uid: string })[];
  configuration: { paymentMode: string; paymentsEnabled: boolean; privateStorageVerified: boolean } };
const emptyProduct = (): CatalogProduct => ({ id: '', name: '', active: false, amount: 29900, files: [],
  display: { categoryId: 'ebooks', tagline: '', description: '', deliveryFormat: 'PDF', downloadSize: 'Not uploaded',
    version: '1.0', licenseType: 'Personal use; redistribution prohibited', features: [], tags: [] } });
const inputClass = 'w-full rounded-lg border border-white/15 bg-zinc-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400';

export function StoreAdminPanel({ onClose, onCatalogChanged }: { onClose: () => void; onCatalogChanged: () => void }) {
  const dialog = useDialog(true, onClose);
  const [tab, setTab] = useState<'products' | 'orders' | 'setup'>('products');
  const [data, setData] = useState<Dashboard | null>(null);
  const [editing, setEditing] = useState<CatalogProduct | null>(null);
  const [existing, setExisting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const connected = Boolean(STORE_RUNTIME_CONFIG.checkoutApiUrl);
  async function refresh() {
    setBusy(true); setError('');
    try { setData(await commerceRequest<Dashboard>('/admin/dashboard')); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not load admin data.'); }
    finally { setBusy(false); }
  }
  useEffect(() => { if (connected) void refresh(); }, []);
  function field(key: keyof CatalogProduct['display'], value: string | string[]) {
    setEditing(p => p && ({ ...p, display: { ...p.display, [key]: value } }));
  }
  async function save(event: React.FormEvent) {
    event.preventDefault(); if (!editing) return;
    setBusy(true); setError(''); setNotice('');
    try {
      await commerceRequest('/admin/products', { ...editing, existing });
      setEditing(null); setNotice('Product saved to the server.');
      await refresh(); onCatalogChanged();
    } catch (e) { setError(e instanceof Error ? e.message : 'Save failed.'); }
    finally { setBusy(false); }
  }
  async function upload(file?: File) {
    if (!file || !editing) return;
    if (file.size > 25 * 1024 * 1024 || file.size === 0) { setError('Choose a non-empty file up to 25 MB.'); return; }
    if (editing.files.length >= 10) { setError('Maximum 10 files per product.'); return; }
    setBusy(true); setError('');
    try {
      if (!auth.currentUser) throw new Error('Sign in again.');
      const response = await fetch(`${STORE_RUNTIME_CONFIG.checkoutApiUrl?.replace(/\/$/, '')}/admin/files?name=${encodeURIComponent(file.name)}`, {
        method: 'POST', headers: { Authorization: `Bearer ${await auth.currentUser.getIdToken()}`, 'Content-Type': 'application/octet-stream' },
        body: file, signal: AbortSignal.timeout(90000), credentials: 'omit',
      });
      const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Upload failed.');
      setEditing(p => p && ({ ...p, files: [...p.files, result.file], display: { ...p.display,
        downloadSize: p.files.length ? p.display.downloadSize : `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      } }));
      setNotice('Private file uploaded. Save the product to attach it.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Upload failed.'); }
    finally { setBusy(false); }
  }
  const products = data?.products.filter(p => `${p.name} ${p.id}`.toLowerCase().includes(search.toLowerCase())) || [];
  return <div className="fixed inset-0 z-[100] bg-black/80 p-2 sm:p-6 backdrop-blur-sm">
    <section ref={dialog as React.RefObject<HTMLElement>} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="store-admin-title"
      className="mx-auto flex h-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#090d13] text-zinc-200 shadow-2xl">
      <header className="flex items-center justify-between border-b border-white/10 p-5">
        <div><p className="text-xs tracking-widest text-cyan-400">8CLOUD / STORE MANAGEMENT</p><h1 id="store-admin-title" className="mt-1 text-xl font-bold text-white">Digital product studio</h1></div>
        <button onClick={onClose} aria-label="Close admin panel" className="rounded-lg p-2 hover:bg-white/10"><X /></button>
      </header>
      <nav className="flex gap-2 border-b border-white/10 p-3" aria-label="Admin sections">
        {(['products', 'orders', 'setup'] as const).map(name => <button key={name} onClick={() => setTab(name)} className={`rounded-lg px-4 py-2 capitalize ${tab === name ? 'bg-cyan-500/15 text-cyan-300' : 'hover:bg-white/5'}`}>{name}</button>)}
      </nav>
      <main className="overflow-y-auto p-4 sm:p-6">
        {error && <p role="alert" className="mb-4 rounded-lg border border-red-400/30 bg-red-950/30 p-3 text-red-200">{error}</p>}
        {notice && <p role="status" className="mb-4 rounded-lg bg-cyan-950/40 p-3 text-cyan-200">{notice}</p>}
        {!connected && <div className="mb-6 rounded-xl border border-amber-400/30 bg-amber-950/20 p-5"><h2 className="font-semibold text-amber-200">Connect your store API</h2><p className="mt-2 text-sm">Set VITE_CHECKOUT_API_URL to your HTTPS Cloud Run address and rebuild the storefront. Product changes and uploads require the server connection.</p></div>}
        {data && <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">{[
          [BookOpen, 'Products', `${data.products.length} · ${data.products.filter(p => p.active).length} published`],
          [ShoppingBag, 'Recent orders', `${data.orders.length} (latest 100)`],
          [ShieldCheck, 'Payment mode', `${data.configuration.paymentMode} · ${data.configuration.paymentsEnabled ? 'enabled' : 'disabled'}`],
        ].map(([Icon, label, value]) => { const Component = Icon as typeof BookOpen; return <div key={String(label)} className="rounded-xl border border-white/10 bg-white/[0.03] p-4"><Component className="mb-2 h-5 w-5 text-cyan-400" /><p className="text-xs text-zinc-400">{String(label)}</p><p className="mt-1 font-semibold">{String(value)}</p></div>; })}</div>}
        {tab === 'products' && <>
          <div className="mb-4 flex flex-wrap items-center gap-3"><input aria-label="Search products" placeholder="Search title or product ID" value={search} onChange={e => setSearch(e.target.value)} className={`${inputClass} max-w-sm`} />
            <button disabled={busy || !data} onClick={() => { setExisting(false); setEditing(emptyProduct()); setError(''); setNotice(''); }} className="flex items-center gap-2 rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-black disabled:opacity-40"><Plus size={16} />New product</button>
            <button aria-label="Refresh admin data" disabled={busy || !connected} onClick={() => { setEditing(null); void refresh(); }} className="p-2 disabled:opacity-40"><RefreshCw size={18} /></button></div>
          {data && data.products.length > 200 && <p role="alert" className="mb-3 text-amber-200">Catalog limit reached. This panel and storefront support up to 200 products.</p>}
          {editing ? <form onSubmit={save} className="space-y-4 rounded-xl border border-cyan-400/25 bg-white/[0.02] p-5">
            <h2 className="text-lg font-semibold">{editing.revision ? 'Edit product' : 'Product details'}</h2>
            <fieldset disabled={busy} className="grid grid-cols-1 gap-4 sm:grid-cols-2 disabled:opacity-60">
              <label className="space-y-1 text-sm">Product ID<input required pattern="[A-Za-z0-9_-]{1,128}" maxLength={128} disabled={existing} className={inputClass} value={editing.id} onChange={e => setEditing({ ...editing, id: e.target.value })} /></label>
              <label className="space-y-1 text-sm">Title<input required maxLength={180} className={inputClass} value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} /></label>
              <label className="space-y-1 text-sm">Final selling price (INR)<input type="number" required min="1" max="1000000" step="0.01" className={inputClass} value={editing.amount / 100} onChange={e => setEditing({ ...editing, amount: Math.round(Number(e.target.value) * 100) })} /></label>
              <label className="space-y-1 text-sm">Category<select className={inputClass} value={editing.display.categoryId} onChange={e => field('categoryId', e.target.value)}><option value="ebooks">Ebooks</option><option value="web-assets">Web assets</option><option value="ai-prompts">AI prompts</option><option value="social-media">Social media</option></select></label>
              <label className="space-y-1 text-sm sm:col-span-2">Tagline<input required maxLength={240} className={inputClass} value={editing.display.tagline} onChange={e => field('tagline', e.target.value)} /></label>
              <label className="space-y-1 text-sm sm:col-span-2">Description<textarea required maxLength={4000} rows={4} className={inputClass} value={editing.display.description} onChange={e => { field('description', e.target.value); field('longDescription', e.target.value); }} /></label>
              {([['deliveryFormat', 'Format (PDF / EPUB / ZIP)'], ['downloadSize', 'Total download size'], ['version', 'Product version'], ['licenseType', 'License terms']] as const).map(([key, label]) => <label key={key} className="space-y-1 text-sm">{label}<input required className={inputClass} value={editing.display[key]} onChange={e => field(key, e.target.value)} /></label>)}
              <label className="space-y-1 text-sm sm:col-span-2">Features (one per line)<textarea rows={3} className={inputClass} value={editing.display.features.join('\n')} onChange={e => field('features', e.target.value.split('\n'))} /></label>
              <div className="sm:col-span-2 rounded-lg border border-dashed border-white/20 p-4"><p className="mb-2 flex gap-2 font-medium"><Upload size={18} />Private delivery files</p><p className="mb-3 text-xs text-zinc-400">PDF, EPUB or ZIP; up to 25 MB per file, 10 files per product. Check and scan your originals before publishing. Existing buyers keep their purchased file version.</p>
                <input aria-label="Upload private product file" type="file" accept=".pdf,.epub,.zip" onChange={e => { void upload(e.target.files?.[0]); e.target.value = ''; }} />
                {editing.files.map(file => <div key={file.id} className="mt-3 flex items-center justify-between gap-2 text-sm"><span className="break-all">{file.name} <span className="text-zinc-500">· private version attached</span></span><button type="button" aria-label={`Remove ${file.name} from product`} onClick={() => setEditing({ ...editing, files: editing.files.filter(f => f.id !== file.id) })} className="text-red-300">Remove</button></div>)}
              </div>
              <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" checked={editing.active} onChange={e => setEditing({ ...editing, active: e.target.checked })} />Publish for sale (requires a valid private file)</label>
            </fieldset>
            <div className="flex gap-3"><button disabled={busy} className="rounded-lg bg-cyan-400 px-5 py-2 font-semibold text-black disabled:opacity-40">{busy ? 'Working…' : editing.active ? 'Save and publish' : 'Save draft'}</button><button type="button" disabled={busy} onClick={() => setEditing(null)} className="px-4 py-2">Cancel</button></div>
          </form> : <div className="space-y-3">{products.map(product => <button key={product.id} disabled={busy} onClick={() => { setExisting(true); setEditing(structuredClone(product)); setError(''); setNotice(''); }} className="flex w-full items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-left hover:border-cyan-400/40"><span><span className="block font-semibold">{product.name}</span><span className="text-xs text-zinc-400">{product.files.length} files · {product.active ? 'Published' : 'Draft'}</span></span><span className="shrink-0 text-cyan-300">{formatSettlement(product.amount)}</span></button>)}{data && !products.length && <p className="py-10 text-center text-zinc-400">No products found. Create your first ebook draft.</p>}</div>}
        </>}
        {tab === 'orders' && <><h2 className="mb-2 text-lg font-semibold">Latest customer orders</h2><p className="mb-4 text-sm text-zinc-400">Verified server records. Initiate refunds in Razorpay; refund events block new downloads.</p><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-white/10 text-zinc-400">{['Order / buyer ID', 'Products', 'Amount', 'Status', 'Date'].map(label => <th key={label} className="p-3">{label}</th>)}</tr></thead><tbody>{data?.orders.map(order => <tr key={order.id} className="border-b border-white/5"><td className="max-w-52 break-all p-3">{order.id}<small className="mt-1 block text-zinc-500">{order.uid}</small></td><td className="p-3">{order.items.map(i => i.name).join(', ')}</td><td className="whitespace-nowrap p-3">{formatSettlement(order.amount)}</td><td className="p-3 capitalize">{order.status}</td><td className="whitespace-nowrap p-3">{new Date(order.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table></div>{data?.orders.length === 0 && <p className="py-10 text-center text-zinc-400">No orders yet. Run a sandbox purchase before launch.</p>}</>}
        {tab === 'setup' && <div className="max-w-2xl space-y-5"><h2 className="text-lg font-semibold">Launch configuration</h2><p className="text-sm text-zinc-400">Firebase authentication, private Cloud Storage and Razorpay are managed by the Cloud Run API. Secret keys belong in Google Secret Manager.</p><ul className="space-y-3 text-sm"><li>API connection: {data ? 'Connected and administrator verified' : 'Not verified'}</li><li>Private storage: {data?.configuration.privateStorageVerified ? 'Bucket controls checked by server' : 'Not verified'}</li><li>Payment mode: {data?.configuration.paymentMode || 'Not connected'}</li><li>Server payments: {data?.configuration.paymentsEnabled ? 'Enabled' : 'Disabled or not connected'}</li><li>Frontend checkout: {STORE_RUNTIME_CONFIG.checkoutEnabled ? 'Enabled' : 'Disabled'}</li></ul><p className="text-sm">Start with test keys, publish one real test ebook, and verify payment, download ownership, link expiry and refunds before switching to live mode.</p><a href="https://dashboard.razorpay.com/" target="_blank" rel="noreferrer" className="inline-block text-cyan-300 underline">Open Razorpay dashboard</a></div>}
      </main>
    </section>
  </div>;
}
