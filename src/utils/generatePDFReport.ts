import { format } from "date-fns";
import PDFDocument from "pdfkit";
import { DownloadCampaignReportResponse } from "../dto";

import path from "path";

// function generateLatexReport(data: DownloadCampaignReportResponse): string {
//   return `
//   \\documentclass{article}
//   \\usepackage{geometry}
//   \\geometry{a4paper, margin=1in}
//   \\usepackage{booktabs}
//   \\usepackage{longtable}
//   \\usepackage{pdflscape}
//   \\usepackage{siunitx}
//   \\usepackage[utf8]{inputenc}
//   \\usepackage[T1]{fontenc}
//   \\usepackage{lmodern}
//   \\usepackage{fancyhdr}
//   \\pagestyle{fancy}
//   \\fancyhead[C]{\\Large \\textbf{Campaign Report: ${data.campaignName.replace(
//     /&/g,
//     "\\&"
//   )}}}
//   \\fancyfoot[C]{\\thepage}
//   \\renewcommand{\\headrulewidth}{0.4pt}
//   \\begin{document}

//   \\section*{Summary}
//   \\begin{tabular}{ll}
//   \\toprule
//   Metric & Value \\\\
//   \\midrule
//   Total Participants & ${data.totalParticipant} \\\\
//   Total Paid Amount & \\$ ${data.totalPaidAmount.toFixed(2)} \\\\
//   Total Unpaid Amount & \\$ ${data.totalUnpaidAmount.toFixed(2)} \\\\
//   Start Date & ${format(data.startDate, "yyyy-MM-dd")} \\\\
//   End Date & ${format(data.endDate, "yyyy-MM-dd")} \\\\
//   \\bottomrule
//   \\end{tabular}

//   \\begin{landscape}
//   \\section*{Participants}
//   \\begin{longtable}{p{3cm}p{3cm}p{2cm}p{2cm}p{2cm}p{3cm}p{2cm}p{2cm}p{2cm}p{2cm}}
//   \\toprule
//   ID & Full Name & Gender & Payment Method & Phone Number & Account Number & Verified & Urban Days & Rural Days & Total Amount \\\\
//   \\midrule
//   \\endhead
//   ${data.campaignParticipants
//     .map(
//       (cp) =>
//         `${cp.id} & ${cp.fullName.replace(/&/g, "\\&")} & ${cp.Gender} & ${
//           cp.paymentMethod
//         } & ${cp.phoneNumber || "N/A"} & ${cp.accountNumber || "N/A"} & ${
//           cp.isVerified ? "Yes" : "No"
//         } & ${cp.urbanDays} & ${cp.ruralDays} & \\$ ${cp.totalAmount.toFixed(
//           2
//         )} \\\\`
//     )
//     .join("\n")}
//   \\bottomrule
//   \\end{longtable}
//   \\end{landscape}
//   \\end{document}
//   `;
// }

// async function generatePDFReport(
//   data: DownloadCampaignReportResponse
// ): Promise<Buffer> {
//   return new Promise((resolve, reject) => {
//     const doc = new PDFDocument({ size: "A4", margin: 50 });
//     const buffers: Buffer[] = [];

//     doc.on("data", buffers.push.bind(buffers));
//     doc.on("end", () => resolve(Buffer.concat(buffers)));
//     doc.on("error", reject);

//     doc.registerFont("Arial", "Helvetica");
//     doc.registerFont("Arial-Bold", "Helvetica-Bold");

//     // === Header ===
//     const drawHeader = () => {
//       doc
//         .font("Arial-Bold")
//         .fontSize(16)
//         .fillColor("#004080")
//         .text(`Campaign Report: ${data.campaignName}`, 50, 30, {
//           align: "center",
//         });
//       doc.moveTo(50, 50).lineTo(550, 50).strokeColor("#004080").stroke();
//       doc.moveDown(1.5);
//     };
//     drawHeader();

//     // === Summary Section ===
//     doc.font("Arial-Bold").fontSize(14).fillColor("black").text("Summary", {
//       underline: true,
//     });
//     doc.moveDown(0.5);
//     doc.font("Arial").fontSize(10);

