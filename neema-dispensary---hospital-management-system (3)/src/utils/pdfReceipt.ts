/**
 * Utility for generating and printing official PDF receipts for Neema Dispensary
 * Location: Nyamongo, Tarime, Tanzania
 * Contact / M-Pesa: 0763503097
 */

import { OWNER_PHONE_NUMBER, HOSPITAL_LOCATION } from './whatsapp';

export interface ReceiptData {
  receiptNumber: string;
  patientName: string;
  opdNumber: string;
  date: string;
  time?: string;
  items: Array<{
    description: string;
    quantity: number;
    amount: number;
  }>;
  totalAmount: number;
  patientPayable: number;
  amountPaid?: number;
  dueAmount?: number;
  paymentStatus?: string;
  insuranceCovered?: number;
  paymentMethod: string;
  splitPayments?: Array<{
    method: string;
    amount: number;
    reference?: string;
  }>;
  referenceCode?: string;
  cashierName: string;
  department?: string;
}

export function generateReceiptHtml(data: ReceiptData): string {
  const itemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 6px 4px; border-bottom: 1px solid #e2e8f0; font-size: 11px;">${item.description}</td>
        <td style="padding: 6px 4px; border-bottom: 1px solid #e2e8f0; text-align: center; font-size: 11px; font-weight: bold;">${item.quantity}</td>
        <td style="padding: 6px 4px; border-bottom: 1px solid #e2e8f0; text-align: right; font-size: 11px; font-family: monospace;">TZS ${item.amount.toLocaleString()}</td>
      </tr>
    `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="sw">
    <head>
      <meta charset="utf-8">
      <title>Risiti ya Malipo - ${data.receiptNumber}</title>
      <style>
        @page {
          size: 80mm auto;
          margin: 4mm;
        }
        @media print {
          body {
            margin: 0;
            padding: 0;
            background: white;
            color: black;
          }
          .no-print {
            display: none !important;
          }
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          font-size: 11px;
          line-height: 1.4;
          color: #1e293b;
          max-width: 80mm;
          margin: 0 auto;
          padding: 8px;
          background: #ffffff;
        }
        .header {
          text-align: center;
          border-bottom: 2px dashed #0f766e;
          padding-bottom: 8px;
          margin-bottom: 8px;
        }
        .hospital-title {
          font-size: 15px;
          font-weight: 900;
          letter-spacing: 0.5px;
          color: #0f766e;
          margin: 0;
        }
        .hospital-subtitle {
          font-size: 9px;
          font-weight: bold;
          color: #475569;
          margin: 2px 0;
        }
        .meta-line {
          font-size: 8.5px;
          color: #64748b;
        }
        .receipt-badge {
          display: inline-block;
          background: #f0fdf4;
          border: 1px solid #86efac;
          color: #166534;
          font-size: 9px;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 4px;
          margin-top: 4px;
        }
        .details-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 8px;
          font-size: 10.5px;
        }
        .details-table td {
          padding: 2px 0;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 8px 0;
        }
        .items-table th {
          border-bottom: 1.5px solid #0f766e;
          font-size: 9.5px;
          font-weight: 800;
          text-align: left;
          padding: 4px 2px;
          color: #0f766e;
        }
        .total-box {
          border-top: 1.5px dashed #0f766e;
          border-bottom: 1.5px dashed #0f766e;
          padding: 6px 0;
          margin: 8px 0;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          font-weight: 900;
          color: #0f766e;
        }
        .footer {
          text-align: center;
          font-size: 8.5px;
          color: #64748b;
          margin-top: 10px;
          border-top: 1px solid #e2e8f0;
          padding-top: 6px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 class="hospital-title" style="font-size: 13px;">HOSPITAL MANAGEMENT SYSTEM AT NEEMA</h1>
        <div class="hospital-subtitle">${HOSPITAL_LOCATION}</div>
        <div class="meta-line">Simu / WhatsApp ya Mmiliki: <strong>${OWNER_PHONE_NUMBER}</strong></div>
        <div class="meta-line">Huduma za Afya, Vipimo & Dawa Masaa 24</div>
        ${
          data.patientPayable === 0 && data.insuranceCovered && data.insuranceCovered > 0
            ? '<div class="receipt-badge" style="background: #eff6ff; border: 1px solid #93c5fd; color: #1e40af;">BIMA KAMILI (100% COVERED BY INSURANCE)</div>'
            : data.dueAmount && data.dueAmount > 0
            ? '<div class="receipt-badge" style="background: #fef2f2; border: 1px solid #fca5a5; color: #991b1b;">MALIPO YA NUSU / DENI (PARTIAL PAYMENT)</div>'
            : '<div class="receipt-badge">RISITI RASMI YA MALIPO (PAID)</div>'
        }
      </div>

      <table class="details-table">
        <tr>
          <td><strong>Namba ya Risiti:</strong></td>
          <td style="text-align: right; font-family: monospace; font-weight: bold;">${data.receiptNumber}</td>
        </tr>
        <tr>
          <td><strong>Mgonjwa:</strong></td>
          <td style="text-align: right; font-weight: bold;">${data.patientName}</td>
        </tr>
        <tr>
          <td><strong>Namba ya OPD:</strong></td>
          <td style="text-align: right; font-family: monospace;">${data.opdNumber}</td>
        </tr>
        <tr>
          <td><strong>Tarehe & Saa:</strong></td>
          <td style="text-align: right;">${data.date} ${data.time ? data.time : ''}</td>
        </tr>
        <tr>
          <td><strong>Idara:</strong></td>
          <td style="text-align: right;">${data.department || 'Billing & Revenue'}</td>
        </tr>
      </table>

      <table class="items-table">
        <thead>
          <tr>
            <th>Maelezo ya Huduma / Dawa</th>
            <th style="text-align: center;">Idadi</th>
            <th style="text-align: right;">Kiasi</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div class="total-box">
        <div style="display: flex; justify-content: space-between; font-size: 10px; color: #475569; margin-bottom: 2px;">
          <span>Jumla Kuu (Gross Total):</span>
          <span style="font-family: monospace; font-weight: bold;">TZS ${data.totalAmount.toLocaleString()}</span>
        </div>
        ${
          data.insuranceCovered && data.insuranceCovered > 0
            ? `
          <div style="display: flex; justify-content: space-between; font-size: 10px; color: #2563eb; margin-bottom: 4px;">
            <span>Bima / NHIF / SITL:</span>
            <span style="font-family: monospace; font-weight: bold;">- TZS ${data.insuranceCovered.toLocaleString()}</span>
          </div>
        `
            : ''
        }
        <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 800; color: #334155; margin-bottom: 2px;">
          <span>Kiasi Kinachopaswa Kulipwa:</span>
          <span style="font-family: monospace;">TZS ${data.patientPayable.toLocaleString()}</span>
        </div>
        <div class="total-row" style="margin-top: 4px; padding-top: 4px; border-top: 1px dotted #0f766e;">
          <span>Kiasi Kilicholipwa (Paid):</span>
          <span>TZS ${(data.amountPaid ?? data.patientPayable).toLocaleString()}</span>
        </div>
        ${
          data.dueAmount && data.dueAmount > 0
            ? `
          <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 900; color: #dc2626; margin-top: 4px; padding-top: 4px; border-top: 1px dashed #f87171;">
            <span>Salio Linalodaiwa (Due Balance):</span>
            <span>TZS ${data.dueAmount.toLocaleString()}</span>
          </div>
        `
            : ''
        }
      </div>

      <div style="font-size: 9.5px; margin: 4px 0;">
        <div><strong>Njia ya Malipo:</strong> ${data.paymentMethod}</div>
        ${
          data.splitPayments && data.splitPayments.length > 0
            ? `
          <div style="margin: 4px 0; padding: 4px 6px; background: #f8fafc; border-radius: 4px; border: 1px solid #e2e8f0;">
            <div style="font-weight: bold; color: #475569; margin-bottom: 2px;">Mchanganuo wa Njia za Malipo:</div>
            ${data.splitPayments
              .map(
                (p) => `
              <div style="display: flex; justify-content: space-between; font-size: 9px;">
                <span>• ${p.method} ${p.reference ? '(' + p.reference + ')' : ''}</span>
                <span style="font-family: monospace; font-weight: bold;">TZS ${p.amount.toLocaleString()}</span>
              </div>
            `
              )
              .join('')}
          </div>
        `
            : ''
        }
        ${data.referenceCode ? `<div><strong>Kumbukumbu / Ref:</strong> ${data.referenceCode}</div>` : ''}
        <div><strong>Mpokea Malipo:</strong> ${data.cashierName}</div>
      </div>

      <div class="footer">
        <p style="margin: 2px 0;">Asante kwa kuchagua Hospital Management System at Neema kwa afya yako.</p>
        <p style="margin: 2px 0;">Nyamongo, Tarime, Mara • Simu ya Mmiliki: ${OWNER_PHONE_NUMBER}</p>
        <p style="margin: 2px 0; font-family: monospace; font-size: 7.5px;">Hati imethibitishwa kidijitali • ND-${Date.now().toString().slice(-8)}</p>
      </div>

      <script>
        window.onload = function() {
          window.focus();
          window.print();
        }
      </script>
    </body>
    </html>
  `;
}

/**
 * Triggers direct browser printing of a receipt formatted for PDF saving or physical thermal printer
 */
export function printReceiptPdf(data: ReceiptData) {
  const html = generateReceiptHtml(data);
  const printWindow = window.open('', '_blank', 'width=450,height=650');

  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  } else {
    // If popup is blocked, create an invisible iframe to print directly
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1500);
      }, 300);
    }
  }
}

/**
 * Downloads a standalone printable PDF/HTML receipt file to the device
 */
export function downloadReceiptPdfFile(data: ReceiptData) {
  const html = generateReceiptHtml(data);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Risiti_Neema_Dispensary_${data.receiptNumber || 'REC'}.html`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}
