import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Injectable({
  providedIn: 'root'
})
export class PdfStatementService {

  public generateStatement(business: any, customer: any, transactions: any[]): void {
    this.loadImageAsBase64('assets/hisab logo.png').then(logoBase64 => {
      this.buildPdf(logoBase64, business, customer, transactions);
    }).catch(() => {
      this.buildPdf(null, business, customer, transactions);
    });
  }

  // ─────────────────────────────────────────
  // IMAGE LOADER
  // ─────────────────────────────────────────

  private loadImageAsBase64(src: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject('no ctx'); return; }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => reject('load error');
      img.src = src;
    });
  }

  // ─────────────────────────────────────────
  // PDF BUILDER
  // ─────────────────────────────────────────

  private buildPdf(logoBase64: string | null, business: any, customer: any, transactions: any[]): void {
    const doc = new jsPDF();

    const primaryGreen: [number, number, number] = [4, 57, 39];
    const redAccent: [number, number, number] = [220, 38, 38];
    const greenAccent: [number, number, number] = [5, 150, 105];
    const textGray: [number, number, number] = [107, 114, 128];

    // ─── HEADER BANNER ───────────────────────
    doc.setFillColor(...primaryGreen);
    doc.rect(0, 0, 210, 40, 'F');

    // Logo image (left side in banner)
    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', 10, 6, 28, 28);
    }

    // App name next to logo
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Hisab', logoBase64 ? 42 : 14, 22);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Smart POS & Ledger', logoBase64 ? 42 : 14, 29);

    // Business info (right side of banner)
    const bName = business?.businessName || '';
    if (bName) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(bName, 196, 18, { align: 'right' });
    }
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    let byPos = bName ? 24 : 18;
    if (business?.phone) {
      doc.text(`Phone: ${business.phone}`, 196, byPos, { align: 'right' });
      byPos += 5;
    }
    if (business?.address) {
      doc.text(`${business.address}`, 196, byPos, { align: 'right' });
    }

    // ─── CUSTOMER DETAILS ────────────────────
    doc.setTextColor(17, 24, 39);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Customer Statement', 14, 52);

    const reportDate = new Date().toLocaleDateString('en-PK', { dateStyle: 'medium' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textGray);
    doc.text(`Date: ${reportDate}`, 196, 52, { align: 'right' });

    doc.setTextColor(17, 24, 39);
    doc.setFont('helvetica', 'bold');
    doc.text('Name:', 14, 60);
    doc.setFont('helvetica', 'normal');
    doc.text(customer.name, 32, 60);

    doc.setFont('helvetica', 'bold');
    doc.text('Phone:', 14, 66);
    doc.setFont('helvetica', 'normal');
    doc.text(customer.phone, 32, 66);

    if (customer.address) {
      doc.setFont('helvetica', 'bold');
      doc.text('Address:', 14, 72);
      doc.setFont('helvetica', 'normal');
      doc.text(customer.address, 34, 72);
    }

    // ─── BALANCE SUMMARY BOX ─────────────────
    const yBalance = customer.address ? 78 : 72;
    doc.setFillColor(243, 244, 246);
    doc.setDrawColor(209, 213, 219);
    doc.rect(14, yBalance, 182, 22, 'FD');

    doc.setTextColor(...textGray);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Udhaar Given',      44, yBalance + 7, { align: 'center' });
    doc.text('Payments Received', 105, yBalance + 7, { align: 'center' });
    doc.text('Net Balance',       166, yBalance + 7, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');

    doc.setTextColor(...redAccent);
    doc.text(`Rs. ${(customer.totalUdhaar ?? 0).toLocaleString()}`, 44, yBalance + 16, { align: 'center' });

    doc.setTextColor(...greenAccent);
    doc.text(`Rs. ${(customer.totalReceived ?? 0).toLocaleString()}`, 105, yBalance + 16, { align: 'center' });

    doc.setTextColor(...primaryGreen);
    doc.text(`Rs. ${(customer.netBalance ?? 0).toLocaleString()}`, 166, yBalance + 16, { align: 'center' });

    // ─── TRANSACTIONS TABLE ───────────────────
    const tableData = transactions.map(tx => [
      tx.timestamp,
      tx.title,
      tx.description || '--',
      tx.type === 'UDHAAR' ? `Rs. ${tx.amount.toLocaleString()}` : '--',
      tx.type === 'PAYMENT' ? `Rs. ${tx.amount.toLocaleString()}` : '--'
    ]);

    autoTable(doc, {
      startY: yBalance + 30,
      head: [['Date / Time', 'Type', 'Notes', 'Udhaar (-)', 'Payment (+)']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: primaryGreen,
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'left'
      },
      styles: {
        fontSize: 8.5,
        cellPadding: 4,
        textColor: [55, 65, 81],
        lineColor: [209, 213, 219],
        lineWidth: 0.1,
        overflow: 'linebreak',
      },
      columnStyles: {
        0: { cellWidth: 36 },
        1: { cellWidth: 30 },
        2: { cellWidth: 'auto' },
        3: { textColor: redAccent,   fontStyle: 'bold', halign: 'right', cellWidth: 28 },
        4: { textColor: greenAccent, fontStyle: 'bold', halign: 'right', cellWidth: 28 }
      },
      didParseCell: (data) => {
        if (data.section === 'head' && (data.column.index === 3 || data.column.index === 4)) {
          data.cell.styles.halign = 'right';
        }
      },
      didDrawPage: (data) => {
        const str = `Page ${data.pageNumber}`;
        doc.setFontSize(8);
        doc.setTextColor(...textGray);
        doc.text(str, data.settings.margin.left, doc.internal.pageSize.height - 8);
      }
    });

    doc.save(`Hisab_Statement_${customer.name.replace(/\s+/g, '_')}_${reportDate}.pdf`);
  }
}

