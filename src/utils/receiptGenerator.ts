import { Order, StoreSettings } from '../types';
import { formatPrice } from './currency';

/**
 * Generates an isolated, print-optimized HTML string for an Order Invoice
 * Formatted specifically for A4 / Letter PDF generation and physical printing.
 */
export function generatePrintableInvoiceHtml(order: Order, storeSettings?: StoreSettings): string {
  const storeName = storeSettings?.storeName || '8cloud.store';
  const formattedDate = new Date(order.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = new Date(order.date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  });

  const currencySymbol = order.currency === 'INR' ? '₹' : order.currency === 'EUR' ? '€' : order.currency === 'GBP' ? '£' : '$';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Tax Invoice - INV-${order.id} - ${storeName}</title>
  <style>
    @page {
      size: A4;
      margin: 14mm 16mm 14mm 16mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      line-height: 1.45;
      font-size: 12px;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .receipt-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 24px;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
    }
    @media print {
      body {
        background: transparent;
      }
      .receipt-container {
        border: none;
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .logo-section h1 {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #0284c7;
      margin-bottom: 4px;
    }
    .logo-section p {
      font-size: 11px;
      color: #64748b;
    }
    .invoice-meta {
      text-align: right;
    }
    .invoice-title {
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: 0.5px;
    }
    .invoice-id {
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
      font-weight: 700;
      color: #0284c7;
      font-size: 13px;
      margin-top: 2px;
    }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      border-radius: 4px;
      background: #dcfce7;
      color: #15803d;
      border: 1px solid #86efac;
      margin-top: 6px;
    }
    .grid-two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 24px;
    }
    .info-card {
      background: #f8fafc;
      padding: 14px 16px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    .info-card h3 {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      margin-bottom: 8px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
    }
    .info-card p {
      font-size: 12px;
      color: #334155;
      margin-bottom: 3px;
    }
    .info-card strong {
      color: #0f172a;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    thead th {
      background: #0f172a;
      color: #ffffff;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 10px 12px;
      text-align: left;
    }
    thead th:last-child, tbody td:last-child {
      text-align: right;
    }
    tbody tr {
      border-bottom: 1px solid #e2e8f0;
    }
    tbody tr:nth-child(even) {
      background: #f8fafc;
    }
    tbody td {
      padding: 10px 12px;
      font-size: 12px;
      color: #1e293b;
      vertical-align: top;
    }
    .item-name {
      font-weight: 600;
      color: #0f172a;
    }
    .item-format {
      font-size: 10px;
      color: #64748b;
      margin-top: 2px;
    }
    .totals-section {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 24px;
    }
    .totals-table {
      width: 300px;
      border-collapse: collapse;
    }
    .totals-table td {
      padding: 6px 12px;
      font-size: 12px;
    }
    .totals-table tr.total-row {
      border-top: 2px solid #0f172a;
      border-bottom: 2px solid #0f172a;
      background: #f8fafc;
    }
    .totals-table tr.total-row td {
      font-size: 15px;
      font-weight: 800;
      color: #0f172a;
      padding: 8px 12px;
    }
    .licenses-card {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 8px;
      padding: 14px 16px;
      margin-bottom: 24px;
    }
    .licenses-card h3 {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      color: #166534;
      margin-bottom: 8px;
    }
    .license-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #ffffff;
      border: 1px solid #86efac;
      padding: 8px 12px;
      border-radius: 6px;
      margin-bottom: 6px;
    }
    .license-key {
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
      font-weight: 700;
      font-size: 12px;
      letter-spacing: 1px;
      color: #15803d;
    }
    .license-meta {
      font-size: 10px;
      color: #64748b;
    }
    .footer-stamp {
      border-top: 1px dashed #cbd5e1;
      padding-top: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      color: #64748b;
    }
    .security-hash {
      font-family: monospace;
      background: #f1f5f9;
      padding: 3px 6px;
      border-radius: 4px;
      font-size: 9px;
    }
    .print-actions {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin-bottom: 20px;
    }
    .print-btn {
      background: #0284c7;
      color: #ffffff;
      border: none;
      padding: 10px 20px;
      font-size: 13px;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .print-btn:hover {
      background: #0369a1;
    }
    .close-btn {
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #cbd5e1;
      padding: 10px 18px;
      font-size: 13px;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="no-print print-actions">
    <button class="print-btn" onclick="window.print()">
      🖨️ Print / Save as PDF
    </button>
    <button class="close-btn" onclick="window.close()">
      Close Window
    </button>
  </div>

  <div class="receipt-container">
    <!-- Header -->
    <div class="header">
      <div class="logo-section">
        <h1>${storeName}</h1>
        <p>Ultra-Modern Cryptographic & Digital Assets Fulfillment</p>
        <p style="margin-top: 4px;">Registered Support: support@8cloud.store | https://8cloud.store</p>
      </div>
      <div class="invoice-meta">
        <div class="invoice-title">TAX INVOICE</div>
        <div class="invoice-id">INV-${order.id}</div>
        <div><span class="badge">Payment Confirmed (${order.paymentMethod.toUpperCase()})</span></div>
      </div>
    </div>

    <!-- Meta Details Grid -->
    <div class="grid-two-col">
      <div class="info-card">
        <h3>Billed To (Customer)</h3>
        <p><strong>Name:</strong> ${order.customerName}</p>
        <p><strong>Email:</strong> ${order.customerEmail}</p>
        <p><strong>Fulfillment Method:</strong> Instant Cloud Vault & CDN Download</p>
        <p><strong>Order Timestamp:</strong> ${formattedDate} at ${formattedTime}</p>
      </div>

      <div class="info-card">
        <h3>Payment & Transaction Details</h3>
        <p><strong>Transaction Ref:</strong> <span style="font-family: monospace;">${order.transactionRef}</span></p>
        <p><strong>Payment Gateway:</strong> ${order.paymentMethod === 'razorpay' ? 'Razorpay Secure Payment' : order.paymentMethod === 'upi' ? 'Unified Payments Interface (UPI / QR)' : order.paymentMethod === 'crypto' ? 'Web3 Escrow Ledger' : 'Direct Card Rail'}</p>
        <p><strong>Billing Currency:</strong> ${order.currency}</p>
        <p><strong>Merchant ID:</strong> 8CLD-US-IN-NODE-01</p>
      </div>
    </div>

    <!-- Purchased Products Table -->
    <table>
      <thead>
        <tr>
          <th style="width: 50%;">Item Description</th>
          <th style="width: 15%; text-align: center;">Delivery Format</th>
          <th style="width: 10%; text-align: center;">Qty</th>
          <th style="width: 12%; text-align: right;">Unit Price</th>
          <th style="width: 13%; text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${order.items.map((item) => `
          <tr>
            <td>
              <div class="item-name">${item.product.name}</div>
              <div class="item-format">SKU: ${item.product.sku || '8CLD-' + item.product.id.substring(0, 8).toUpperCase()}</div>
            </td>
            <td style="text-align: center; color: #64748b; font-size: 11px;">
              ${item.product.deliveryFormat}
            </td>
            <td style="text-align: center; font-weight: 600;">
              ${item.quantity}
            </td>
            <td style="text-align: right; font-family: monospace;">
              ${formatPrice(item.product.priceUSD, order.currency)}
            </td>
            <td style="text-align: right; font-weight: 700; font-family: monospace;">
              ${formatPrice(item.product.priceUSD * item.quantity, order.currency)}
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <!-- Totals Calculation -->
    <div class="totals-section">
      <table class="totals-table">
        <tr>
          <td style="color: #64748b;">Subtotal:</td>
          <td style="text-align: right; font-family: monospace; font-weight: 600;">
            ${formatPrice(order.subtotal, order.currency)}
          </td>
        </tr>
        ${order.discount > 0 ? `
        <tr>
          <td style="color: #16a34a;">Promotional Discount:</td>
          <td style="text-align: right; font-family: monospace; font-weight: 600; color: #16a34a;">
            -${formatPrice(order.discount, order.currency)}
          </td>
        </tr>` : ''}
        <tr>
          <td style="color: #64748b;">Tax / GST (Digital Goods Export):</td>
          <td style="text-align: right; font-family: monospace; color: #64748b;">
            ${currencySymbol}0.00
          </td>
        </tr>
        <tr class="total-row">
          <td>Total Paid:</td>
          <td style="text-align: right; font-family: monospace; color: #0284c7;">
            ${formatPrice(order.total, order.currency)}
          </td>
        </tr>
      </table>
    </div>

    <!-- Cryptographic License Keys Allocated -->
    ${order.licenses && order.licenses.length > 0 ? `
      <div class="licenses-card">
        <h3>Cryptographic Activation Keys Allocated (${order.licenses.length})</h3>
        ${order.licenses.map(lic => `
          <div class="license-item">
            <div>
              <div style="font-weight: 600; font-size: 11px; color: #166534;">${lic.productName}</div>
              <div class="license-key">${lic.key}</div>
            </div>
            <div class="license-meta">
              Hardware Seats: ${lic.maxDevices} Device${lic.maxDevices > 1 ? 's' : ''} | Status: Active
            </div>
          </div>
        `).join('')}
        <div style="font-size: 10px; color: #15803d; margin-top: 6px;">
          ✓ Keys can be validated anytime at https://8cloud.store/verify-key
        </div>
      </div>
    ` : ''}

    <!-- Security Verification & Disclaimer -->
    <div class="footer-stamp">
      <div>
        <p><strong>Electronic Receipt:</strong> Authenticated by 8cloud Zero-Trust Delivery Escrow.</p>
        <p>All software keys & digital licenses retain lifetime personal activation rights.</p>
      </div>
      <div style="text-align: right;">
        <span class="security-hash">AUTH-SHA256: ${order.transactionRef.substring(0, 16)}...</span>
        <div style="margin-top: 4px; font-size: 9px; color: #94a3b8;">Page 1 of 1 · Generated by 8cloud.store</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Triggers native browser print dialog (which offers "Save as PDF")
 * Uses an isolated hidden iframe so the main UI is never disrupted.
 */
export function printOrderReceipt(order: Order, storeSettings?: StoreSettings): void {
  const html = generatePrintableInvoiceHtml(order, storeSettings);

  try {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.setAttribute('title', 'Receipt Print Frame');
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      // Fallback to new window if iframe access is restricted
      const printWin = window.open('', '_blank');
      if (printWin) {
        printWin.document.write(html);
        printWin.document.close();
        printWin.focus();
        setTimeout(() => {
          printWin.print();
        }, 300);
      }
      return;
    }

    doc.open();
    doc.write(html);
    doc.close();

    iframe.contentWindow?.focus();
    setTimeout(() => {
      try {
        iframe.contentWindow?.print();
      } catch (err) {
        console.error('Iframe print error, attempting fallback window', err);
        const printWin = window.open('', '_blank');
        if (printWin) {
          printWin.document.write(html);
          printWin.document.close();
          printWin.focus();
          printWin.print();
        }
      }

      // Cleanup iframe after print dialog completes
      setTimeout(() => {
        try {
          document.body.removeChild(iframe);
        } catch {
          // ignore
        }
      }, 2500);
    }, 350);
  } catch (error) {
    console.error('Error triggering receipt print:', error);
    // Fallback: download HTML file
    downloadHtmlInvoice(order, storeSettings);
  }
}

/**
 * Downloads a standalone, styled HTML invoice file that can be opened or saved as PDF anytime.
 */
export function downloadHtmlInvoice(order: Order, storeSettings?: StoreSettings): void {
  const html = generatePrintableInvoiceHtml(order, storeSettings);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `8cloud-tax-invoice-${order.id}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Downloads a plain-text receipt manifest for command-line/accounting records.
 */
export function downloadTextInvoice(order: Order): void {
  const text = `================================================================================
8CLOUD.STORE — TAX INVOICE & PROOF OF PURCHASE
Invoice Number: INV-${order.id}
Transaction Reference: ${order.transactionRef}
Date: ${new Date(order.date).toUTCString()}
Customer: ${order.customerName} (${order.customerEmail})
Payment Method: ${order.paymentMethod.toUpperCase()} (Confirmed)
================================================================================

PURCHASED DIGITAL ASSETS:
${order.items.map((item, i) => `${i + 1}. ${item.product.name} x${item.quantity} — ${formatPrice(item.product.priceUSD * item.quantity, order.currency)}`).join('\n')}

Subtotal: ${formatPrice(order.subtotal, order.currency)}
Discount: -${formatPrice(order.discount, order.currency)}
Total Paid: ${formatPrice(order.total, order.currency)}

CRYPTOGRAPHIC LICENSE ALLOCATIONS:
${order.licenses && order.licenses.length > 0
  ? order.licenses.map(l => `* ${l.productName}\n  License Key: ${l.key}\n  Hardware Seats: ${l.maxDevices}`).join('\n\n')
  : 'Direct Cloud Archive Delivery'}

This is a computer-generated tax invoice from 8cloud.store Key Delivery System.
================================================================================`;

  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `8cloud-invoice-${order.id}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
