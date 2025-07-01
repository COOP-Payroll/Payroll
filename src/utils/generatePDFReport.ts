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

  console.log("dfdfdhfdjhfdjhfdjdj")
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const buffers: Buffer[] = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    doc.registerFont("Arial", "Helvetica");
    doc.registerFont("Arial-Bold", "Helvetica-Bold");

    const watermarkPath = path.resolve(__dirname, "../assets/coopayroll-logo.png");
    const logoPath = path.resolve(__dirname, "../assets/logo.png");

    const reportList = Array.isArray(data?.data) ? data.data : data;
    if (!Array.isArray(reportList) || reportList.length === 0) {
      throw new Error("No report data provided.");
    }

    const entry = reportList[0];
    const campaignParticipant = entry?.campaignParticipant;
    const campaign = campaignParticipant?.campaign;
    const participant = campaignParticipant?.participant;

    if (!campaignParticipant || !campaign || !participant) {
      throw new Error("Missing campaignParticipant, campaign, or participant data.");
    }

    // Watermark
    const drawWatermark = () => {
      doc.save();
      const centerX = doc.page.width / 2;
      const centerY = doc.page.height / 2;
      doc.opacity(0.1);
      doc.translate(centerX, centerY).rotate(-45);
      doc.image(watermarkPath, -200, -60, { width: 400 });
      doc.restore();
      doc.opacity(1);
    };

    // Header
    const drawHeader = () => {
      try {
        doc.image(logoPath, 50, 30, { width: 70 });
      } catch (err) {}
      doc.font("Arial-Bold").fontSize(16).fillColor("#004080")
        .text("Cooperative Bank of Oromia S.C.", 150, 35, { align: "center" });
      doc.font("Arial").fontSize(12)
        .text("Coopayroll - Individual Payslip", { align: "center" });
      doc.moveTo(50, 90).lineTo(550, 90).stroke();
    };

    // Helper: Draw a table row
    const drawRow = (doc: PDFKit.PDFDocument, headers: string[], values: string[], startY: number) => {
      const startX = 50;
      const colWidth = 500 / headers.length;
      let y = startY;

      // Headers
      headers.forEach((text, i) => {
        doc.font("Arial-Bold").fontSize(9).text(text, startX + i * colWidth, y, {
          width: colWidth,
          align: "left",
        });
      });

      y += 15;

      // Values
      values.forEach((text, i) => {
        doc.font("Arial").fontSize(9).text(text, startX + i * colWidth, y, {
          width: colWidth,
          align: "left",
        });
      });

      return y + 20;
    };

    // Draw the document
    drawWatermark();
    drawHeader();
    doc.moveDown(2);

    // Campaign Info
    doc.font("Arial-Bold").fontSize(12).text("Campaign Information", { underline: true });
    doc.font("Arial").fontSize(10);
    doc.text(`Name: ${campaign.name}`);
    doc.text(`Period: ${new Date(campaign.startDate).toLocaleDateString()} - ${new Date(campaign.endDate).toLocaleDateString()}`);
    doc.text(`Status: ${campaign.status}`);
    doc.moveDown(1);

    doc.font("Arial-Bold").fontSize(12).text("Payslip Summary", { underline: true });
    doc.moveDown(0.5);

    let currentY = doc.y;

    // Horizontal Table: Participant Info
    currentY = drawRow(
      doc,
      ["Full Name", "Gender", "Phone", "Address", "Account Number", "Payment Method", "Verified"],
      [
        participant.fullName,
        participant.gender,
        campaignParticipant.phoneNumber,
        participant.address,
        campaignParticipant.accountNumber,
        campaignParticipant.paymentMethod,
        campaignParticipant.isVerified ? "Yes" : "No"
      ],
      currentY
    );

    // Horizontal Table: Payment/Work Info
    const status = entry.status;
    const paymentValues = [
      entry.transactionId || "N/A",
      entry.status,
      `ETB ${entry.amount.toFixed(2)}`,
      String(campaignParticipant.numberOfDaysInUrban),
      `ETB ${campaignParticipant.urbanRate.toFixed(2)}`,
      String(campaignParticipant.numberOfDaysInRural),
      `ETB ${campaignParticipant.ruralRate.toFixed(2)}`,
      `ETB ${campaignParticipant.totalAmount.toFixed(2)}`
    ];

    currentY = drawRow(
      doc,
      ["Transaction ID", "Status", "Amount Paid", "Urban Days", "Urban Rate", "Rural Days", "Rural Rate", "Total Payable"],
      paymentValues,
      currentY
    );

    // Footer
    doc.moveDown(2);
    doc.font("Arial-Bold").text("Generated on: ", { continued: true }).font("Arial").text(new Date().toLocaleString());

    doc.moveDown(3);
    doc.text("Signature: __________________________", 50);
    doc.text("HR/Payroll Department", 50);

    doc.end();
  });
}





