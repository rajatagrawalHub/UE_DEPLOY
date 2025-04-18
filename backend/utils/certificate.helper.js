const PDFDocument = require("pdfkit");
const { PassThrough } = require("stream");

exports.createCertificatePDF = (name, eventTitle) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 50 });
    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    doc.fillColor("#1c1c1c");
    doc.fontSize(28).font("Helvetica-Bold").text("Certificate of Participation", { align: "center" });

    doc.moveDown(2);
    doc.fontSize(16).font("Helvetica").text(`This certifies that`, { align: "center" });

    doc.moveDown();
    doc.fontSize(24).font("Helvetica-Bold").fillColor("#003366").text(name, { align: "center", underline: true });

    doc.moveDown();
    doc.fontSize(16).fillColor("#1c1c1c").font("Helvetica").text("has participated in the event titled:", { align: "center" });

    doc.moveDown();
    doc.fontSize(18).font("Helvetica-Oblique").fillColor("#003366").text(eventTitle, { align: "center" });

    doc.moveDown(3);
    doc.fontSize(12).fillColor("#666").text(`Date: ${new Date().toLocaleDateString()}`, { align: "right" });

    doc.end();
  });
};