import { format } from "date-fns";
import PDFDocument from "pdfkit";
import { DownloadCampaignReportResponse } from "../dto";

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

// export default generateLatexReport;

// Helper function to generate PDF file with PDFKit
async function generatePDFReport(
  data: DownloadCampaignReportResponse
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const buffers: Buffer[] = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    // Fonts and styling
    doc.registerFont("Arial", "Helvetica");
    doc.registerFont("Arial-Bold", "Helvetica-Bold");

    // Header on every page
    doc
      .font("Arial-Bold")
      .fontSize(16)
      .fillColor("#004080")
      .text(`Campaign Report: ${data.campaignName}`, 50, 30, {
        align: "center",
      });
    doc.moveTo(50, 50).lineTo(550, 50).strokeColor("#004080").stroke();
    // doc
    //   .fontSize(10)
    //   .fillColor("black")
    //   .text(`Page ${doc.page.number + 1}`, 500, 780, { align: "right" });

    // Summary Section
    doc
      .moveDown(2)
      .font("Arial-Bold")
      .fontSize(14)
      .text("Summary", { underline: true });
    doc.moveDown(0.5);
    doc.font("Arial").fontSize(10);
    const summaryTable = [
      ["Metric", "Value"],
      ["Total Participants", data.totalParticipant.toString()],
      ["Total Paid Amount", `$ ${data.totalPaidAmount.toFixed(2)}`],
      ["Total Unpaid Amount", `$ ${data.totalUnpaidAmount.toFixed(2)}`],
      ["Start Date", format(data.startDate, "yyyy-MM-dd")],
      ["End Date", format(data.endDate, "yyyy-MM-dd")],
    ];
    let y = doc.y + 10;
    summaryTable.forEach((row, i) => {
      doc
        .font(i === 0 ? "Arial-Bold" : "Arial")
        .text(row[0], 50, y, { width: 200 });
      doc.text(row[1], 250, y, { width: 300 });
      y += 20;
    });
    doc.moveDown(2);

    // Participants Section
    if (doc.y > 600) doc.addPage();
    doc
      .font("Arial-Bold")
      .fontSize(14)
      .text("Participants", { underline: true });
    doc.moveDown(0.5);
    const participantHeaders = [
      //   "ID",
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
    const columnWidths = [80, 100, 50, 80, 80, 80, 50, 50, 50, 60];
    let x = 50;
    doc.font("Arial-Bold").fontSize(8);
    participantHeaders.forEach((header, i) => {
      doc.text(header, x, doc.y, { width: columnWidths[i], align: "left" });
      x += columnWidths[i];
    });
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor("#000000").stroke();
    doc.moveDown(0.5);

    doc.font("Arial").fontSize(8);
    data.campaignParticipants.forEach((cp) => {
      if (doc.y > 700) {
        doc.addPage();
        doc
          .font("Arial-Bold")
          .fontSize(16)
          .fillColor("#004080")
          .text(`Campaign Report: ${data.campaignName}`, 50, 30, {
            align: "center",
          });
        doc.moveTo(50, 50).lineTo(550, 50).strokeColor("#004080").stroke();
        doc
          .font("Arial-Bold")
          .fontSize(14)
          .fillColor("black")
          .text("Participants (Continued)", 50, 70, { underline: true });
        doc.moveDown(0.5);
        x = 50;
        doc.font("Arial-Bold").fontSize(8);
        participantHeaders.forEach((header, i) => {
          doc.text(header, x, doc.y, { width: columnWidths[i], align: "left" });
          x += columnWidths[i];
        });
        doc.moveDown(0.5);
        doc
          .moveTo(50, doc.y)
          .lineTo(550, doc.y)
          .strokeColor("#000000")
          .stroke();
        doc.moveDown(0.5);
        doc.font("Arial").fontSize(8);
      }
      x = 50;
      doc.text(cp.id.slice(0, 8), x, doc.y, { width: columnWidths[0] });
      x += columnWidths[0];
      doc.text(cp.fullName, x, doc.y, { width: columnWidths[1] });
      x += columnWidths[1];
      doc.text(cp.Gender, x, doc.y, { width: columnWidths[2] });
      x += columnWidths[2];
      doc.text(cp.paymentMethod, x, doc.y, { width: columnWidths[3] });
      x += columnWidths[3];
      doc.text(cp.phoneNumber || "N/A", x, doc.y, { width: columnWidths[4] });
      x += columnWidths[4];
      doc.text(cp.accountNumber || "N/A", x, doc.y, { width: columnWidths[5] });
      x += columnWidths[5];
      doc.text(cp.isVerified ? "Yes" : "No", x, doc.y, {
        width: columnWidths[6],
      });
      x += columnWidths[6];
      doc.text(cp.urbanDays.toString(), x, doc.y, { width: columnWidths[7] });
      x += columnWidths[7];
      doc.text(cp.ruralDays.toString(), x, doc.y, { width: columnWidths[8] });
      x += columnWidths[8];
      doc.text(`$ ${cp.totalAmount.toFixed(2)}`, x, doc.y, {
        width: columnWidths[9],
      });
      doc.moveDown(0.5);
    });
    doc.moveDown(2);

    doc.end();
  });
}

export default generatePDFReport;
