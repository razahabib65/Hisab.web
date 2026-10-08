import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Injectable({
  providedIn: 'root'
})
export class PdfStatementService {

  public generateStatement(customer: any, transactions: any[]): void {
    const doc = new jsPDF();

    // ==========================================
    // COLORS & FONTS SETUP
    // ==========================================
    const primaryGreen: [number, number, number] = [4, 57, 39]; // #043927 Hisab Green
    const redAccent: [number, number, number] = [220, 38, 38]; // Udhaar Red
    const greenAccent: [number, number, number] = [5, 150, 105]; // Payment Green
    const textGray: [number, number, number] = [107, 114, 128]; // #6B7280

    // HEADER SECTION
    doc.setFillColor(...primaryGreen);
    doc.rect(0, 0, 210, 40, 'F'); // Top banner (A4 width is 210)

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Hisaab', 14, 25);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Smart POS & Ledger App', 14, 32);

    // STATIC BUSINESS PLACEHOLDER
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Your Business Name Here', 210 - 14, 20, { align: 'right' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Phone: 0+XX XXXXXXXX', 210 - 14, 26, { align: 'right' });
    doc.text('Address: Business Tagline/Address', 210 - 14, 32, { align: 'right' });

    // ==========================================
    // CUSTOMER DETAILS
    // ==========================================
    doc.setTextColor(17, 24, 39); // #111827 Dark gray
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Customer Statement', 14, 52);

    const reportDate = new Date().toLocaleDateString('en-PK', { dateStyle: 'medium' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date of Issue: ${reportDate}`, 210 - 14, 52, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.text(`Name:`, 14, 60);
    doc.setFont('helvetica', 'normal');
    doc.text(customer.name, 30, 60);
    
    doc.setFont('helvetica', 'bold');
    doc.text(`Phone:`, 14, 66);
    doc.setFont('helvetica', 'normal');
    doc.text(customer.phone, 30, 66);

    if (customer.address) {
      doc.setFont('helvetica', 'bold');
      doc.text(`Address:`, 14, 72);
      doc.setFont('helvetica', 'normal');
      doc.text(customer.address, 32, 72);
    }

    // ==========================================
    // BALANCE SUMMARY BOX (COMPACT)
    // ==========================================
    const yBalance = 78;
    doc.setFillColor(243, 244, 246);
    doc.setDrawColor(209, 213, 219);
    doc.rect(14, yBalance, 182, 22, 'FD'); // single compact box

    doc.setTextColor(...textGray);
    doc.setFontSize(9);
    doc.text('Udhaar Given', 44, yBalance + 8, { align: 'center' });
    doc.text('Payments Received', 105, yBalance + 8, { align: 'center' });
    doc.text('Net Balance Remaining', 166, yBalance + 8, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...redAccent);
    doc.text(`Rs. ${customer.totalUdhaar.toLocaleString()}`, 44, yBalance + 16, { align: 'center' });
    
    doc.setTextColor(...greenAccent);
    doc.text(`Rs. ${customer.totalReceived.toLocaleString()}`, 105, yBalance + 16, { align: 'center' });
    
    doc.setTextColor(...primaryGreen);
    doc.text(`Rs. ${customer.netBalance.toLocaleString()}`, 166, yBalance + 16, { align: 'center' });

    // ==========================================
    // TRANSACTIONS TABLE
    // ==========================================
    const tableData = transactions.map(tx => [
      tx.timestamp,
      tx.title,
      tx.description || '--',
      tx.type === 'UDHAAR' ? `Rs. ${tx.amount.toLocaleString()}` : '--',
      tx.type === 'PAYMENT' ? `Rs. ${tx.amount.toLocaleString()}` : '--'
    ]);

    autoTable(doc, {
      startY: yBalance + 28,
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
        fontSize: 9,
        cellPadding: 4.5,
        textColor: [55, 65, 81],
        lineColor: [209, 213, 219],
        lineWidth: 0.1,
      },
      columnStyles: {
        0: { cellWidth: 38 },
        1: { cellWidth: 34 },
        2: { cellWidth: 'auto' },
        3: { textColor: redAccent, fontStyle: 'bold', halign: 'right' },
        4: { textColor: greenAccent, fontStyle: 'bold', halign: 'right' }
      },
      didParseCell: (data) => {
        // Force right alignment for amounts in header too
        if (data.section === 'head' && (data.column.index === 3 || data.column.index === 4)) {
          data.cell.styles.halign = 'right';
        }
      },
      didDrawPage: (data) => {
        // Footer pagination
        const str = 'Page ' + data.pageNumber;
        doc.setFontSize(8);
        doc.setTextColor(...textGray);
        doc.text(str, data.settings.margin.left, doc.internal.pageSize.height - 10);
      }
    });

    // Save PDF
    doc.save(`Hisaab_Statement_${customer.name.replace(/\s+/g, '_')}_${reportDate}.pdf`);
  }
}