//     const summaryTable = [
//       ["Metric", "Value"],
//       ["Total Participants", data.totalParticipant.toString()],
//       ["Total Paid Amount", `$ ${data.totalPaidAmount.toFixed(2)}`],
//       ["Total Unpaid Amount", `$ ${data.totalUnpaidAmount.toFixed(2)}`],
//       ["Start Date", format(data.startDate, "yyyy-MM-dd")],
//       ["End Date", format(data.endDate, "yyyy-MM-dd")],
//     ];

//     let y = doc.y + 1;
//     summaryTable.forEach((row, i) => {
//       doc
//         .font(i === 0 ? "Arial-Bold" : "Arial")
//         .text(row[0], 50, y, { width: 200 });
//       doc.text(row[1], 250, y, { width: 300 });
//       y += 20;
//     });

//     doc.moveDown(2);

//     // === Participants Section ===
//     const participantHeaders = [
//       "Full Name",
//       "Gender",
//       "Payment Method",
//       "Phone Number",
//       "Account Number",
//       "Verified",
//       "Urban Days",
//       "Rural Days",
//       "Total Amount",
//     ];

//     // Adjusted to total width = 500
//     const columnWidths = [80, 50, 80, 70, 70, 40, 50, 50, 55];
//     const rowHeight = 20;

//     let currentY = doc.y;

//     const drawTableHeader = () => {
//       let x = 10;
//       doc.font("Arial-Bold").fontSize(8);
//       participantHeaders.forEach((header, i) => {
//         doc
//           .rect(x, currentY, columnWidths[i], rowHeight)
//           .fillAndStroke("#cccccc", "#000000")
//           .fillColor("black")
//           .text(header, x + 2, currentY + 5, {
//             width: columnWidths[i] - 4,
//             align: "left",
//           });
//         x += columnWidths[i];
//       });
//       currentY += rowHeight;
//     };

//     doc
//       .font("Arial-Bold")
//       .fontSize(12)
//       .fillColor("black")
//       .text("Participants", {
//         underline: true,
//       });
//     doc.moveDown(0.5);
//     currentY = doc.y;
//     drawTableHeader();

//     data.campaignParticipants.forEach((cp, index) => {
//       if (currentY + rowHeight > 750) {
//         doc.addPage();
//         currentY = 50;
//         drawHeader();
//         doc
//           .font("Arial-Bold")
//           .fontSize(14)
//           .fillColor("black")
//           .text("Participants (Continued)", 50, currentY, {
//             underline: true,
//           });
//         currentY = doc.y + 10;
//         drawTableHeader();
//       }

//       if (index % 2 === 0) {
//         doc.rect(50, currentY, 500, rowHeight).fill("#f2f2f2");
//       }

//       const rowData = [
//         cp.fullName,
//         cp.Gender,
//         cp.paymentMethod,
//         cp.phoneNumber || "N/A",
//         cp.accountNumber || "N/A",
//         cp.isVerified ? "Yes" : "No",
//         cp.urbanDays.toString(),
//         cp.ruralDays.toString(),
//         `ETB ${cp.totalAmount.toFixed(2)}`,
//       ];

//       let x = 10;
//       rowData.forEach((cellText, i) => {
//         doc
//           .fillColor("black")
//           .font("Arial")
//           .fontSize(8)
//           .text(cellText, x + 2, currentY + 5, {
//             width: columnWidths[i] - 4,
//             align: "left",
//             height: rowHeight,
//           });
//         doc.rect(x, currentY, columnWidths[i], rowHeight).stroke();
//         x += columnWidths[i];
//       });

//       currentY += rowHeight;
//     });

//     doc.end();
//   });
// }

// async function generatePDFReport(
//   data: DownloadCampaignReportResponse
// ): Promise<Buffer> {
//   return new Promise((resolve, reject) => {
//     const doc = new PDFDocument({ size: "A4", margin: 50 });
//     const buffers: Buffer[] = [];

//     doc.on("data", buffers.push.bind(buffers));
//     doc.on("end", () => resolve(Buffer.concat(buffers)));
//     doc.on("error", reject);

//     doc.registerFont("Arial", "Helvetica");
//     doc.registerFont("Arial-Bold", "Helvetica-Bold");