// async function generateSinglePayslipPDF(data: any): Promise<Buffer> {
//   return new Promise((resolve, reject) => {
//     const doc = new PDFDocument({ size: "A4", margin: 50 });
//     const buffers: Buffer[] = [];

//     doc.on("data", buffers.push.bind(buffers));
//     doc.on("end", () => resolve(Buffer.concat(buffers)));
//     doc.on("error", reject);

//     doc.registerFont("Arial", "Helvetica");
//     doc.registerFont("Arial-Bold", "Helvetica-Bold");

//     const watermarkPath = path.resolve(__dirname, "../assets/coopayroll-logo.png");
//     const logoPath = path.resolve(__dirname, "../assets/logo.png");

//     const reportList = Array.isArray(data?.data) ? data.data : data;
//     if (!Array.isArray(reportList) || reportList.length === 0) {
//       throw new Error("No report data provided.");
//     }

//     const entry = reportList[0];
//     const campaignParticipant = entry?.campaignParticipant;
//     const campaign = campaignParticipant?.campaign;
//     const participant = campaignParticipant?.participant;

//     if (!campaignParticipant || !campaign || !participant) {
//       throw new Error("Missing campaignParticipant, campaign, or participant data.");
//     }

//     // Draw watermark
//     const drawWatermark = () => {
//       doc.save();
//       const centerX = doc.page.width / 2;
//       const centerY = doc.page.height / 2;
//       doc.opacity(0.1);
//       doc.translate(centerX, centerY).rotate(-45);
//       doc.image(watermarkPath, -200, -60, { width: 400 });
//       doc.restore();
//       doc.opacity(1);
//     };

//     // Draw header with logo and title
//     const drawHeader = () => {
//       try {
//         doc.image(logoPath, 50, 30, { width: 70 });
//       } catch (err) {}
//       doc.font("Arial-Bold").fontSize(16).fillColor("#004080")
//         .text("Cooperative Bank of Oromia S.C.", 150, 35, { align: "center" });
//       doc.font("Arial").fontSize(12)
//         .text("Coopayroll - Individual Payslip", { align: "center" });
//       doc.moveTo(50, 90).lineTo(550, 90).stroke();
//     };

//     // Draw a table with borders (smaller font)
//     const drawTable = (headers: string[], values: string[], startY: number) => {
//       const startX = 50;
//       const colCount = headers.length;
//       const tableWidth = 500;
//       const colWidth = tableWidth / colCount;
//       const rowHeight = 18;  // slightly smaller row height
//       let y = startY;

//       // Draw header background
//       doc.rect(startX, y, tableWidth, rowHeight).fill("#eeeeee");
//       doc.fillColor("black");

//       // Draw header text and borders
//       headers.forEach((header, i) => {
//         const x = startX + i * colWidth;
//         doc.font("Arial-Bold").fontSize(8).text(header, x + 5, y + 4, {
//           width: colWidth - 10,
//           align: "left",
//           ellipsis: true,
//         });
//         doc.rect(x, y, colWidth, rowHeight).stroke();
//       });

//       y += rowHeight;

//       // Draw values row and borders
//       values.forEach((value, i) => {
//         const x = startX + i * colWidth;
//         doc.font("Arial").fontSize(8).text(value, x + 5, y + 4, {
//           width: colWidth - 10,
//           align: "left",
//           ellipsis: true,
//         });
//         doc.rect(x, y, colWidth, rowHeight).stroke();
//       });

//       return y + rowHeight + 10; // Return new Y position with some padding
//     };

