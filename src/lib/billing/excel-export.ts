import ExcelJS from "exceljs";
import { orderTotals } from "./calculations";
import type { Customer, Order } from "./types";

/**
 * Formats an ISO date into DD-MM-YYYY format as required by the specification.
 */
export function formatExcelDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return iso;
  }
}

/**
 * Formats current date and time for generation timestamps.
 */
export function formatGenerationTimestamp(): string {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  let hours = d.getHours();
  const mins = String(d.getMinutes()).padStart(2, "0");
  const secs = String(d.getSeconds()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${day}-${month}-${year} ${hours}:${mins}:${secs} ${ampm}`;
}

const BRAND_NAVY = "FF0B1F3A"; // #0B1F3A
const BRAND_SKY = "FF0284C7"; // #0284c7
const ZEBRA_LIGHT = "FFF8FAFC"; // #f8fafc
const SUMMARY_BG = "FFF1F5F9"; // #f1f5f9
const BORDER_COLOR = "FFCBD5E1"; // #cbd5e1

const THIN_BORDER: Partial<ExcelJS.Borders> = {
  top: { style: "thin", color: { argb: BORDER_COLOR } },
  left: { style: "thin", color: { argb: BORDER_COLOR } },
  bottom: { style: "thin", color: { argb: BORDER_COLOR } },
  right: { style: "thin", color: { argb: BORDER_COLOR } },
};

const DOUBLE_BOTTOM_BORDER: Partial<ExcelJS.Borders> = {
  top: { style: "thin", color: { argb: "FF000000" } },
  left: { style: "thin", color: { argb: BORDER_COLOR } },
  bottom: { style: "double", color: { argb: "FF000000" } },
  right: { style: "thin", color: { argb: BORDER_COLOR } },
};

const CURRENCY_FORMAT = '"₹"#,##0.00';
const INTEGER_FORMAT = "#,##0";

/**
 * Builds the ExcelJS Workbook for general orders export.
 */
export async function buildOrdersWorkbook(
  orders: Order[],
  options?: {
    filterDescription?: string;
    generatedBy?: string;
  }
): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "SPYNN Billing Software";
  workbook.lastModifiedBy = options?.generatedBy || "SPYNN Staff";
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet("SPYNN Orders", {
    views: [{ state: "frozen", ySplit: 8 }],
    pageSetup: { orientation: "landscape", paperSize: 9 }, // A4
  });

  // Calculate totals across all orders
  const summary = orders.reduce(
    (acc, order) => {
      const t = orderTotals(order);
      acc.count += 1;
      acc.itemsCount += t.itemCount;
      acc.actualAmount += t.subtotal;
      acc.discountAmount += t.discountAmount;
      acc.paidAmount += t.amountPaid;
      acc.balanceAmount += t.balance;
      return acc;
    },
    {
      count: 0,
      itemsCount: 0,
      actualAmount: 0,
      discountAmount: 0,
      paidAmount: 0,
      balanceAmount: 0,
    }
  );

  // Row 1: Title
  worksheet.mergeCells("A1:I1");
  const titleCell = worksheet.getCell("A1");
  titleCell.value = "SPYNN DRY CLEANING STUDIO";
  titleCell.font = { name: "Calibri", size: 16, bold: true, color: { argb: BRAND_NAVY } };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  worksheet.getRow(1).height = 26;

  // Row 2: Subtitle
  worksheet.mergeCells("A2:I2");
  const subTitleCell = worksheet.getCell("A2");
  subTitleCell.value = "OFFICIAL ORDERS & BILLING REPORT";
  subTitleCell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FF475569" } };
  subTitleCell.alignment = { horizontal: "center", vertical: "middle" };
  worksheet.getRow(2).height = 18;

  // Row 3: Metadata
  worksheet.mergeCells("A3:I3");
  const metaCell = worksheet.getCell("A3");
  const filterDesc = options?.filterDescription || "All Orders";
  metaCell.value = `Report Generated: ${formatGenerationTimestamp()}  |  Scope: ${filterDesc}  |  Total Orders: ${summary.count}`;
  metaCell.font = { name: "Calibri", size: 9, italic: true, color: { argb: "FF64748B" } };
  metaCell.alignment = { horizontal: "center", vertical: "middle" };
  worksheet.getRow(3).height = 16;

  // Row 4: Empty space
  worksheet.getRow(4).height = 8;

  // Row 5 & 6: Summary KPI Section
  worksheet.mergeCells("A5:B5");
  worksheet.getCell("A5").value = "SUMMARY METRICS";
  worksheet.getCell("A5").font = { name: "Calibri", size: 9, bold: true, color: { argb: BRAND_NAVY } };

  worksheet.getCell("A6").value = `Orders: ${summary.count}`;
  worksheet.getCell("C6").value = `Total Items: ${summary.itemsCount}`;
  worksheet.getCell("D6").value = `Gross (Actual): ₹${summary.actualAmount.toFixed(2)}`;
  worksheet.getCell("F6").value = `Discounts: ₹${summary.discountAmount.toFixed(2)}`;
  worksheet.getCell("H6").value = `Paid: ₹${summary.paidAmount.toFixed(2)}`;
  worksheet.getCell("I6").value = `Balance: ₹${summary.balanceAmount.toFixed(2)}`;

  [worksheet.getCell("A6"), worksheet.getCell("C6"), worksheet.getCell("D6"), worksheet.getCell("F6"), worksheet.getCell("H6"), worksheet.getCell("I6")].forEach((cell) => {
    cell.font = { name: "Calibri", size: 9, bold: true, color: { argb: "FF1E293B" } };
  });

  worksheet.getRow(5).height = 14;
  worksheet.getRow(6).height = 20;

  // Row 7: Empty space before table
  worksheet.getRow(7).height = 10;

  // Row 8: Table Header (Exact required columns)
  const headers = [
    "Date",
    "Order Number",
    "Customer Name",
    "Phone Number",
    "Address",
    "Quantity of Items",
    "Actual Amount",
    "Discount Amount",
    "Paid Amount",
  ];

  const headerRow = worksheet.getRow(8);
  headerRow.height = 24;
  headers.forEach((hdr, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = hdr;
    cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: BRAND_NAVY },
    };
    cell.alignment = {
      vertical: "middle",
      horizontal: idx === 0 || idx === 1 || idx === 3 ? "center" : idx >= 5 ? "right" : "left",
      wrapText: true,
    };
    cell.border = THIN_BORDER;
  });

  // Table Data Rows
  let currentRowIdx = 9;

  orders.forEach((order, index) => {
    const t = orderTotals(order);
    const row = worksheet.getRow(currentRowIdx);
    row.height = 20;

    const isEven = index % 2 === 1;
    const bgArgb = isEven ? ZEBRA_LIGHT : "FFFFFFFF";

    // 1. Date (DD-MM-YYYY)
    const cellDate = row.getCell(1);
    cellDate.value = formatExcelDate(order.createdAt);
    cellDate.alignment = { horizontal: "center", vertical: "middle" };

    // 2. Order Number
    const cellOrderNo = row.getCell(2);
    cellOrderNo.value = order.orderNumber;
    cellOrderNo.alignment = { horizontal: "center", vertical: "middle" };
    cellOrderNo.font = { name: "Calibri", size: 9.5, bold: true, color: { argb: "FF0F172A" } };

    // 3. Customer Name
    const cellCustName = row.getCell(3);
    cellCustName.value = order.customer.name || "Walk-in Customer";
    cellCustName.alignment = { horizontal: "left", vertical: "middle" };

    // 4. Phone Number
    const cellPhone = row.getCell(4);
    cellPhone.value = order.customer.mobile || "—";
    cellPhone.alignment = { horizontal: "center", vertical: "middle" };

    // 5. Address
    const cellAddr = row.getCell(5);
    cellAddr.value = order.customer.address || "—";
    cellAddr.alignment = { horizontal: "left", vertical: "middle" };

    // 6. Quantity of Items
    const cellQty = row.getCell(6);
    cellQty.value = t.itemCount;
    cellQty.numFmt = INTEGER_FORMAT;
    cellQty.alignment = { horizontal: "right", vertical: "middle" };
    cellQty.font = { name: "Calibri", size: 9.5, bold: true, color: { argb: "FF059669" } };

    // 7. Actual Amount (original amount before discount)
    const cellActual = row.getCell(7);
    cellActual.value = t.subtotal;
    cellActual.numFmt = CURRENCY_FORMAT;
    cellActual.alignment = { horizontal: "right", vertical: "middle" };

    // 8. Discount Amount
    const cellDiscount = row.getCell(8);
    cellDiscount.value = t.discountAmount;
    cellDiscount.numFmt = CURRENCY_FORMAT;
    cellDiscount.alignment = { horizontal: "right", vertical: "middle" };
    if (t.discountAmount > 0) {
      cellDiscount.font = { name: "Calibri", size: 9.5, color: { argb: "FF047857" } };
    }

    // 9. Paid Amount
    const cellPaid = row.getCell(9);
    cellPaid.value = t.amountPaid;
    cellPaid.numFmt = CURRENCY_FORMAT;
    cellPaid.alignment = { horizontal: "right", vertical: "middle" };
    cellPaid.font = { name: "Calibri", size: 9.5, bold: true, color: { argb: "FF0F172A" } };

    for (let c = 1; c <= 9; c++) {
      const cCell = row.getCell(c);
      cCell.border = THIN_BORDER;
      if (!cCell.font) {
        cCell.font = { name: "Calibri", size: 9.5 };
      }
      cCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: bgArgb },
      };
    }

    currentRowIdx++;
  });

  // Final Totals Row
  const totalsRow = worksheet.getRow(currentRowIdx);
  totalsRow.height = 24;

  totalsRow.getCell(1).value = "TOTAL";
  totalsRow.getCell(1).alignment = { horizontal: "center", vertical: "middle" };

  // Set quantity total
  const cellTotalQty = totalsRow.getCell(6);
  cellTotalQty.value = summary.itemsCount;
  cellTotalQty.numFmt = INTEGER_FORMAT;
  cellTotalQty.alignment = { horizontal: "right", vertical: "middle" };

  // Set actual amount total
  const cellTotalActual = totalsRow.getCell(7);
  cellTotalActual.value = summary.actualAmount;
  cellTotalActual.numFmt = CURRENCY_FORMAT;
  cellTotalActual.alignment = { horizontal: "right", vertical: "middle" };

  // Set discount total
  const cellTotalDiscount = totalsRow.getCell(8);
  cellTotalDiscount.value = summary.discountAmount;
  cellTotalDiscount.numFmt = CURRENCY_FORMAT;
  cellTotalDiscount.alignment = { horizontal: "right", vertical: "middle" };

  // Set paid amount total
  const cellTotalPaid = totalsRow.getCell(9);
  cellTotalPaid.value = summary.paidAmount;
  cellTotalPaid.numFmt = CURRENCY_FORMAT;
  cellTotalPaid.alignment = { horizontal: "right", vertical: "middle" };

  for (let c = 1; c <= 9; c++) {
    const cCell = totalsRow.getCell(c);
    cCell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FF000000" } };
    cCell.border = DOUBLE_BOTTOM_BORDER;
    cCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: SUMMARY_BG },
    };
  }

  // Set column widths
  worksheet.columns = [
    { width: 14 }, // Date
    { width: 22 }, // Order Number
    { width: 26 }, // Customer Name
    { width: 16 }, // Phone Number
    { width: 34 }, // Address
    { width: 18 }, // Quantity of Items
    { width: 18 }, // Actual Amount
    { width: 18 }, // Discount Amount
    { width: 18 }, // Paid Amount
  ];

  // Enable Excel Auto-Filter on the data table
  const lastRowIdx = Math.max(8, currentRowIdx - 1);
  worksheet.autoFilter = {
    from: "A8",
    to: `I${lastRowIdx}`,
  };

  return workbook;
}

/**
 * Builds the ExcelJS Workbook for customer-specific order history export.
 */
export async function buildCustomerOrdersWorkbook(
  customer: Customer,
  customerOrders: Order[],
  options?: { generatedBy?: string }
): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "SPYNN Billing Software";
  workbook.lastModifiedBy = options?.generatedBy || "SPYNN Staff";
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet("SPYNN Orders", {
    views: [{ state: "frozen", ySplit: 8 }],
    pageSetup: { orientation: "landscape", paperSize: 9 },
  });

  const summary = customerOrders.reduce(
    (acc, order) => {
      const t = orderTotals(order);
      acc.count += 1;
      acc.itemsCount += t.itemCount;
      acc.actualAmount += t.subtotal;
      acc.discountAmount += t.discountAmount;
      acc.paidAmount += t.amountPaid;
      acc.balanceAmount += t.balance;
      return acc;
    },
    {
      count: 0,
      itemsCount: 0,
      actualAmount: 0,
      discountAmount: 0,
      paidAmount: 0,
      balanceAmount: 0,
    }
  );

  // Row 1: Title
  worksheet.mergeCells("A1:I1");
  const titleCell = worksheet.getCell("A1");
  titleCell.value = "SPYNN DRY CLEANING STUDIO";
  titleCell.font = { name: "Calibri", size: 16, bold: true, color: { argb: BRAND_NAVY } };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  worksheet.getRow(1).height = 26;

  // Row 2: Subtitle
  worksheet.mergeCells("A2:I2");
  const subTitleCell = worksheet.getCell("A2");
  subTitleCell.value = `CUSTOMER ORDER STATEMENT — ${customer.name.toUpperCase()}`;
  subTitleCell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FF475569" } };
  subTitleCell.alignment = { horizontal: "center", vertical: "middle" };
  worksheet.getRow(2).height = 18;

  // Row 3: Customer Information Card
  worksheet.mergeCells("A3:I3");
  const metaCell = worksheet.getCell("A3");
  metaCell.value = `Customer: ${customer.name}  |  Phone: ${customer.mobile}  |  Address: ${customer.address || "—"}  |  Report: ${formatGenerationTimestamp()}`;
  metaCell.font = { name: "Calibri", size: 9, italic: true, color: { argb: "FF64748B" } };
  metaCell.alignment = { horizontal: "center", vertical: "middle" };
  worksheet.getRow(3).height = 16;

  worksheet.getRow(4).height = 8;

  // Row 5 & 6: Summary Metrics
  worksheet.mergeCells("A5:B5");
  worksheet.getCell("A5").value = "CUSTOMER TOTALS";
  worksheet.getCell("A5").font = { name: "Calibri", size: 9, bold: true, color: { argb: BRAND_NAVY } };

  worksheet.getCell("A6").value = `Orders: ${summary.count}`;
  worksheet.getCell("D6").value = `Total Items: ${summary.itemsCount}`;
  worksheet.getCell("F6").value = `Billed: ₹${summary.actualAmount.toFixed(2)}`;
  worksheet.getCell("G6").value = `Discount: ₹${summary.discountAmount.toFixed(2)}`;
  worksheet.getCell("H6").value = `Paid: ₹${summary.paidAmount.toFixed(2)}`;
  worksheet.getCell("I6").value = `Due: ₹${summary.balanceAmount.toFixed(2)}`;

  [worksheet.getCell("A6"), worksheet.getCell("D6"), worksheet.getCell("F6"), worksheet.getCell("G6"), worksheet.getCell("H6"), worksheet.getCell("I6")].forEach((cell) => {
    cell.font = { name: "Calibri", size: 9, bold: true, color: { argb: "FF1E293B" } };
  });

  worksheet.getRow(5).height = 14;
  worksheet.getRow(6).height = 20;
  worksheet.getRow(7).height = 10;

  // Row 8: Table Header (Exact customer-specific columns specified)
  const headers = [
    "Customer Name",
    "Phone Number",
    "Address",
    "Order Date",
    "Order Number",
    "Quantity of Items",
    "Actual Amount",
    "Discount Amount",
    "Paid Amount",
  ];

  const headerRow = worksheet.getRow(8);
  headerRow.height = 24;
  headers.forEach((hdr, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = hdr;
    cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: BRAND_NAVY },
    };
    cell.alignment = {
      vertical: "middle",
      horizontal: idx === 1 || idx === 3 || idx === 4 ? "center" : idx >= 5 ? "right" : "left",
      wrapText: true,
    };
    cell.border = THIN_BORDER;
  });

  // Table Data Rows
  let currentRowIdx = 9;

  customerOrders.forEach((order, index) => {
    const t = orderTotals(order);
    const row = worksheet.getRow(currentRowIdx);
    row.height = 20;

    const isEven = index % 2 === 1;
    const bgArgb = isEven ? ZEBRA_LIGHT : "FFFFFFFF";

    // 1. Customer Name
    const cellCustName = row.getCell(1);
    cellCustName.value = customer.name;
    cellCustName.alignment = { horizontal: "left", vertical: "middle" };

    // 2. Phone Number
    const cellPhone = row.getCell(2);
    cellPhone.value = customer.mobile;
    cellPhone.alignment = { horizontal: "center", vertical: "middle" };

    // 3. Address
    const cellAddr = row.getCell(3);
    cellAddr.value = customer.address || "—";
    cellAddr.alignment = { horizontal: "left", vertical: "middle" };

    // 4. Order Date (DD-MM-YYYY)
    const cellDate = row.getCell(4);
    cellDate.value = formatExcelDate(order.createdAt);
    cellDate.alignment = { horizontal: "center", vertical: "middle" };

    // 5. Order Number
    const cellOrderNo = row.getCell(5);
    cellOrderNo.value = order.orderNumber;
    cellOrderNo.alignment = { horizontal: "center", vertical: "middle" };
    cellOrderNo.font = { name: "Calibri", size: 9.5, bold: true, color: { argb: "FF0F172A" } };

    // 6. Quantity of Items
    const cellQty = row.getCell(6);
    cellQty.value = t.itemCount;
    cellQty.numFmt = INTEGER_FORMAT;
    cellQty.alignment = { horizontal: "right", vertical: "middle" };
    cellQty.font = { name: "Calibri", size: 9.5, bold: true, color: { argb: "FF059669" } };

    // 7. Actual Amount
    const cellActual = row.getCell(7);
    cellActual.value = t.subtotal;
    cellActual.numFmt = CURRENCY_FORMAT;
    cellActual.alignment = { horizontal: "right", vertical: "middle" };

    // 8. Discount Amount
    const cellDiscount = row.getCell(8);
    cellDiscount.value = t.discountAmount;
    cellDiscount.numFmt = CURRENCY_FORMAT;
    cellDiscount.alignment = { horizontal: "right", vertical: "middle" };

    // 9. Paid Amount
    const cellPaid = row.getCell(9);
    cellPaid.value = t.amountPaid;
    cellPaid.numFmt = CURRENCY_FORMAT;
    cellPaid.alignment = { horizontal: "right", vertical: "middle" };
    cellPaid.font = { name: "Calibri", size: 9.5, bold: true, color: { argb: "FF0F172A" } };

    for (let c = 1; c <= 9; c++) {
      const cCell = row.getCell(c);
      cCell.border = THIN_BORDER;
      if (!cCell.font) {
        cCell.font = { name: "Calibri", size: 9.5 };
      }
      cCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: bgArgb },
      };
    }

    currentRowIdx++;
  });

  // Final Totals Row
  const totalsRow = worksheet.getRow(currentRowIdx);
  totalsRow.height = 24;

  totalsRow.getCell(1).value = "TOTAL";
  totalsRow.getCell(1).alignment = { horizontal: "left", vertical: "middle" };

  const cellTotalQty = totalsRow.getCell(6);
  cellTotalQty.value = summary.itemsCount;
  cellTotalQty.numFmt = INTEGER_FORMAT;
  cellTotalQty.alignment = { horizontal: "right", vertical: "middle" };

  const cellTotalActual = totalsRow.getCell(7);
  cellTotalActual.value = summary.actualAmount;
  cellTotalActual.numFmt = CURRENCY_FORMAT;
  cellTotalActual.alignment = { horizontal: "right", vertical: "middle" };

  const cellTotalDiscount = totalsRow.getCell(8);
  cellTotalDiscount.value = summary.discountAmount;
  cellTotalDiscount.numFmt = CURRENCY_FORMAT;
  cellTotalDiscount.alignment = { horizontal: "right", vertical: "middle" };

  const cellTotalPaid = totalsRow.getCell(9);
  cellTotalPaid.value = summary.paidAmount;
  cellTotalPaid.numFmt = CURRENCY_FORMAT;
  cellTotalPaid.alignment = { horizontal: "right", vertical: "middle" };

  for (let c = 1; c <= 9; c++) {
    const cCell = totalsRow.getCell(c);
    cCell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FF000000" } };
    cCell.border = DOUBLE_BOTTOM_BORDER;
    cCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: SUMMARY_BG },
    };
  }

  worksheet.columns = [
    { width: 24 }, // Customer Name
    { width: 16 }, // Phone Number
    { width: 30 }, // Address
    { width: 14 }, // Order Date
    { width: 20 }, // Order Number
    { width: 18 }, // Quantity of Items
    { width: 18 }, // Actual Amount
    { width: 18 }, // Discount Amount
    { width: 18 }, // Paid Amount
  ];

  const lastRowIdx = Math.max(8, currentRowIdx - 1);
  worksheet.autoFilter = {
    from: "A8",
    to: `I${lastRowIdx}`,
  };

  return workbook;
}

/**
 * Downloads a generated Excel workbook in the user's browser as a .xlsx file.
 */
export async function downloadWorkbook(
  workbook: ExcelJS.Workbook,
  filename: string
): Promise<void> {
  if (typeof window === "undefined") return;

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
}
