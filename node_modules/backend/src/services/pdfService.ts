import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

export async function generateReportPdf(report: any): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // 1. Header
      doc.fontSize(20).text('FEMFLOU Clinical Report', { align: 'center' });
      doc.moveDown();

      // 2. Patient Details
      const patient = report.sample.patient.user;
      doc.fontSize(12).text(`Patient Name: ${patient.name}`);
      doc.text(`Patient ID: ${patient.id}`);
      doc.text(`Report Date: ${new Date(report.createdAt).toLocaleString()}`);
      doc.text(`Overall Risk Score: ${report.overallRiskScore.toFixed(2)}%`);
      if (report.isAlert) {
        doc.fillColor('red').text('STATUS: CRITICAL ALERT').fillColor('black');
      }
      doc.moveDown();

      // 3. AI Summary
      doc.fontSize(14).text('AI Summary', { underline: true });
      doc.fontSize(10).text(report.aiSummary);
      doc.moveDown();

      // 4. Biomarker Table (mock grid)
      doc.fontSize(14).text('Biomarker Results', { underline: true });
      doc.moveDown(0.5);
      
      const startY = doc.y;
      doc.fontSize(10).text('Biomarker', 50, startY);
      doc.text('Value', 200, startY);
      doc.text('Status', 350, startY);
      
      let currentY = startY + 20;
      for (const b of report.sample.biomarkerResults) {
        doc.text(b.biomarkerType, 50, currentY);
        doc.text(`${b.measuredValue} ${b.unit}`, 200, currentY);
        doc.text(b.riskStatus, 350, currentY);
        currentY += 20;
      }
      doc.y = currentY;
      doc.moveDown(2);

      // 5. Clinical Observations & Signature
      doc.fontSize(14).text('Clinical Observations', { underline: true });
      doc.fontSize(10).text('___________________________________________________________________');
      doc.text('___________________________________________________________________');
      doc.moveDown(2);
      
      doc.text('Doctor Signature: _______________________      Date: ______________', { align: 'right' });
      doc.moveDown(2);

      // 6. QR Code Verification
      const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify/${report.id}`;
      const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 100 });
      // Remove the "data:image/png;base64," prefix
      const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, '');
      const imgBuffer = Buffer.from(base64Data, 'base64');
      
      doc.image(imgBuffer, 50, doc.y, { width: 100 });
      doc.text('Scan to verify authenticity', 50, doc.y + 105);
      doc.moveDown(2);

      // 7. Medical Disclaimer
      const disclaimer = "FEMFLOU is an AI-assisted maternal health screening platform intended for preliminary screening and health monitoring. It does not diagnose medical conditions and should not be used as a substitute for professional medical evaluation, diagnosis, or treatment. Always consult a qualified healthcare provider for clinical decisions.";
      doc.fontSize(8).fillColor('gray').text(disclaimer, 50, 700, { align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
