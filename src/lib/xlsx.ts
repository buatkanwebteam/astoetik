import "server-only";
import * as XLSX from "xlsx";

export type CellValue = string | number | boolean | Date | null;

export interface Column<T> {
  header: string;
  value: (row: T) => CellValue;
  width?: number;
  /** Excel number format, e.g. "#,##0", "0.00%", "yyyy-mm-dd". */
  format?: string;
}

export interface SheetSpec {
  name: string;
  build: () => XLSX.WorkSheet;
}

// Dates become Excel serial numbers from their UTC fields, so values are not
// shifted by the server's local timezone (SheetJS converts Dates via local time).
function toCell(v: CellValue): Exclude<CellValue, Date> {
  return v instanceof Date ? v.getTime() / 86_400_000 + 25_569 : v;
}

export function sheet<T>(name: string, columns: Column<T>[], rows: T[], title?: string): SheetSpec {
  return {
    name: name.slice(0, 31),
    build: () => {
      const head = title ? [[title], [], columns.map((c) => c.header)] : [columns.map((c) => c.header)];
      const body = rows.map((r) => columns.map((c) => toCell(c.value(r))));
      const ws = XLSX.utils.aoa_to_sheet([...head, ...body]);
      const headerRow = head.length - 1;

      ws["!cols"] = columns.map((c) => ({ wch: c.width ?? Math.max(10, c.header.length + 2) }));
      ws["!autofilter"] = {
        ref: XLSX.utils.encode_range({ s: { r: headerRow, c: 0 }, e: { r: headerRow + rows.length, c: columns.length - 1 } }),
      };
      // Apply number/date formats column by column.
      columns.forEach((col, ci) => {
        if (!col.format) return;
        for (let ri = headerRow + 1; ri <= headerRow + rows.length; ri++) {
          const cell = ws[XLSX.utils.encode_cell({ r: ri, c: ci })] as XLSX.CellObject | undefined;
          if (cell?.t === "n") cell.z = col.format;
        }
      });
      return ws;
    },
  };
}

export function workbook(specs: SheetSpec[]): Buffer {
  const wb = XLSX.utils.book_new();
  wb.Props = { Title: "Astoetik Export", Author: "CV. Astoetik Indonesia", CreatedDate: new Date() };
  for (const s of specs) XLSX.utils.book_append_sheet(wb, s.build(), s.name);
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx", compression: true }) as Buffer;
}

export const NUM = "#,##0";
export const PCT = "0.00%";
export const DATE = "yyyy-mm-dd";
export const DATETIME = "yyyy-mm-dd hh:mm";
