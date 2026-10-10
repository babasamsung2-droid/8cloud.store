import { useDialog } from './useDialog';
import React, { useEffect, useState } from 'react';
import { X, Download, RefreshCw } from 'lucide-react';
import { commerceRequest, formatSettlement, Purchase } from '../services/commerce';
export function SecurePurchasesModal({ isOpen, onClose, userId, onSignIn }: { isOpen: boolean; onClose(): void; userId?: string; onSignIn(): void }) {
  const [orders, setOrders] = useState<Purchase[]>([]);
  const dialogRef = useDialog(isOpen, onClose);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [revision, setRevision] = useState(0);
  const [busy, setBusy] = useState('');
  useEffect(() => {
    setOrders([]); setError('');
    if (!isOpen || !userId) return;
    let cancelled = false; setLoading(true);
    commerceRequest<{ orders: Purchase[] }>('/orders').then(value => { if (!cancelled) setOrders(value.orders); })
      .catch(error => { if (!cancelled) setError(error.message); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [isOpen, userId, revision]);
  if (!isOpen) return null;
  async function checkPayment(orderId: string) {
    setBusy(orderId); setError('');
    try { await commerceRequest('/orders/reconcile', { orderId }); setRevision(value => value + 1); }
    catch (error) { setError(error instanceof Error ? error.message : 'Could not check payment.'); }
    finally { setBusy(''); }
  }
  async function download(orderId: string, productId: string, fileId: string) {
    setBusy(`${orderId}-${fileId}`); setError('');
    try {
      const value = await commerceRequest<{ url: string }>('/downloads', { orderId, productId, fileId });
      const url = new URL(value.url);
      if (url.protocol !== 'https:' || !(url.hostname === 'storage.googleapis.com' || url.hostname.endsWith('.storage.googleapis.com'))) throw new Error('The file service returned an invalid link.');
      const link = document.createElement('a'); link.href = value.url; link.rel = 'noreferrer'; link.referrerPolicy = 'no-referrer';
      document.body.appendChild(link); link.click(); link.remove();
    } catch (error) { setError(error instanceof Error ? error.message : 'Download unavailable.'); }
    finally { setBusy(''); }
  }
  return <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4">
    <section ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="purchases-title" className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-zinc-950 p-6 text-white">
      <div className="mb-4 flex items-center justify-between gap-4"><h2 id="purchases-title" className="text-xl font-bold">My Purchases</h2><button onClick={onClose} aria-label="Close purchases"><X /></button></div>
      <p className="mb-4 text-sm text-zinc-400">Your downloads appear here after payment is confirmed. Each download request creates a link valid for 60 seconds.</p>
      <button disabled={loading || !userId} onClick={() => setRevision(value => value + 1)} className="mb-4 flex items-center gap-2 text-sm text-cyan-300"><RefreshCw className="h-4 w-4" /> Refresh purchases</button>
      {!userId && <button onClick={onSignIn} className="rounded-lg bg-cyan-400 px-4 py-2 text-zinc-950">Sign in with Google</button>}
      {loading && <p role="status">Loading purchases…</p>}
      {error && <p role="alert" className="mb-4 text-sm text-rose-300">{error}</p>}
      {userId && !loading && !error && !orders.length && <p className="text-sm text-zinc-400">No purchases yet.</p>}
      <div className="space-y-4">{orders.map(order => <article key={order.id} className="rounded-xl border border-white/10 p-4">
        <div className="mb-3 text-xs text-zinc-400">{new Date(order.createdAt).toLocaleDateString()} · {formatSettlement(order.amount)} · {order.status}</div>
        {order.items.map(item => <div key={item.productId} className="mb-3"><h3 className="mb-2 font-semibold">{item.name}</h3>
          {order.status === 'paid' ? item.files.map(file => <button key={file.id} disabled={Boolean(busy)} onClick={() => download(order.id, item.productId, file.id)} className="mr-2 mb-2 inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-3 py-2 text-sm text-zinc-950 disabled:opacity-50"><Download className="h-4 w-4" /> {busy === `${order.id}-${file.id}` ? 'Preparing…' : file.name}</button>) : <p className="text-xs text-zinc-400">{order.status === 'pending' ? 'Awaiting payment confirmation. Refresh if you have already paid.' : 'Download access is unavailable for this order.'}</p>}
        </div>)}{order.status === 'pending' && <button disabled={Boolean(busy)} onClick={() => checkPayment(order.id)} className="mb-3 text-sm text-cyan-300">Check payment status</button>}<p className="break-all text-[10px] text-zinc-500">Order {order.id}</p>
      </article>)}</div>
    </section>
  </div>;
}
