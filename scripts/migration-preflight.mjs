
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const backupPath =
  "C:\\Users\\Venna\\Downloads\\spynn-billing-local-backup.json";

const backup = JSON.parse(fs.readFileSync(backupPath, "utf8"));
const envText = fs.readFileSync(".env.migration.local", "utf8");

function env(name) {
  const line = envText
    .split(/\r?\n/)
    .find((x) => x.trim().startsWith(`${name}=`));

  if (!line) throw new Error(`${name} is missing`);

  return line
    .slice(line.indexOf("=") + 1)
    .trim()
    .replace(/^["']|["']$/g, "");
}

const supabase = createClient(
  env("SUPABASE_URL"),
  env("SUPABASE_SECRET_KEY"),
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

const namespaceA = "spynn-billing-mv86qyigao6qx3-store-v2";
const namespaceB =
  "spynn-billing-e8c937aa-575c-428d-80b2-b0598552b969-store-v2";

const datasets = [namespaceA, namespaceB].map((namespace) => {
  if (!backup[namespace]) {
    throw new Error(`Missing source dataset: ${namespace}`);
  }

  return {
    namespace,
    data: JSON.parse(backup[namespace]),
  };
});

const [datasetA, datasetB] = datasets;

const expected = {
  customers: 35,
  orders: 40,
  items: 166,
  garments: 436,
  servicePrices: 1090,
};

const actual = {
  customers: 0,
  orders: 0,
  items: 0,
  garments: 0,
  servicePrices: 0,
};

const errors = [];
const orderNumbers = new Map();
const sourceIds = new Set();

function addError(message) {
  errors.push(message);
}

function normalizeGarment(garment) {
  return JSON.stringify({
    id: garment.id,
    name: garment.name,
    category: garment.category,
    service: garment.service,
    illustration: garment.illustration,
    barcode: garment.barcode,
    price: garment.price,
    prices: garment.prices,
    unit: garment.unit,
    isActive: garment.isActive,
    variant: garment.variant ?? null,
  });
}

// Verify that both source catalogs match before treating them as one.
const garmentMapA = new Map();

for (const garment of datasetA.data.garments || []) {
  if (garmentMapA.has(garment.id)) {
    addError(`Duplicate garment ID in catalog A: ${garment.id}`);
  }

  garmentMapA.set(garment.id, normalizeGarment(garment));
}

const garmentMapB = new Map();

for (const garment of datasetB.data.garments || []) {
  if (garmentMapB.has(garment.id)) {
    addError(`Duplicate garment ID in catalog B: ${garment.id}`);
  }

  garmentMapB.set(garment.id, normalizeGarment(garment));
}

if (garmentMapA.size !== garmentMapB.size) {
  addError("The two catalogs have different numbers of unique garment IDs.");
}

for (const [id, normalized] of garmentMapA) {
  if (garmentMapB.get(id) !== normalized) {
    addError(`Garment catalog mismatch for ID: ${id}`);
  }
}

for (const [id] of garmentMapB) {
  if (!garmentMapA.has(id)) {
    addError(`Garment exists only in catalog B: ${id}`);
  }
}

// Validate source customers, orders and order items.
for (const { namespace, data } of datasets) {
  const customers = data.customers || [];
  const orders = data.orders || [];
  const garments = data.garments || [];
  const customerIds = new Set();

  actual.customers += customers.length;
  actual.orders += orders.length;
  actual.garments += garments.length;

  for (const customer of customers) {
    if (!customer.id || !customer.name) {
      addError(`Customer missing ID or name in ${namespace}.`);
      continue;
    }

    const sourceKey = `${namespace}:customer:${customer.id}`;

    if (sourceIds.has(sourceKey)) {
      addError(`Duplicate source customer ID: ${sourceKey}`);
    }

    sourceIds.add(sourceKey);
    customerIds.add(customer.id);
  }

  for (const order of orders) {
    const items = order.items || [];

    actual.items += items.length;

    if (!order.id || !order.orderNumber) {
      addError(`Order ID or order number missing in ${namespace}.`);
    }

    if (
      order.customerId &&
      !customerIds.has(order.customerId)
    ) {
      addError(
        `Order ${order.orderNumber} references an unknown customer in ${namespace}.`
      );
    }

    if (
      order.customerId &&
      !customers.some((customer) => customer.id === order.customerId)
    ) {
      addError(
        `Customer link validation failed for ${order.orderNumber}.`
      );
    }

    const numberKey = String(order.orderNumber);

    if (!orderNumbers.has(numberKey)) {
      orderNumbers.set(numberKey, []);
    }

    orderNumbers.get(numberKey).push(namespace);

    const itemIds = new Set();

    for (const item of items) {
      if (!item.id || !item.garmentName) {
        addError(`Order item missing ID or garment name in ${order.orderNumber}.`);
      }

      if (item.id && itemIds.has(item.id)) {
        addError(
          `Duplicate item ID within order ${order.orderNumber}: ${item.id}`
        );
      }

      if (item.id) itemIds.add(item.id);

      if (
        !Number.isFinite(Number(item.quantity)) ||
        Number(item.quantity) <= 0
      ) {
        addError(`Invalid quantity in order ${order.orderNumber}.`);
      }

      if (
        !Number.isFinite(Number(item.unitPrice)) ||
        Number(item.unitPrice) < 0
      ) {
        addError(`Invalid unit price in order ${order.orderNumber}.`);
      }
    }
  }

  // Verify that every garment contains all five service-price fields.
  for (const garment of garments) {
    if (!garment.id || !garment.name) {
      addError(`Garment missing ID or name in ${namespace}.`);
    }

    for (const service of [
      "Dry Cleaning",
      "Ironing",
      "Shoe Cleaning",
      "Household",
      "Laundry",
    ]) {
      if (
        !garment.prices ||
        !Object.prototype.hasOwnProperty.call(garment.prices, service)
      ) {
        addError(
          `Missing ${service} price for garment ${garment.id} in ${namespace}.`
        );
        continue;
      }

      const price = Number(garment.prices[service]);

      if (!Number.isFinite(price) || price < 0) {
        addError(
          `Invalid ${service} price for garment ${garment.id} in ${namespace}.`
        );
      }
    }
  }
}

// Count the shared catalog only once, from source A.
// The full-record comparison above must pass before this count is accepted.
if (
  errors.length === 0 &&
  garmentMapA.size === 218 &&
  garmentMapB.size === 218
) {
  actual.servicePrices = datasetA.data.garments.reduce(
    (count, garment) =>
      count +
      [
        "Dry Cleaning",
        "Ironing",
        "Shoe Cleaning",
        "Household",
        "Laundry",
      ].filter((service) =>
        Object.prototype.hasOwnProperty.call(
          garment.prices || {},
          service
        )
      ).length,
    0
  );
} else {
  addError(
    "Shared service-price count was not accepted because catalog validation failed."
  );
}

for (const [key, value] of Object.entries(expected)) {
  if (actual[key] !== value) {
    addError(
      `Unexpected ${key} count: expected ${value}, found ${actual[key]}.`
    );
  }
}

// Read-only database checks.
const { data: store, error: storeError } = await supabase
  .from("billing_stores")
  .select("id, store_code")
  .eq("store_code", "CHANDANAGAR")
  .maybeSingle();

if (storeError) {
  throw new Error(`Store check failed: ${storeError.message}`);
}

if (!store) {
  throw new Error("Chandanagar store was not found.");
}

const tables = [
  "billing_customers",
  "billing_orders",
  "billing_order_items",
  "billing_garment_prices",
];

const existingTargetRows = {};

for (const table of tables) {
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true })
    .eq("store_id", store.id);

  if (error) {
    throw new Error(
      `Read-only check failed for ${table}: ${error.message}`
    );
  }

  existingTargetRows[table] = count;

  if (count !== 0) {
    addError(`${table} is not empty; found ${count} rows.`);
  }
}

const report = {
  mode: "READ-ONLY PREFLIGHT — NO DATABASE WRITES",
  store: store.store_code,
  expected,
  actual,
  catalogComparison: {
    catalogAGarments: garmentMapA.size,
    catalogBGarments: garmentMapB.size,
    fullRecordDifferences: errors.filter(
      (error) =>
        error.includes("catalog") ||
        error.includes("Garment catalog mismatch") ||
        error.includes("Garment exists only")
    ).length,
  },
  missingCustomerLinks: datasets.reduce(
    (count, dataset) =>
      count +
      (dataset.data.orders || []).filter(
        (order) => !order.customerId
      ).length,
    0
  ),
  duplicateOrderNumbersAcrossSources: [...orderNumbers.values()].filter(
    (namespaces) => namespaces.length > 1
  ).length,
  existingTargetRows,
  validationErrors: errors,
};

console.log(JSON.stringify(report, null, 2));

if (errors.length > 0) {
  process.exitCode = 1;
} else {
  console.log(
    "Preflight passed. No database writes were performed."
  );
}
