
import fs from "node:fs";

const backupPath = "C:\\Users\\Venna\\Downloads\\spynn-billing-local-backup.json";
const backup = JSON.parse(fs.readFileSync(backupPath, "utf8"));

const datasets = Object.entries(backup)
  .filter(([key]) => key.includes("store-v2"))
  .map(([namespace, value]) => ({
    namespace,
    data: JSON.parse(value),
  }));

if (datasets.length !== 2) {
  throw new Error(`Expected 2 datasets; found ${datasets.length}`);
}

const summary = {
  mode: "DRY RUN — NO DATABASE WRITES",
  targetStore: "CHANDANAGAR",
  datasets: datasets.length,
  customers: 0,
  orders: 0,
  orderItems: 0,
  garmentRecords: 0,
  servicePriceEntries: 0,
  missingCustomerLinks: 0,
  duplicateOriginalOrderNumbers: 0,
  validationErrors: [],
};

const allOrderNumbers = new Map();

for (const { namespace, data } of datasets) {
  const customers = data.customers || [];
  const orders = data.orders || [];
  const garments = data.garments || [];
  const customerIds = new Set(customers.map(c => c.id));

  summary.customers += customers.length;
  summary.orders += orders.length;
  summary.garmentRecords += garments.length;

  for (const order of orders) {
    summary.orderItems += (order.items || []).length;

    if (!order.id || !order.orderNumber) {
      summary.validationErrors.push("An order is missing its ID or order number.");
    }

    if (!order.customerId) {
      summary.missingCustomerLinks++;
    } else if (!customerIds.has(order.customerId)) {
      summary.validationErrors.push("An order references an unknown customer.");
    }

    const number = String(order.orderNumber);
    if (!allOrderNumbers.has(number)) allOrderNumbers.set(number, []);
    allOrderNumbers.get(number).push(namespace);

    for (const item of order.items || []) {
      if (!item.id || !item.garmentName ||
          !Number.isFinite(Number(item.quantity)) ||
          Number(item.quantity) <= 0 ||
          !Number.isFinite(Number(item.unitPrice)) ||
          Number(item.unitPrice) < 0) {
        summary.validationErrors.push("An order item failed validation.");
      }
    }
  }

  for (const garment of garments) {
    if (!garment.id || !garment.name) {
      summary.validationErrors.push("A garment is missing its ID or name.");
    }

    for (const service of [
      "Dry Cleaning", "Ironing", "Shoe Cleaning", "Household", "Laundry",
    ]) {
      if (!garment.prices ||
          !Object.prototype.hasOwnProperty.call(garment.prices, service)) {
        summary.validationErrors.push("A garment is missing a service-price field.");
      } else {
        summary.servicePriceEntries++;
      }
    }
  }
}

summary.duplicateOriginalOrderNumbers = [...allOrderNumbers.values()]
  .filter(namespaces => namespaces.length > 1)
  .length;

const reportPath = "spynn-billing-dry-run-report.json";
fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2), "utf8");

console.log(JSON.stringify(summary, null, 2));
console.log(`\nReport saved to ${reportPath}`);
console.log("No database writes were performed.");
