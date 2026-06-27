const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function parseResponse(response) {
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.message || payload?.error || "Request failed.");
  }

  return payload;
}

export async function createDemoCheckout({ userId, gameId, paymentMethod }) {
  const response = await fetch(`${API_BASE_URL}/api/payments/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, gameId, paymentMethod }),
  });

  return parseResponse(response);
}

export async function createBulkDemoCheckout({
  userId,
  gameIds,
  paymentMethod,
}) {
  const response = await fetch(`${API_BASE_URL}/api/payments/checkout/bulk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, gameIds, paymentMethod }),
  });

  return parseResponse(response);
}

export async function claimFreeGames({ userId, gameIds }) {
  const response = await fetch(`${API_BASE_URL}/api/payments/claim-free`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, gameIds }),
  });

  return parseResponse(response);
}

export async function updateDemoPaymentMethod({
  paymentId,
  userId,
  paymentMethod,
}) {
  const response = await fetch(
    `${API_BASE_URL}/api/payments/${paymentId}/method`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, paymentMethod }),
    },
  );

  return parseResponse(response);
}

export async function updateBulkDemoPaymentMethod({
  paymentIds,
  userId,
  paymentMethod,
}) {
  const response = await fetch(`${API_BASE_URL}/api/payments/bulk/method`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paymentIds, userId, paymentMethod }),
  });

  return parseResponse(response);
}

export async function processDemoPayment({ paymentId, userId, action }) {
  const response = await fetch(
    `${API_BASE_URL}/api/payments/${paymentId}/process`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action }),
    },
  );

  return parseResponse(response);
}

export async function processBulkDemoPayment({ paymentIds, userId, action }) {
  const response = await fetch(`${API_BASE_URL}/api/payments/bulk/process`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paymentIds, userId, action }),
  });

  return parseResponse(response);
}

export async function getPaymentDetails({ paymentId, userId }) {
  const response = await fetch(
    `${API_BASE_URL}/api/payments/${paymentId}?userId=${encodeURIComponent(userId)}`,
  );

  return parseResponse(response);
}

export async function getAdminPayments({ status = "ALL", search = "" } = {}) {
  const query = new URLSearchParams();

  if (status) query.set("status", status);
  if (search) query.set("search", search);

  const response = await fetch(
    `${API_BASE_URL}/api/payments/admin?${query.toString()}`,
  );
  return parseResponse(response);
}

export async function getUserPaymentHistory({ userId }) {
  const response = await fetch(
    `${API_BASE_URL}/api/payments/user/${encodeURIComponent(userId)}/history`,
  );

  return parseResponse(response);
}