//     // === Top Header: Bank Name & Coopayroll ===
//     // const drawHeader = () => {
//     //   doc
//     //     .font("Arial-Bold")
//     //     .fontSize(12)
//     //     .fillColor("#000000")
//     //     .text("Cooperative Bank of Oromia S.C.", 50, 20, { align: "left" })
//     //     .text("Coopayroll", 50, 36, { align: "left" });

//     //   doc.moveTo(50, 50).lineTo(550, 50).strokeColor("#004080").stroke();
//     //   doc.moveDown(1.5);
//     // };

//     const drawHeader = () => {
//       // Left-side text
//       doc
//         .font("Arial-Bold")
//         .fontSize(14)
//         .fillColor("#00AEEF")
//         .text("Cooperative Bank of Oromia S.C.", 50, 20, { align: "left" })
//         .text("Coopayroll", 50, 36, { align: "left" });

//       // Right-side logo
//       try {
//         const logoPath = path.resolve(__dirname, "../assets/logo.png");
//         doc.image(logoPath, 450, 20, { width: 80 });
//         // doc.image("../assets/logo.png", 450, 20, { width: 80 }); // adjust path and width as needed
//       } catch (e) {
//         console.log("dkdkdkkddkdkkdkdkdkdkdk");
//         // console.error("Logo image failed to load:", e.message);
//       }
//       const underlineY = 38 + 18;
//       // Divider line
//       // doc.moveTo(50, 50).lineTo(550, 50).strokeColor("#000000").stroke();
//       doc
//         .moveTo(50, underlineY)
//         .lineTo(550, underlineY)
//         // .strokeColor(headerColor)
//         .stroke();
//       doc.moveDown(1.5);
//     };

//     drawHeader();

//     // === Campaign Title ===
//     doc.moveDown(2);
//     doc
//       .font("Arial-Bold")
//       .fontSize(16)
//       .fillColor("#004080")
//       .text(`Campaign Report: ${data.campaignName}`, { align: "center" });
//     doc.moveDown(1);

//     // === Summary Section ===
//     doc
//       .font("Arial-Bold")
//       .fontSize(14)
//       .fillColor("black")
//       .text("Summary", { underline: true });
//     doc.moveDown(0.5);
//     doc.font("Arial").fontSize(10);

//     const summaryTable = [
//       ["Metric", "Value"],
//       ["Total Participants", data.totalParticipant.toString()],
//       ["Total Paid Amount", `$ ${data.totalPaidAmount.toFixed(2)}`],
//       ["Total Unpaid Amount", `$ ${data.totalUnpaidAmount.toFixed(2)}`],
//       ["Start Date", format(data.startDate, "yyyy-MM-dd")],
//       ["End Date", format(data.endDate, "yyyy-MM-dd")],
//     ];

//     let y = doc.y + 1;
//     summaryTable.forEach((row, i) => {
//       doc
//         .font(i === 0 ? "Arial-Bold" : "Arial")
//         .text(row[0], 50, y, { width: 200 });
//       doc.text(row[1], 250, y, { width: 300 });
//       y += 20;
//     });

//     doc.moveDown(2);

//     // === Participants Table ===
//     const participantHeaders = [
//       "Full Name",
//       "Gender",
//       "Payment Method",
//       "Phone Number",
//       "Account Number",
//       "Verified",
//       "Urban Days",
//       "Rural Days",
//       "Total Amount",
//     ];

//     const columnWidths = [80, 50, 80, 70, 70, 40, 50, 50, 55]; // Total: 545
//     const rowHeight = 20;
//     const tableStartX = 25;
//     let currentY = doc.y;

//     // const drawTableHeader = () => {
//     //   let x = tableStartX;
//     //   doc.font("Arial-Bold").fontSize(8);
//     //   participantHeaders.forEach((header, i) => {
//     //     doc
//     //       .rect(x, currentY, columnWidths[i], rowHeight)
//     //       .fillAndStroke("#cccccc", "#000000")
//     //       .fillColor("black")
//     //       .text(header, x + 2, currentY + 5, {
//     //         width: columnWidths[i] - 4,
//     //         align: "left",
//     //       });
//     //     x += columnWidths[i];
//     //   });
//     //   currentY += rowHeight;
//     // };
//     const drawTableHeader = () => {
//       let x = tableStartX;
//       doc.font("Arial-Bold").fontSize(8);

