import { ApiError, requireId } from './core.mjs';
import { Buffer } from 'node:buffer';
export function createRazorpayGateway(env) {
  async function request(path, body) {
    const response = await fetch(`https://api.razorpay.com/v1/${path}`, {
      method: body ? 'POST' : 'GET', signal: AbortSignal.timeout(15000),
      headers: { Authorization: `Basic ${Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString('base64')}`, 'Content-Type': 'application/json' },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (!response.ok) throw new ApiError(502, 'Payment provider is temporarily unavailable.');
    return response.json();
  }
  return { createOrder: body => request('orders', body), getPayment: id => request(`payments/${requireId(id)}`), getOrderPayments: id => request(`orders/${requireId(id)}/payments`) };
}