//     // Start drawing document
//     drawWatermark();
//     drawHeader();
//     doc.moveDown(2);

//     // Campaign Info section
//     doc.font("Arial-Bold").fontSize(12).text("Campaign Information", { underline: true });
//     doc.font("Arial").fontSize(10);
//     doc.text(`Name: ${campaign.name}`);
//     doc.text(`Period: ${new Date(campaign.startDate).toLocaleDateString()} - ${new Date(campaign.endDate).toLocaleDateString()}`);
//     doc.text(`Status: ${campaign.status}`);
//     doc.moveDown(1);

//     // Payslip Summary Title
//     doc.font("Arial-Bold").fontSize(12).text("Payslip Summary", { underline: true });
//     doc.moveDown(0.5);

//     let currentY = doc.y;

//     // Participant Info Title
//     doc.font("Arial-Bold").fontSize(10).text("Participant Information");
//     currentY = doc.y + 5;

//     // Participant Info table
//     currentY = drawTable(
//       ["Full Name", "Gender", "Phone", "Address", "Account Number", "Payment Method", "Verified"],
//       [
//         participant.fullName || "N/A",
//         participant.gender || "N/A",
//         campaignParticipant.phoneNumber || "N/A",
//         participant.address || "N/A",
//         campaignParticipant.accountNumber || "N/A",
//         campaignParticipant.paymentMethod || "N/A",
//         campaignParticipant.isVerified ? "Yes" : "No"
//       ],
//       currentY
//     );

//     doc.moveDown(1);

//     // Payment Info Title
//     doc.font("Arial-Bold").fontSize(10).text("Payment Information");
//     currentY = doc.y + 5;

//     // Payment Info table
//     const paymentValues = [
//       entry.transactionId || "N/A",
//       entry.status || "N/A",
//       `ETB ${entry.amount?.toFixed(2) || "0.00"}`,
//       `${campaignParticipant.numberOfDaysInUrban}`,
//       `ETB ${campaignParticipant.urbanRate?.toFixed(2)}`,
//       `${campaignParticipant.numberOfDaysInRural}`,
//       `ETB ${campaignParticipant.ruralRate?.toFixed(2)}`,
//       `ETB ${campaignParticipant.totalAmount?.toFixed(2)}`
//     ];

//     currentY = drawTable(
//       ["Transaction ID", "Status", "Amount Paid", "Urban Days", "Urban Rate", "Rural Days", "Rural Rate", "Total Payable"],
//       paymentValues,
//       currentY
//     );

//     // Footer: Generated on (two lines, gap above)
//     doc.moveDown(3);
//     doc.font("Arial-Bold").fontSize(10).text("Generated on:");
//     const nowStr = new Date().toLocaleString();
//     const [datePart, timePart] = nowStr.split(", ");
//     doc.font("Arial").fontSize(10).text(datePart + ",");
//     doc.font("Arial").fontSize(10).text(timePart);

//     doc.end();
//   });
// }

// async function generateSinglePayslipPDF(data: any): Promise<Buffer> {
//   return new Promise((resolve, reject) => {
//     const doc = new PDFDocument({ size: "A4", margin: 50 });
//     const buffers: Buffer[] = [];

//     doc.on("data", buffers.push.bind(buffers));
//     doc.on("end", () => resolve(Buffer.concat(buffers)));
//     doc.on("error", reject);

//     doc.registerFont("Arial", "Helvetica");
//     doc.registerFont("Arial-Bold", "Helvetica-Bold");

//     const watermarkPath = path.resolve(__dirname, "../assets/coopayroll-logo.png");
//     const logoPath = path.resolve(__dirname, "../assets/logo.png");

//     const reportList = Array.isArray(data?.data) ? data.data : data;
//     if (!Array.isArray(reportList) || reportList.length === 0) {
//       throw new Error("No report data provided.");
//     }

//     const entry = reportList[0];
//     const campaignParticipant = entry?.campaignParticipant;
//     const campaign = campaignParticipant?.campaign;
//     const participant = campaignParticipant?.participant;

//     if (!campaignParticipant || !campaign || !participant) {
//       throw new Error("Missing campaignParticipant, campaign, or participant data.");
//     }

