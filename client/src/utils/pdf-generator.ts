import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Fix for TypeScript type definitions with jspdf-autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => any;
    lastAutoTable: { finalY: number };
  }
}

interface ReceiptData {
  buyerName: string;
  sellerName: string;
  productTitle: string;
  price: number;
  date: Date;
  transactionId: string;
  additionalItems?: Array<{
    title: string;
    price: number;
  }>;
}

export async function generateReceipt(data: ReceiptData): Promise<Blob> {
  // Create new PDF document
  const doc = new jsPDF();
  
  // Add receipt title
  doc.setFontSize(22);
  doc.setTextColor(79, 70, 229); // primary color
  doc.text('UniMarket Receipt', 105, 20, { align: 'center' });
  
  // Add date and transaction ID
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Transaction Date: ${data.date.toLocaleDateString()}`, 20, 35);
  doc.text(`Transaction ID: ${data.transactionId}`, 20, 40);
  
  // Add transaction parties
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Buyer:', 20, 55);
  doc.text(data.buyerName, 60, 55);
  
  doc.text('Seller:', 20, 62);
  doc.text(data.sellerName, 60, 62);
  
  // Add line separator
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 70, 190, 70);
  
  // Add purchased items table
  const tableColumns = [
    { header: 'Item', dataKey: 'item' },
    { header: 'Price', dataKey: 'price' }
  ];
  
  const tableRows = [
    { item: data.productTitle, price: `$${(data.price / 100).toFixed(2)}` }
  ];
  
  // Add additional items if present
  if (data.additionalItems && data.additionalItems.length > 0) {
    data.additionalItems.forEach(item => {
      tableRows.push({
        item: item.title,
        price: `$${(item.price / 100).toFixed(2)}`
      });
    });
  }
  
  // @ts-ignore - jspdf-autotable is difficult to properly type with TS
  doc.autoTable({
    startY: 80,
    head: [tableColumns.map(col => col.header)],
    body: tableRows.map(row => [row.item, row.price]),
    theme: 'grid',
    headStyles: {
      fillColor: [79, 70, 229], // primary color
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
  });
  
  // Calculate total
  let total = data.price;
  if (data.additionalItems) {
    data.additionalItems.forEach(item => {
      total += item.price;
    });
  }
  
  // Add total
  const finalY = (doc as any).lastAutoTable.finalY || 120;
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Total:', 150, finalY + 10);
  doc.setFont(undefined, 'bold');
  doc.text(`$${(total / 100).toFixed(2)}`, 175, finalY + 10);
  
  // Add thank you message
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Thank you for using UniMarket!', 105, finalY + 25, { align: 'center' });
  
  // Add terms and conditions
  doc.setFontSize(8);
  doc.text('This receipt serves as proof of purchase. UniMarket is not responsible for the condition or description of the purchased item.', 105, finalY + 35, { align: 'center' });
  
  // Return PDF as blob
  return doc.output('blob');
}

export async function downloadReceipt(data: ReceiptData): Promise<void> {
  const pdfBlob = await generateReceipt(data);
  const pdfUrl = URL.createObjectURL(pdfBlob);
  
  // Create download link
  const downloadLink = document.createElement('a');
  downloadLink.href = pdfUrl;
  downloadLink.download = `UniMarket_Receipt_${data.transactionId}.pdf`;
  
  // Trigger download
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  
  // Clean up
  URL.revokeObjectURL(pdfUrl);
}
