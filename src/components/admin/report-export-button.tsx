"use client";

import { Download, FileSpreadsheet, FileText, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportToCsv, exportToExcel, exportToPdf } from "@/lib/report-export";

export interface ReportExportButtonProps {
  filename: string;
  headers: string[];
  rows: (string | number)[][];
  summaryData?: Record<string, string | number>;
  disabled?: boolean;
}

export default function ReportExportButton({
  filename,
  headers,
  rows,
  summaryData,
  disabled,
}: ReportExportButtonProps) {
  const isEmpty = rows.length === 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled || isEmpty}>
          <Download className="h-4 w-4" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => exportToCsv(filename, headers, rows, summaryData)}
        >
          <FileText className="h-4 w-4" />
          CSV
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => exportToExcel(filename, headers, rows, summaryData)}
        >
          <FileSpreadsheet className="h-4 w-4" />
          Excel
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => exportToPdf(filename, headers, rows, summaryData)}
        >
          <File className="h-4 w-4" />
          PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