//     // Draw watermark
//     const drawWatermark = () => {
//       doc.save();
//       const centerX = doc.page.width / 2;
//       const centerY = doc.page.height / 2;
//       doc.opacity(0.1);
//       doc.translate(centerX, centerY).rotate(-45);
//       doc.image(watermarkPath, -200, -60, { width: 400 });
//       doc.restore();
//       doc.opacity(1);
//     };

//     // Draw header with logo and title
//     const drawHeader = () => {
//       try {
//         doc.image(logoPath, 50, 30, { width: 70 });
//       } catch (err) {}
//       doc.font("Arial-Bold").fontSize(16).fillColor("#004080")
//         .text("Cooperative Bank of Oromia S.C.", 150, 35, { align: "center" });
//       doc.font("Arial").fontSize(12)
//         .text("Coopayroll - Individual Payslip", { align: "center" });
//       doc.moveTo(50, 90).lineTo(550, 90).stroke();
//     };

//     const drawKeyValueTable = (title: string, data: Record<string, string>, startY: number) => {
//       doc.font("Arial-Bold").fontSize(10).text(title);
//       let y = startY + 15;
//       const startX = 50;
//       const keyWidth = 150;
//       const valueWidth = 350;
//       const rowHeight = 18;

//       Object.entries(data).forEach(([key, value]) => {
//         doc.font("Arial-Bold").fontSize(9).text(`${key}:`, startX, y);
//         doc.font("Arial").fontSize(9).text(value, startX + keyWidth, y);
//         y += rowHeight;
//       });

//       return y + 10;
//     };

//     // Start drawing document
//     drawWatermark();
//     drawHeader();
//     doc.moveDown(2);

//     // Campaign Info section
//     doc.font("Arial-Bold").fontSize(12).text("Campaign Information", { underline: true });
//     doc.font("Arial").fontSize(10);
//     doc.text(`Name: ${campaign.name}`);
//     doc.text(`Period: ${new Date(campaign.startDate).toLocaleDateString()} - ${new Date(campaign.endDate).toLocaleDateString()}`);
//     doc.text(`Status: ${campaign.status}`);
//     doc.moveDown(1);

//     doc.font("Arial-Bold").fontSize(12).text("Payslip Summary", { underline: true });
//     doc.moveDown(0.5);

//     let currentY = doc.y;

//     // Participant Info
//     const participantInfo = {
//       "Full Name": participant.fullName || "N/A",
//       "Gender": participant.gender || "N/A",
//       "Phone": campaignParticipant.phoneNumber || "N/A",
//       "Address": participant.address || "N/A",
//       "Account Number": campaignParticipant.accountNumber || "N/A",
//       "Payment Method": campaignParticipant.paymentMethod || "N/A",
//       "Verified": campaignParticipant.isVerified ? "Yes" : "No",
//     };
//     currentY = drawKeyValueTable("Participant Information", participantInfo, currentY);

//     // Payment Info
//     const paymentInfo = {
//       "Transaction ID": entry.transactionId || "N/A",
//       "Status": entry.status || "N/A",
//       "Amount Paid": `ETB ${entry.amount?.toFixed(2) || "0.00"}`,
//       "Urban Days": `${campaignParticipant.numberOfDaysInUrban}`,
//       "Urban Rate": `ETB ${campaignParticipant.urbanRate?.toFixed(2)}`,
//       "Rural Days": `${campaignParticipant.numberOfDaysInRural}`,
//       "Rural Rate": `ETB ${campaignParticipant.ruralRate?.toFixed(2)}`,
//       "Total Payable": `ETB ${campaignParticipant.totalAmount?.toFixed(2)}`,
//     };
//     currentY = drawKeyValueTable("Payment Information", paymentInfo, currentY);

//     // Footer: Generated on
//     doc.moveDown(3);
//     doc.font("Arial-Bold").fontSize(10).text("Generated on:");
//     const nowStr = new Date().toLocaleString();
//     const [datePart, timePart] = nowStr.split(", ");
//     doc.font("Arial").fontSize(10).text(datePart + ",");
//     doc.font("Arial").fontSize(10).text(timePart);

//     doc.end();
//   });
// }

// export { generateSinglePayslipPDF };

export default {
  generatePDFReport,
  generatePayslipPDFReport,
  generateSinglePayslipPDF,
};
