
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { calcTotals } from "../src/lib/billing/calculations.ts";

const BACKUP_PATH =
  "C:\\Users\\Venna\\Downloads\\spynn-billing-local-backup.json";
const ENV_PATH = path.resolve(".env.migration.local");
const STORE_CODE = "CHANDANAGAR";

const DATASETS = [
  {
    key: "spynn-billing-mv86qyigao6qx3-store-v2",
    namespace: "A",
    suffix: "A",
  },
  {
    key: "spynn-billing-e8c937aa-575c-428d-80b2-b0598552b969-store-v2",
    namespace: "B",
    suffix: "B",
  },
];

const SERVICES = [
  "Dry Cleaning",
  "Ironing",
  "Shoe Cleaning",
  "Household",
  "Laundry",
];

const EXPECTED = {
  customers: 35,
  orders: 40,
  items: 166,
  garments: 436,
  prices: 1090,
};

const APPLY = process.argv.includes("--apply");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Environment file not found: ${filePath}`);
  }

  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separator = trimmed.indexOf("=");
    if (separator < 1) continue;

    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) process.env[key] = value;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function asNumber(value, label) {
  const number = Number(value);
  assert(Number.isFinite(number), `Invalid number: ${label}`);
  return number;
}

function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function asDate(value, label) {
  assert(value, `Missing timestamp: ${label}`);
  const date = new Date(value);
  assert(!Number.isNaN(date.getTime()), `Invalid timestamp: ${label}`);
  return date.toISOString();
}

function readDataset(backup, config) {
  const raw = backup[config.key];
  assert(raw !== undefined, `Backup key missing: ${config.key}`);

  const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
  assert(
    parsed && typeof parsed === "object",
    `Invalid dataset ${config.namespace}`
  );

  const data =
    parsed.data && typeof parsed.data === "object" ? parsed.data : parsed;

  for (const field of ["customers", "orders", "garments"]) {
    assert(
      Array.isArray(data[field]),
      `${config.namespace}: ${field} is not an array`
    );
  }

  return { ...config, data };
}

function stableCatalogValue(garment) {
  return JSON.stringify({
    id: garment.id,
    name: garment.name,
    category: garment.category ?? null,
    service: garment.service ?? null,
    illustration: garment.illustration ?? null,
    barcode: garment.barcode ?? null,
    price: garment.price,
    prices: garment.prices,
    unit: garment.unit ?? null,
    isActive: garment.isActive,
    variant: garment.variant ?? null,
  });
}

function buildPayload(datasets) {
  const customers = [];
  const orders = [];
  const prices = [];
  const sourceItemIds = new Set();
  const allOrderNumbers = new Map();

  for (const dataset of datasets) {
    for (const order of dataset.data.orders) {
      const number = String(order.orderNumber ?? "");
      assert(number, `${dataset.namespace}: order has no orderNumber`);
      allOrderNumbers.set(
        number,
        (allOrderNumbers.get(number) ?? 0) + 1
      );
    }
  }

  for (const dataset of datasets) {
    const { namespace, data } = dataset;

    const customerIds = new Set(
      data.customers.map((customer) => String(customer.id))
    );

    const garmentById = new Map(
      data.garments.map((garment) => [String(garment.id), garment])
    );

    for (const customer of data.customers) {
      assert(customer.id != null, `${namespace}: customer has no ID`);
      assert(
        customer.name,
        `${namespace}: customer ${customer.id} has no name`
      );

      const createdAt = customer.createdAt
        ? asDate(customer.createdAt, `customer ${customer.id}`)
        : new Date().toISOString();

      customers.push({
        full_name: String(customer.name),
        mobile: String(customer.mobile ?? ""),
        address: customer.address ? String(customer.address) : null,
        source_customer_id: `${namespace}::${customer.id}`,
        created_at: createdAt,
        updated_at: customer.updatedAt
          ? asDate(
              customer.updatedAt,
              `customer updatedAt ${customer.id}`
            )
          : createdAt,
      });
    }

    for (const garment of data.garments) {
      assert(garment.id != null, `${namespace}: garment has no ID`);
      assert(
        garment.name,
        `${namespace}: garment ${garment.id} has no name`
      );
    }

    // Import the shared catalog from dataset A only.
    // 218 garments x 5 services = 1,090 price rows.
    if (namespace === "A") {
      for (const garment of data.garments) {
        for (const service of SERVICES) {
          assert(
            garment.prices &&
              Object.prototype.hasOwnProperty.call(
                garment.prices,
                service
              ),
            `Missing price for ${garment.name} / ${service} in dataset ${namespace}`
          );

          const price = asNumber(
            garment.prices[service],
            `${garment.name} / ${service}`
          );

          assert(
            price >= 0,
            `Negative price for ${garment.name} / ${service}`
          );

          prices.push({
            item_key: `${service}:${garment.id}`,
            garment_name: String(garment.name),
            service,
            category: garment.category ?? null,
            variant: garment.variant ?? null,
            price,
            unit: garment.unit || "item",
            is_active: garment.isActive !== false,
            source_garment_id: String(garment.id),
          });
        }
      }
    }

    for (const order of data.orders) {
      assert(order.id != null, `${namespace}: order has no ID`);
      assert(
        Array.isArray(order.items),
        `${namespace}: order ${order.id} has no items array`
      );

      const sourceOrderNumber = String(order.orderNumber);
      const orderNumber =
        allOrderNumbers.get(sourceOrderNumber) > 1
          ? `${sourceOrderNumber}-${dataset.suffix}`
          : sourceOrderNumber;

      const createdAt = asDate(
        order.createdAt,
        `${namespace} order ${order.id} createdAt`
      );

      const updatedAt = order.updatedAt
        ? asDate(
            order.updatedAt,
            `${namespace} order ${order.id} updatedAt`
          )
        : createdAt;

      const discountPercent = asNumber(
        order.discountPercent ?? 0,
        `${namespace} order ${order.id} discountPercent`
      );

      const amountPaid = asNumber(
        order.amountPaid ?? 0,
        `${namespace} order ${order.id} amountPaid`
      );

      const calcItems = order.items.map((item) => ({
        quantity: asNumber(item.quantity, `item ${item.id} quantity`),
        unitPrice: asNumber(item.unitPrice, `item ${item.id} unitPrice`),
      }));

      const totals = calcTotals(
        calcItems,
        discountPercent,
        amountPaid
      );

      const storedDiscount = asNumber(
        order.discount ?? 0,
        `${namespace} order ${order.id} stored discount`
      );

      assert(
        Math.abs(
          roundMoney(totals.discountAmount) -
            roundMoney(storedDiscount)
        ) <= 0.02,
        `Discount mismatch in ${namespace} order ${order.orderNumber}`
      );

      const computedSubtotal = roundMoney(
        order.items.reduce(
          (sum, item) =>
            sum +
            asNumber(item.quantity, `item ${item.id} quantity`) *
              asNumber(item.unitPrice, `item ${item.id} unitPrice`),
          0
        )
      );

      assert(
        Math.abs(roundMoney(totals.subtotal) - computedSubtotal) <= 0.02,
        `Subtotal mismatch in ${namespace} order ${order.orderNumber}`
      );

      let customerSourceId = null;

      if (order.customerId != null && String(order.customerId) !== "") {
        assert(
          customerIds.has(String(order.customerId)),
          `Customer link missing in ${namespace} order ${order.orderNumber}`
        );
        customerSourceId = `${namespace}::${order.customerId}`;
      }

      const items = order.items.map((item) => {
        assert(
          item.id != null,
          `Missing item ID in order ${order.orderNumber}`
        );
        assert(
          item.garmentName,
          `Missing garment name in order ${order.orderNumber}`
        );

        const itemIdentity = `${namespace}::${order.id}::${item.id}`;

        assert(
          !sourceItemIds.has(itemIdentity),
          `Duplicate item ID: ${itemIdentity}`
        );

        sourceItemIds.add(itemIdentity);

        const garment =
          item.garmentId != null
            ? garmentById.get(String(item.garmentId))
            : null;

        const quantity = asNumber(
          item.quantity,
          `item ${item.id} quantity`
        );

        const unitPrice = asNumber(
          item.unitPrice,
          `item ${item.id} unitPrice`
        );

        assert(quantity > 0, `Invalid quantity for item ${item.id}`);
        assert(unitPrice >= 0, `Negative unit price for item ${item.id}`);

        return {
          source_item_id: String(item.id),
          garment_name: String(item.garmentName),
          service: String(item.service ?? ""),
          category: garment?.category ?? null,
          variant: item.variant ?? garment?.variant ?? null,
          quantity,
          unit_price: unitPrice,
          unit: item.unit || garment?.unit || "item",
          line_total: roundMoney(quantity * unitPrice),
          created_at: createdAt,
        };
      });

      orders.push({
        order_number: orderNumber,
        source_order_id: String(order.id),
        source_namespace: namespace,
        source_order_number: sourceOrderNumber,
        customer_source_id: customerSourceId,
        customer_snapshot: order.customer ?? null,
        subtotal: roundMoney(totals.subtotal),
        discount: roundMoney(totals.discountAmount),
        discount_percent: discountPercent,
        tax_percent: asNumber(
          order.taxPercent ?? 0,
          `order ${order.id} taxPercent`
        ),
        total: roundMoney(totals.total),
        amount_paid: roundMoney(totals.amountPaid),
        balance: roundMoney(totals.balance),
        payment_method: order.paymentMethod ?? null,
        order_status: String(order.orderStatus ?? "Received"),
        payment_status: String(totals.paymentStatus),
        notes: order.notes ?? null,
        created_at: createdAt,
        updated_at: updatedAt,
        items,
      });
    }
  }

  return { customers, orders, prices };
}

async function countRows(supabase, table, storeId) {
  const { count, error } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("store_id", storeId);

  if (error) {
    throw new Error(`${table} count failed: ${error.message}`);
  }

  return count ?? 0;
}

async function main() {
  loadEnvFile(ENV_PATH);

  const url = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  assert(url, "SUPABASE_URL is missing from .env.migration.local");
  assert(
    secretKey,
    "SUPABASE_SECRET_KEY is missing from .env.migration.local"
  );

  assert(
    fs.existsSync(BACKUP_PATH),
    `Backup file not found: ${BACKUP_PATH}`
  );

  const backup = JSON.parse(fs.readFileSync(BACKUP_PATH, "utf8"));
  const datasets = DATASETS.map((config) => readDataset(backup, config));

  assert(
    datasets.reduce(
      (sum, dataset) => sum + dataset.data.customers.length,
      0
    ) === EXPECTED.customers,
    "Customer count does not match expected 35"
  );

  assert(
    datasets.reduce(
      (sum, dataset) => sum + dataset.data.orders.length,
      0
    ) === EXPECTED.orders,
    "Order count does not match expected 40"
  );

  const catalogA = datasets[0].data.garments;
  const catalogB = datasets[1].data.garments;

  assert(
    catalogA.length === 218 && catalogB.length === 218,
    "Expected 218 garments in each source catalog"
  );

  const mapA = new Map(
    catalogA.map((garment) => [
      String(garment.id),
      stableCatalogValue(garment),
    ])
  );

  const mapB = new Map(
    catalogB.map((garment) => [
      String(garment.id),
      stableCatalogValue(garment),
    ])
  );

  assert(mapA.size === mapB.size, "Catalog IDs differ between source datasets");

  for (const [id, value] of mapA) {
    assert(mapB.get(id) === value, `Catalog mismatch for garment ID ${id}`);
  }

  const payload = buildPayload(datasets);
  const itemCount = payload.orders.reduce(
    (sum, order) => sum + order.items.length,
    0
  );

  assert(
    payload.customers.length === EXPECTED.customers,
    "Payload customer count mismatch"
  );
  assert(
    payload.orders.length === EXPECTED.orders,
    "Payload order count mismatch"
  );
  assert(
    itemCount === EXPECTED.items,
    `Payload item count mismatch: ${itemCount}`
  );
  assert(
    payload.prices.length === EXPECTED.prices,
    `Payload price count mismatch: expected ${EXPECTED.prices}, got ${payload.prices.length}`
  );

  const orderNumbers = new Set();

  for (const order of payload.orders) {
    assert(
      !orderNumbers.has(order.order_number),
      `Duplicate final order number ${order.order_number}`
    );
    orderNumbers.add(order.order_number);
  }

  const supabase = createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: store, error: storeError } = await supabase
    .from("billing_stores")
    .select("id, store_code, is_active")
    .eq("store_code", STORE_CODE)
    .eq("is_active", true)
    .single();

  if (storeError) {
    throw new Error(`Store lookup failed: ${storeError.message}`);
  }

  assert(store?.id, "Active CHANDANAGAR store not found");

  const tables = [
    "billing_customers",
    "billing_orders",
    "billing_order_items",
    "billing_garment_prices",
  ];

  const existingCounts = {};

  for (const table of tables) {
    existingCounts[table] = await countRows(
      supabase,
      table,
      store.id
    );
  }

  console.log("\nSPYNN Chandanagar migration");
  console.log(
    "Mode:",
    APPLY
      ? "APPLY — DATABASE WRITES ENABLED"
      : "DRY RUN — NO DATABASE WRITES"
  );
  console.log("Store:", store.store_code);

  console.log("Payload counts:", {
    customers: payload.customers.length,
    orders: payload.orders.length,
    items: itemCount,
    sourceGarments: catalogA.length + catalogB.length,
    prices: payload.prices.length,
  });

  console.log("Existing target counts:", existingCounts);
  console.log("Catalogs identical:", true);
  console.log(
    "Orders with no customer link:",
    payload.orders.filter((order) => !order.customer_source_id).length
  );
  console.log("Validation errors: 0");

  if (!APPLY) {
    console.log("\nDry run passed. No database writes were performed.");
    console.log("Review this output before running with --apply.");
    return;
  }

  assert(
    Object.values(existingCounts).every((count) => count === 0),
    "Target billing tables are not empty. Import cancelled; no RPC was called."
  );

  const { data: result, error: importError } = await supabase.rpc(
    "import_spynn_billing_backup",
    { payload }
  );

  if (importError) {
    throw new Error(
      `Import RPC failed: ${importError.message}\n` +
        "Do not immediately retry. First check target table counts in Supabase."
    );
  }

  console.log("\nImport function returned:", result);

  const afterCounts = {};

  for (const table of tables) {
    afterCounts[table] = await countRows(supabase, table, store.id);
  }

  console.log("Post-import target counts:", afterCounts);

  const expectedAfter = {
    billing_customers: EXPECTED.customers,
    billing_orders: EXPECTED.orders,
    billing_order_items: EXPECTED.items,
    billing_garment_prices: EXPECTED.prices,
  };

  for (const [table, expected] of Object.entries(expectedAfter)) {
    assert(
      afterCounts[table] === expected,
      `Post-import count mismatch in ${table}: expected ${expected}, got ${afterCounts[table]}`
    );
  }

  console.log("\nMigration and row-count verification passed.");
}

main().catch((error) => {
  console.error("\nMIGRATION STOPPED:", error.message);
  process.exitCode = 1;
});
