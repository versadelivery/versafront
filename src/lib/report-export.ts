import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

function buildCsvContent(
  headers: string[],
  rows: (string | number)[][],
  summaryData?: Record<string, string | number>
): string {
  const lines: string[] = [];

  if (summaryData) {
    for (const [key, value] of Object.entries(summaryData)) {
      lines.push(`${key},${value}`);
    }
    lines.push("");
  }

  lines.push(headers.map((h) => `"${h}"`).join(","));

  for (const row of rows) {
    lines.push(
      row
        .map((cell) => {
          const str = String(cell);
          if (str.includes(",") || str.includes('"') || str.includes("\n")) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(",")
    );
  }

  return lines.join("\n");
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToCsv(
  filename: string,
  headers: string[],
  rows: (string | number)[][],
  summaryData?: Record<string, string | number>
) {
  const csv = buildCsvContent(headers, rows, summaryData);
  const bom = "\uFEFF";
  const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, `${filename}.csv`);
}

export function exportToExcel(
  filename: string,
  headers: string[],
  rows: (string | number)[][],
  summaryData?: Record<string, string | number>
) {
  const wb = XLSX.utils.book_new();

  const sheetData: (string | number)[][] = [];

  if (summaryData) {
    for (const [key, value] of Object.entries(summaryData)) {
      sheetData.push([key, value]);
    }
    sheetData.push([]);
  }

  sheetData.push(headers);
  sheetData.push(...rows);

  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  XLSX.utils.book_append_sheet(wb, ws, "Relatório");
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportToPdf(
  filename: string,
  headers: string[],
  rows: (string | number)[][],
  summaryData?: Record<string, string | number>
) {
  const doc = new jsPDF({ orientation: "landscape" });

  doc.setFontSize(14);
  doc.text(filename, 14, 15);

  let startY = 25;

  if (summaryData) {
    doc.setFontSize(10);
    for (const [key, value] of Object.entries(summaryData)) {
      doc.text(`${key}: ${value}`, 14, startY);
      startY += 6;
    }
    startY += 4;
  }

  autoTable(doc, {
    head: [headers],
    body: rows.map((row) => row.map(String)),
    startY,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246] },
  });

  doc.save(`${filename}.pdf`);
}
