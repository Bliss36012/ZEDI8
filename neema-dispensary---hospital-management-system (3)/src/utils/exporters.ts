/**
 * Export and Import Utilities for Neema Dispensary
 * Supports Excel (.xls / .csv), Word (.doc), PowerPoint (.ppt), and JSON/CSV import
 */

export function downloadFile(content: string, fileName: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports data table to Excel (.xls HTML Spreadsheet format which opens cleanly in MS Excel with styling)
 */
export function exportToExcel(
  filename: string,
  title: string,
  headers: string[],
  rows: (string | number)[][]
) {
  const tableRows = rows
    .map(
      (row) =>
        `<tr>${row
          .map(
            (cell) =>
              `<td style="border: 1px solid #d1d5db; padding: 6px 10px; font-size: 11pt;">${
                cell !== undefined && cell !== null ? String(cell) : ''
              }</td>`
          )
          .join('')}</tr>`
    )
    .join('');

  const tableHeaders = headers
    .map(
      (h) =>
        `<th style="border: 1px solid #9ca3af; background-color: #0d9488; color: #ffffff; padding: 8px 12px; font-weight: bold; text-align: left; font-size: 11pt;">${h}</th>`
    )
    .join('');

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>${title.substring(0, 30)}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
      <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
      <style>
        body { font-family: Calibri, Arial, sans-serif; }
        .header { font-size: 16pt; font-weight: bold; color: #0f766e; margin-bottom: 4px; }
        .subhead { font-size: 10pt; color: #64748b; margin-bottom: 14px; }
      </style>
    </head>
    <body>
      <div class="header">NEEMA DISPENSARY - OFFICIAL REPORT</div>
      <div class="subhead">${title} | Generated: ${new Date().toLocaleString()}</div>
      <table border="1" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
        <thead>
          <tr>${tableHeaders}</tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </body>
    </html>
  `;

  downloadFile(html, `${filename}.xls`, 'application/vnd.ms-excel;charset=utf-8');
}

/**
 * Exports formatted Word (.doc) document with official letterhead, summary cards, and tables
 */
export function exportToWord(
  filename: string,
  title: string,
  subtitle: string,
  sections: { heading: string; paragraphs: string[]; table?: { headers: string[]; rows: (string | number)[][] } }[]
) {
  const sectionsHtml = sections
    .map((sec) => {
      let tableHtml = '';
      if (sec.table) {
        const ths = sec.table.headers
          .map(
            (h) =>
              `<th style="background-color: #0f766e; color: #ffffff; border: 1px solid #115e59; padding: 6px 10px; font-weight: bold;">${h}</th>`
          )
          .join('');
        const trs = sec.table.rows
          .map(
            (row) =>
              `<tr>${row
                .map(
                  (c) =>
                    `<td style="border: 1px solid #cbd5e1; padding: 5px 8px; font-size: 10pt;">${c}</td>`
                )
                .join('')}</tr>`
          )
          .join('');
        tableHtml = `<table style="width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 16px;"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`;
      }

      const paras = sec.paragraphs
        .map((p) => `<p style="font-size: 11pt; line-height: 1.5; color: #1e293b; margin-bottom: 6px;">${p}</p>`)
        .join('');

      return `
        <div style="margin-top: 18px; margin-bottom: 14px;">
          <h2 style="color: #0f766e; border-bottom: 2px solid #14b8a6; padding-bottom: 4px; font-size: 14pt; font-weight: bold;">${sec.heading}</h2>
          ${paras}
          ${tableHtml}
        </div>
      `;
    })
    .join('');

  const wordContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        body { font-family: 'Segoe UI', Calibri, Arial, sans-serif; margin: 40px; }
        .hospital-header { border-bottom: 3px double #0f766e; padding-bottom: 12px; margin-bottom: 20px; text-align: center; }
        .hospital-name { font-size: 22pt; font-weight: bold; color: #0d9488; letter-spacing: 1px; }
        .hospital-tagline { font-size: 11pt; color: #475569; }
        .meta-stamp { font-size: 9pt; color: #64748b; margin-top: 4px; }
      </style>
    </head>
    <body>
      <div class="hospital-header">
        <div class="hospital-name">ZAHANATI YA NEEMA - NEEMA DISPENSARY</div>
        <div class="hospital-tagline">Huduma Bora za Afya kwa Jamii | Jamhuri ya Muungano wa Tanzania</div>
        <div style="font-size: 10pt; color: #334155; margin-top: 2px;">Nyamongo, Wilaya ya Tarime, Mkoa wa Mara, Tanzania | Simu / WhatsApp ya Mmiliki: 0763503097</div>
        <div class="meta-stamp">Nyaraka: ${title} | Maelezo: ${subtitle} | Tarehe: ${new Date().toLocaleDateString()}</div>
      </div>
      ${sectionsHtml}
      <div style="margin-top: 40px; border-top: 1px solid #cbd5e1; padding-top: 16px; font-size: 10pt; display: flex; justify-content: space-between;">
        <div>
          <p><strong>Prepared by:</strong> Automated Hospital System</p>
          <p><strong>Verification Code:</strong> ND-AUD-${Math.floor(100000 + Math.random() * 900000)}</p>
        </div>
        <div>
          <p><strong>Approved by:</strong> Hospital Medical Director / Manager</p>
          <p><strong>Status:</strong> Certified & Audited</p>
        </div>
      </div>
    </body>
    </html>
  `;

  downloadFile(wordContent, `${filename}.doc`, 'application/msword;charset=utf-8');
}

/**
 * Exports PowerPoint presentation (.ppt XML/HTML slide package)
 */
export function exportToPowerPoint(
  filename: string,
  presentationTitle: string,
  slides: {
    title: string;
    subtitle?: string;
    category?: string;
    bulletPoints: string[];
    metrics?: { label: string; value: string }[];
    speakerNotes?: string;
  }[]
) {
  const slideHtmls = slides
    .map(
      (slide, idx) => `
    <div style="page-break-after: always; width: 850px; min-height: 520px; padding: 40px; background: #ffffff; border: 2px solid #cbd5e1; border-radius: 8px; margin-bottom: 24px; box-sizing: border-box; font-family: 'Segoe UI', Arial, sans-serif;">
      <div style="border-bottom: 3px solid #0d9488; padding-bottom: 10px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: baseline;">
        <div>
          ${slide.category ? `<div style="font-size: 9pt; font-weight: bold; color: #0d9488; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">${slide.category}</div>` : ''}
          <span style="font-size: 19pt; font-weight: bold; color: #0f766e;">${slide.title}</span>
        </div>
        <span style="font-size: 10pt; color: #94a3b8; font-weight: bold;">Slide ${idx + 1} of ${slides.length}</span>
      </div>
      ${slide.subtitle ? `<div style="font-size: 12pt; color: #475569; margin-bottom: 18px; font-style: italic;">${slide.subtitle}</div>` : ''}
      
      ${
        slide.metrics && slide.metrics.length > 0
          ? `<div style="display: flex; gap: 14px; margin-bottom: 20px;">
              ${slide.metrics
                .map(
                  (m) =>
                    `<div style="flex: 1; background: #f0fdfa; border: 1px solid #99f6e4; padding: 12px 16px; border-radius: 8px; text-align: center;">
                      <div style="font-size: 8.5pt; color: #0f766e; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">${m.label}</div>
                      <div style="font-size: 17pt; font-weight: bold; color: #115e59; margin-top: 4px;">${m.value}</div>
                    </div>`
                )
                .join('')}
             </div>`
          : ''
      }

      <ul style="font-size: 12pt; line-height: 1.85; color: #1e293b; padding-left: 24px; margin-bottom: 20px;">
        ${slide.bulletPoints.map((bp) => `<li style="margin-bottom: 8px;">${bp}</li>`).join('')}
      </ul>

      ${
        slide.speakerNotes
          ? `<div style="margin-top: 16px; background: #f8fafc; border-left: 4px solid #0d9488; padding: 10px 14px; font-size: 10pt; color: #334155; border-radius: 0 6px 6px 0;">
              <strong style="color: #0f766e;">Vidokezo vya Mzungumzaji (Presenter Notes):</strong> ${slide.speakerNotes}
            </div>`
          : ''
      }

      <div style="margin-top: 24px; font-size: 9pt; color: #94a3b8; display: flex; justify-content: space-between; border-top: 1px solid #f1f5f9; padding-top: 8px;">
        <span>Neema Dispensary Health Information Management System (HMIS)</span>
        <span>Jamhuri ya Muungano wa Tanzania</span>
      </div>
    </div>`
    )
    .join('');

  const pptContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:p='urn:schemas-microsoft-com:office:powerpoint' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>${presentationTitle}</title>
      <style>
        body { background: #f8fafc; padding: 20px; font-family: 'Segoe UI', Arial, sans-serif; }
      </style>
    </head>
    <body>
      <!-- TITLE SLIDE -->
      <div style="page-break-after: always; width: 800px; min-height: 480px; padding: 60px 40px; background: linear-gradient(135deg, #0f766e 0%, #115e59 100%); color: #ffffff; margin-bottom: 24px; box-sizing: border-box; text-align: center;">
        <div style="font-size: 14pt; letter-spacing: 2px; text-transform: uppercase; opacity: 0.9; margin-bottom: 10px;">Neema Dispensary Executive Briefing</div>
        <div style="font-size: 26pt; font-weight: bold; margin-bottom: 12px; line-height: 1.2;">${presentationTitle}</div>
        <div style="font-size: 14pt; opacity: 0.85; margin-bottom: 40px;">Operations, Financial Performance & Clinical Governance</div>
        <div style="font-size: 11pt; border-top: 1px solid rgba(255,255,255,0.3); padding-top: 16px; display: inline-block;">
          Presented to Hospital Board & Department Heads | Date: ${new Date().toLocaleDateString()}
        </div>
      </div>
      ${slideHtmls}
    </body>
    </html>
  `;

  downloadFile(pptContent, `${filename}.ppt`, 'application/vnd.ms-powerpoint;charset=utf-8');
}

/**
 * Parse CSV file contents into array of objects
 */
export function parseCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.trim().split(/\r\n|\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
  const results: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const currentLine = lines[i];
    if (!currentLine.trim()) continue;

    // Handle quoted values with commas
    const row: string[] = [];
    let insideQuote = false;
    let entry = '';

    for (let c = 0; c < currentLine.length; c++) {
      const char = currentLine[c];
      if (char === '"' || char === "'") {
        insideQuote = !insideQuote;
      } else if (char === ',' && !insideQuote) {
        row.push(entry.trim().replace(/^["']|["']$/g, ''));
        entry = '';
      } else {
        entry += char;
      }
    }
    row.push(entry.trim().replace(/^["']|["']$/g, ''));

    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      obj[h] = row[idx] || '';
    });
    results.push(obj);
  }

  return results;
}