//       participantHeaders.forEach((header, i) => {
//         // Header background with cyan blue color
//         doc
//           .rect(x, currentY, columnWidths[i], rowHeight)
//           .fillAndStroke("#00AEEF", "#000000") // cyan fill + black border
//           .fillColor("white") // white text on cyan
//           .text(header, x + 2, currentY + 5, {
//             width: columnWidths[i] - 4,
//             align: "left",
//           });
//         x += columnWidths[i];
//       });
//       currentY += rowHeight; // add extra 4 px space after header for breathing room
//     };

//     doc
//       .font("Arial-Bold")
//       .fontSize(12)
//       .fillColor("black")
//       .text("Participants", { underline: true });
//     doc.moveDown(0.5);
//     currentY = doc.y;
//     drawTableHeader();

//     data.campaignParticipants.forEach((cp, index) => {
//       if (currentY + rowHeight > 750) {
//         doc.addPage();
//         currentY = 50;
//         drawHeader();
//         doc
//           .font("Arial-Bold")
//           .fontSize(16)
//           .fillColor("#004080")
//           .text(`Campaign Report: ${data.campaignName}`, { align: "center" });
//         doc.moveDown(1);
//         doc
//           .font("Arial-Bold")
//           .fontSize(14)
//           .fillColor("black")
//           .text("Participants (Continued)", { underline: true });
//         doc.moveDown(0.5);
//         currentY = doc.y;
//         drawTableHeader();
//       }

//       if (index % 2 === 0) {
//         doc.rect(tableStartX, currentY, 500, rowHeight).fill("#f2f2f2");
//       }

//       const rowData = [
//         cp.fullName,
//         cp.Gender,
//         cp.paymentMethod,
//         cp.phoneNumber || "N/A",
//         cp.accountNumber || "N/A",
//         cp.isVerified ? "Yes" : "No",
//         cp.urbanDays.toString(),
//         cp.ruralDays.toString(),
//         `ETB ${cp.totalAmount.toFixed(2)}`,
//       ];

//       let x = tableStartX;
//       rowData.forEach((cellText, i) => {
//         doc
//           .fillColor("black")
//           .font("Arial")
//           .fontSize(8)
//           .text(cellText, x + 2, currentY + 5, {
//             width: columnWidths[i] - 4,
//             align: "left",
//             height: rowHeight,
//           });
//         doc.rect(x, currentY, columnWidths[i], rowHeight).stroke();
//         x += columnWidths[i];
//       });

//       currentY += rowHeight;
//     });

//     doc.end();
//   });
// }

