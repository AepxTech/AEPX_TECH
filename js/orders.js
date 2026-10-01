const client = window.aepxSupabase;

const loading = document.getElementById("loading");
const errorBox = document.getElementById("errorBox");
const emptyOrders = document.getElementById("emptyOrders");
const ordersList = document.getElementById("ordersList");

/* =========================================
   START ORDERS PAGE
========================================= */

async function initOrdersPage() {
  if (!client) {
    showError("Supabase could not be loaded.");
    return;
  }

  try {
    const {
      data: { session },
      error,
    } = await client.auth.getSession();

    if (error) {
      throw error;
    }

    // User must be signed in
    if (!session) {
      window.location.replace("./account.html");
      return;
    }

    await loadOrders(session.user.id);
  } catch (error) {
    console.error("Orders page error:", error);

    showError(error.message || "We couldn't load your orders.");
  }
}

/* =========================================
   LOAD USER ORDERS
========================================= */

async function loadOrders(userId) {
  /*
   * Load the signed-in user's orders.
   *
   * We also request the related order_items.
   */

  const { data, error } = await client
    .from("orders")
    .select(
      `
      id,
      order_number,
      total_amount,
      status,
      payment_status,
      payment_method,
      shipping_name,
      shipping_city,
      shipping_state,
      created_at,
      order_items (
        id,
        product_id,
        product_name,
        quantity,
        price
      )
    `,
    )
    .eq("user_id", userId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  loading.hidden = true;

  if (!data || data.length === 0) {
    emptyOrders.hidden = false;
    ordersList.hidden = true;
    return;
  }

  renderOrders(data);
}

/* =========================================
   RENDER ORDERS
========================================= */

function renderOrders(orders) {
  ordersList.innerHTML = "";

  orders.forEach((order) => {
    const card = document.createElement("article");

    card.className = "order-card";

    const items = Array.isArray(order.order_items) ? order.order_items : [];

    const status = normalizeStatus(order.status);

    const paymentStatus = normalizePaymentStatus(order.payment_status);

    card.innerHTML = `
      <div class="order-top">

        <div>
          <p class="order-number">
            Order #${escapeHtml(order.order_number)}
          </p>

          <span class="order-date">
            ${formatDate(order.created_at)}
          </span>
        </div>

        <span class="order-status status-${status}">
          ${formatStatus(status)}
        </span>

      </div>


      <div class="order-products">

        ${renderOrderItems(items)}

      </div>


      <div class="order-details">

        <div class="order-detail">
          <span>Total</span>

          <strong>
            ${formatMoney(order.total_amount)}
          </strong>
        </div>


        <div class="order-detail">
          <span>Payment</span>

          <strong class="payment-${paymentStatus}">
            ${formatStatus(paymentStatus)}
          </strong>
        </div>


        <div class="order-detail">
          <span>Ship to</span>

          <strong>
            ${escapeHtml(formatShippingLocation(order))}
          </strong>
        </div>

      </div>

    `;

    ordersList.appendChild(card);
  });

  ordersList.hidden = false;
}

/* =========================================
   ORDER ITEMS
========================================= */

function renderOrderItems(items) {
  if (!items.length) {
    return `
      <div class="order-item">
        <div>
          <strong>Order items unavailable</strong>
        </div>
      </div>
    `;
  }

  return items
    .map((item) => {
      const quantity = Number(item.quantity || 1);
      const price = Number(item.price || 0);

      return `
        <div class="order-item">

          <div class="order-item-info">

            <strong>
              ${escapeHtml(item.product_name)}
            </strong>

            <span>
              Qty: ${quantity}
            </span>

          </div>

          <strong class="item-price">
            ${formatMoney(price * quantity)}
          </strong>

        </div>
      `;
    })
    .join("");
}

/* =========================================
   SHIPPING LOCATION
========================================= */

function formatShippingLocation(order) {
  const parts = [order.shipping_city, order.shipping_state].filter(Boolean);

  return parts.join(", ") || "Not available";
}

/* =========================================
   ORDER STATUS
========================================= */

function normalizeStatus(status) {
  const value = String(status || "pending").toLowerCase();

  const knownStatuses = [
    "pending",
    "processing",
    "confirmed",
    "shipped",
    "delivered",
    "cancelled",
  ];

  if (knownStatuses.includes(value)) {
    return value;
  }

  return "pending";
}

/* =========================================
   PAYMENT STATUS
========================================= */

function normalizePaymentStatus(status) {
  const value = String(status || "pending").toLowerCase();

  const knownStatuses = ["pending", "paid", "failed", "refunded"];

  if (knownStatuses.includes(value)) {
    return value;
  }

  return "pending";
}

/* =========================================
   FORMAT STATUS
========================================= */

function formatStatus(status) {
  if (!status) {
    return "";
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}

/* =========================================
   FORMAT DATE
========================================= */

function formatDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

/* =========================================
   FORMAT MONEY
========================================= */

function formatMoney(value) {
  const amount = Number(value || 0);

  /*
   * Change INR below if your store eventually
   * uses another currency.
   */

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
}

/* =========================================
   ERROR
========================================= */

function showError(text) {
  loading.hidden = true;

  emptyOrders.hidden = true;

  ordersList.hidden = true;

  errorBox.textContent = text;

  errorBox.hidden = false;
}

/* =========================================
   ESCAPE HTML
========================================= */

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* =========================================
   RUN
========================================= */

initOrdersPage();