async function generatePDFReport(
  data: DownloadCampaignReportResponse
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const buffers: Buffer[] = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    doc.registerFont("Arial", "Helvetica");
    doc.registerFont("Arial-Bold", "Helvetica-Bold");

    const watermarkPath = path.resolve(
      __dirname,
      "../assets/coopayroll-logo.png"
    );

    function drawWatermark() {
      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;

      const watermarkWidth = 600; // Large size width
      const watermarkHeight = 190; // Large size height

      doc.save();
      doc.opacity(0.3);

      // Center coordinates
      const centerX = pageWidth / 2;
      const centerY = pageHeight / 2;

      // Rotate around center by 45 degrees
      doc.translate(centerX, centerY);
      doc.rotate(-45, { origin: [0, 0] });

      // Draw image centered at 0,0 after rotation
      doc.image(watermarkPath, -watermarkWidth / 2, -watermarkHeight / 2, {
        width: watermarkWidth,
        height: watermarkHeight,
      });

      doc.restore();
      doc.opacity(1); // Reset opacity for other content
    }

    // Draw watermark on the first page
    drawWatermark();

    // Draw watermark on every new page
    doc.on("pageAdded", () => {
      drawWatermark();
    });

    const drawHeader = () => {
      doc
        .font("Arial-Bold")
        .fontSize(14)
        .fillColor("#00AEEF")
        .text("Cooperative Bank of Oromia S.C.", 50, 20, { align: "left" })
        .text("Coopayroll", 50, 36, { align: "left" });

      try {
        const logoPath = path.resolve(__dirname, "../assets/logo.png");
        doc.image(logoPath, 450, 20, { width: 80 });
      } catch (e) {
        // console.log("Logo image failed to load:", e.message);
      }

      const underlineY = 38 + 18;
      doc.moveTo(50, underlineY).lineTo(550, underlineY).stroke();
      doc.moveDown(1.5);
    };

    drawHeader();

    doc.moveDown(0.2);
    doc
      .font("Arial-Bold")
      .fontSize(16)
      .fillColor("#00AEEF")
      .text(`Title: ${data.campaignName}`, { align: "center" });
    doc.moveDown(1);

    doc.font("Arial-Bold").fontSize(14).fillColor("black").text(
      "Summary",

      { underline: true }
    );
    doc.moveDown(0.5);
    doc.font("Arial").fontSize(10);

    const summaryTable = [
      ["Metric", "Value"],
      ["Total Participants", data.totalParticipant.toString()],
      ["Total Paid Amount", `ETB ${data.totalPaidAmount.toFixed(2)}`],
      ["Total Unpaid Amount", `ETB ${data.totalUnpaidAmount.toFixed(2)}`],
      ["Start Date", format(data.startDate, "yyyy-MM-dd")],
      ["End Date", format(data.endDate, "yyyy-MM-dd")],
    ];

    let y = doc.y + 1;
    summaryTable.forEach((row, i) => {
      doc
        .font(i === 0 ? "Arial-Bold" : "Arial")
        .text(row[0], 50, y, { width: 200 });
      doc.text(row[1], 250, y, { width: 300 });
      y += 20;
    });

    doc.moveDown(2);

    const participantHeaders = [
      "NO",
      "Full Name",
      "Gender",
      "Payment Method",
      "Phone Number",
      "Account Number",
      "Verified",
      "Urban Days",
      "Rural Days",
      "Total Amount",
    ];

    const columnWidths = [20, 80, 50, 80, 70, 70, 40, 50, 50, 55];
    const rowHeight = 20;
    const tableStartX = 25;
    let currentY = doc.y;

    const drawTableHeader = () => {
      let x = tableStartX;
      doc.font("Arial-Bold").fontSize(8);

      participantHeaders.forEach((header, i) => {
        doc
          .rect(x, currentY, columnWidths[i], rowHeight)
          .fillAndStroke("#00AEEF", "#000000")
          .fillColor("white")
          .text(header, x + 2, currentY + 5, {
            width: columnWidths[i] - 4,
            align: "left",
          });
        x += columnWidths[i];
      });
      currentY += rowHeight;
    };

    doc
      .font("Arial-Bold")
      .fontSize(12)
      .fillColor("black")
      .text("Participants", { underline: true });
    doc.moveDown(0.5);
    currentY = doc.y;
    drawTableHeader();

    data.campaignParticipants.forEach((cp, index) => {
      if (currentY + rowHeight > 750) {
        doc.addPage();
        currentY = 50;
        drawHeader();
        doc
          .font("Arial-Bold")
          .fontSize(16)
          .fillColor("#004080")
          .text(`Campaign Report: ${data.campaignName}`, { align: "center" });
        doc.moveDown(1);
        doc
          .font("Arial-Bold")
          .fontSize(14)
          .fillColor("black")
          .text("Participants (Continued)", { underline: true });
        doc.moveDown(0.5);
        currentY = doc.y;
        drawTableHeader();
      }

      if (index % 2 === 0) {
        doc.rect(tableStartX, currentY, 500, rowHeight).fill("#f2f2f2");
      }

      const rowData = [
        (index + 1).toString(),
        cp.fullName,
        cp.Gender,
        cp.paymentMethod,
        cp.phoneNumber || "N/A",
        cp.accountNumber || "N/A",
        cp.isVerified ? "Yes" : "No",
        cp.urbanDays.toString(),
        cp.ruralDays.toString(),
        `ETB ${cp.totalAmount.toFixed(2)}`,
      ];

      let x = tableStartX;
      rowData.forEach((cellText, i) => {
        doc
          .fillColor("black")
          .font("Arial")
          .fontSize(8)
          .text(cellText, x + 2, currentY + 5, {
            width: columnWidths[i] - 4,
            align: "left",
            height: rowHeight,
          });
        doc.rect(x, currentY, columnWidths[i], rowHeight).stroke();
        x += columnWidths[i];
      });

      currentY += rowHeight;
    });

    doc.end();
  });
}

async function generatePayslipPDFReport(data: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    console.log("djfdfhhhhhhhhhhhhhhhhhhh");
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const buffers: Buffer[] = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    doc.registerFont("Arial", "Helvetica");
    doc.registerFont("Arial-Bold", "Helvetica-Bold");

    const watermarkPath = path.resolve(
      __dirname,
      "../assets/coopayroll-logo.png"
    );

    function drawWatermark() {
      const centerX = doc.page.width / 2;
      const centerY = doc.page.height / 2;
      doc.save();
      doc.opacity(0.2);
      doc.translate(centerX, centerY);
      doc.rotate(-45);
      doc.image(watermarkPath, -200, -60, { width: 400 });
      doc.restore();
      doc.opacity(1);
    }

    function drawHeader(campaignName: string) {
      try {
        doc.image(path.resolve(__dirname, "../assets/logo.png"), 450, 20, {
          width: 80,
        });
      } catch (err) {
        // Ignore logo load error
      }

      doc.font("Arial-Bold").fontSize(14).fillColor("#004080");
      doc.text("Cooperative Bank of Oromia S.C.", 50, 30);
      doc.fontSize(12).text("Coopayroll Payslip Report");
      doc.fontSize(10).text(`Campaign: ${campaignName}`);
      doc.moveTo(50, 75).lineTo(550, 75).stroke();
      doc.moveDown();
    }

    // Normalize data
    const reports = Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data)
      ? data
      : [];

    if (!reports.length) {
      doc
        .font("Arial-Bold")
        .fontSize(14)
        .fillColor("red")
        .text("No payslip data available.");
      doc.end();
      return;
    }

    // Render each campaign report entry
    reports.forEach((entry: any, index: number) => {
      if (index > 0) doc.addPage();

      drawWatermark();
      drawHeader(entry.campaign.name);

      doc.font("Arial").fontSize(10).fillColor("black");
      doc.text(`Bulk ID: ${entry.bulkId}`);
      doc.text(`Debit Account: ${entry.debitAccount}`);
      doc.text(`Status: ${entry.status}`);
      doc.text(`Total Amount: ETB ${entry.totalAmount}`);
      doc.moveDown();

      doc
        .font("Arial-Bold")
        .fontSize(12)
        .fillColor("#004080")
        .text("Participant Payslip Summary", { underline: true });
      doc.moveDown(0.5);

      const participants = entry.campaign?.campaignParticipants ?? [];

      participants.forEach((p: any, i: number) => {
        const part = p.participant;

        if (!part) return; // Skip if participant is missing

        if (doc.y > 700) {
          doc.addPage();
          drawWatermark();
          drawHeader(entry.campaign.name);
          doc
            .font("Arial-Bold")
            .fontSize(12)
            .fillColor("#004080")
            .text("Participant Payslip Summary", { underline: true });
          doc.moveDown(0.5);
        }

        doc
          .font("Arial-Bold")
          .fontSize(10)
          .text(`${i + 1}. ${part.fullName} (${part.gender})`);
        doc.font("Arial").fontSize(10);
        doc.text(`Phone: ${part.phoneNumber}`);
        doc.text(`Account Number: ${part.accountNumber}`);
        doc.text(`Payment Method: ${part.paymentMethod}`);
        doc.text(`Urban Days: ${p.numberOfDaysInUrban}`);
        doc.text(`Rural Days: ${p.numberOfDaysInRural}`);
        doc.text(`Urban Rate: ETB ${p.urbanRate}`);
        doc.text(`Rural Rate: ETB ${p.ruralRate}`);
        doc.text(`Total Amount: ETB ${p.totalAmount}`);
        doc.text(`Verified: ${p.isVerified ? "Yes" : "No"}`);
        doc.text(`Payment Status: ${p.paymentStatus}`);
        doc.moveDown(0.5);

        doc
          .moveTo(50, doc.y)
          .lineTo(550, doc.y)
          .dash(1, { space: 2 })
          .stroke()
          .undash();
      });
    });

    doc.end();
  });
}

async function generateSinglePayslipPDF(data: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const buffers: Buffer[] = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    doc.registerFont("Arial", "Helvetica");
    doc.registerFont("Arial-Bold", "Helvetica-Bold");

    const watermarkPath = path.resolve(
      __dirname,
      "../assets/coopayroll-logo.png"
    );

    const drawWatermark = () => {
      doc.save();
      const centerX = doc.page.width / 2;
      const centerY = doc.page.height / 2;
      doc.opacity(0.2);
      doc.translate(centerX, centerY).rotate(-45);
      doc.image(watermarkPath, -200, -60, { width: 400 });
      doc.restore();
      doc.opacity(1);
    };

    const drawHeader = () => {
      try {
        const logoPath = path.resolve(__dirname, "../assets/logo.png");
        doc.image(logoPath, 450, 20, { width: 80 });
      } catch (err) {}
      doc.font("Arial-Bold").fontSize(14).fillColor("#004080");
      doc.text("Cooperative Bank of Oromia S.C.", 50, 30);
      doc.fontSize(12).text("Coopayroll - Individual Payslip");
      doc.moveTo(50, 70).lineTo(550, 70).stroke();
      doc.moveDown();
    };

    // ✅ Normalize data
    const reportList = Array.isArray(data?.data) ? data.data : data;
    if (!Array.isArray(reportList) || reportList.length === 0) {
      throw new Error("No report data provided.");
    }

    const entry = reportList[0];
    const campaignParticipant = entry?.campaignParticipant;
    const campaign = campaignParticipant?.campaign;
    const participant = campaignParticipant?.participant;

    if (!campaignParticipant || !campaign || !participant) {
      throw new Error(
        "Missing campaignParticipant, campaign, or participant data."
      );
    }

    // ✅ Draw content
    drawWatermark();
    drawHeader();

    doc.moveDown();
    doc
      .font("Arial-Bold")
      .fontSize(12)
      .text("Campaign Info", { underline: true });
    doc.font("Arial").fontSize(10);
    doc.text(`Campaign Name: ${campaign.name}`);
    doc.text(
      `Campaign Period: ${new Date(
        campaign.startDate
      ).toLocaleDateString()} - ${new Date(
        campaign.endDate
      ).toLocaleDateString()}`
    );
    doc.text(`Campaign Status: ${campaign.status}`);
    doc.moveDown();

    doc
      .font("Arial-Bold")
      .fontSize(12)
      .text("Participant Info", { underline: true });
    doc.font("Arial").fontSize(10);
    doc.text(`Full Name: ${participant.fullName}`);
    doc.text(`Gender: ${participant.gender}`);
    doc.text(`Address: ${participant.address}`);
    doc.text(`Phone Number: ${campaignParticipant.phoneNumber}`);
    doc.text(`Account Number: ${campaignParticipant.accountNumber}`);
    doc.text(`Payment Method: ${campaignParticipant.paymentMethod}`);
    doc.text(`Verified: ${campaignParticipant.isVerified ? "Yes" : "No"}`);
    doc.moveDown();

    doc
      .font("Arial-Bold")
      .fontSize(12)
      .text("Payment Details", { underline: true });
    doc.font("Arial").fontSize(10);
    doc.text(`Order ID: ${entry.orderId}`);
    doc.text(`Transaction ID: ${entry.transactionId || "N/A"}`);
    doc.text(`Status: ${entry.status}`);
    doc.text(`Amount: ETB ${entry.amount}`);
    doc.text(`Failure Reason: ${entry.failureReason || "N/A"}`);
    doc.moveDown();

    doc
      .font("Arial-Bold")
      .fontSize(12)
      .text("Work Summary", { underline: true });
    doc.font("Arial").fontSize(10);
    doc.text(`Urban Days: ${campaignParticipant.numberOfDaysInUrban}`);
    doc.text(`Urban Rate: ETB ${campaignParticipant.urbanRate}`);
    doc.text(`Rural Days: ${campaignParticipant.numberOfDaysInRural}`);
    doc.text(`Rural Rate: ETB ${campaignParticipant.ruralRate}`);
    doc.text(`Total Amount: ETB ${campaignParticipant.totalAmount}`);
    doc.moveDown(2);

    doc
      .font("Arial-Bold")
      .fontSize(12)
      .text("Generated On: ", { continued: true });
    doc.font("Arial").text(new Date().toLocaleString());

    doc.end();
  });
}

export { generateSinglePayslipPDF };

export default {
  generatePDFReport,
  generatePayslipPDFReport,
  generateSinglePayslipPDF,
};
