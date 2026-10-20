// ============================================================================
// TrendySize API client — wired to the .NET backend (TrendySize.Api)
//
// Contracts follow Backend-DotNet/FRONTEND_WIRING_GUIDE.md.
// Base URL: VITE_API_URL in .env, e.g. http://localhost:5128/api
// ============================================================================

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5128/api"
).replace(/\/+$/, "");

const TOKEN_KEY = "auth_token";

// ============================================================================
// TOKEN STORAGE
// ============================================================================

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem("auth_user");
}

// Called whenever any request comes back 401 so the app can log the user out.
let unauthorizedHandler = null;
export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

// ============================================================================
// ERROR READER — the backend has THREE error shapes (guide §7):
//   1. { "message": "..." }                       (deliberate)
//   2. { errors: { Field: ["..."] }, title, ... } (ASP.NET model validation)
//   3. ["PasswordTooWeak", ...]                   (Identity/EF)
//   401 from JWT middleware is an EMPTY body.
// ============================================================================

export function readErrorMessage(body, status) {
  if (body == null) return `Request failed (${status})`;

  if (typeof body.message === "string") return body.message;

  if (Array.isArray(body)) {
    return body.filter(Boolean).join("\n") || `Request failed (${status})`;
  }

  if (body.errors && typeof body.errors === "object") {
    return Object.entries(body.errors)
      .map(([field, msgs]) => `${field}: ${[].concat(msgs).join(" ")}`)
      .join("\n");
  }

  return `Request failed (${status})`;
}

export class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = body;
  }
}

// ============================================================================
// GENERIC REQUEST
// ============================================================================

export async function apiRequest(endpoint, options = {}) {
  const token = getToken();

  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  const headers = {
    Accept: "application/json",
    // Never set Content-Type for FormData — the browser adds the multipart
    // boundary itself.
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError(
      "Unable to reach the server. Check your connection and try again.",
      0,
      null
    );
  }

  let body = null;
  const text = await response.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = null; // non-JSON (e.g. empty 401 body)
    }
  }

  if (!response.ok) {
    if (response.status === 401 && unauthorizedHandler) {
      unauthorizedHandler();
    }
    throw new ApiError(readErrorMessage(body, response.status), response.status, body);
  }

  return body ?? {};
}

// ============================================================================
// AUTH  (guide §3)
// ============================================================================

// 3.1 Signup — PascalCase fields. Username is required. No password_confirmation.
export function signup({
  firstName,
  lastName,
  email,
  password,
  phoneNumber,
  whatsappNumber,
  username,
}) {
  return apiRequest("/auth/signup", {
    method: "POST",
    body: JSON.stringify({
      FirstName: firstName,
      LastName: lastName,
      Email: email,
      Password: password,
      ...(phoneNumber ? { PhoneNumber: phoneNumber } : {}),
      ...(whatsappNumber ? { WhatsappNumber: whatsappNumber } : {}),
      Username: username,
    }),
  });
}

// 3.2 Confirm email — from the emailed link (?userId=&token=).
export function confirmEmail(userId, token) {
  return apiRequest("/auth/confirm-email", {
    method: "POST",
    body: JSON.stringify({ userId, token }),
  });
}

// 3.3 Login — email + password only.
export function login(email, password) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

// 3.3b Google sign-in — idToken from GIS; username only needed on first-time creation.
export function googleSignIn({ idToken, username, whatsappNumber }) {
  return apiRequest("/auth/google", {
    method: "POST",
    body: JSON.stringify({
      idToken,
      ...(username ? { username } : {}),
      ...(whatsappNumber ? { whatsappNumber } : {}),
    }),
  });
}

// 3.4 Logout — stateless; the client just discards the token.
export function logout() {
  return apiRequest("/auth/logout", { method: "POST" });
}

// 3.5 Current profile.
export function getProfile() {
  return apiRequest("/auth/me", { method: "GET" });
}

// 3.6 Partial profile update — PascalCase, null fields ignored.
export function updateProfile(fields) {
  return apiRequest("/auth/me", {
    method: "PUT",
    body: JSON.stringify(fields), // caller passes PascalCase keys
  });
}

// 3.7 Profile/banner image upload — multipart, fields "File" and "Type".
export function uploadProfileImage(file, type) {
  const form = new FormData();
  form.append("File", file);
  form.append("Type", type); // "Profile" | "Banner"
  return apiRequest("/auth/me/image", { method: "POST", body: form });
}

// 3.8 Deactivate account (destructive, irreversible).
export function deactivateAccount() {
  return apiRequest("/auth/me", { method: "DELETE" });
}

// ============================================================================
// PASSWORD RESET  (guide §8)
// ============================================================================

export function forgotPassword(email) {
  return apiRequest("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function resetPassword(email, token, newPassword) {
  return apiRequest("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ email, token, newPassword }),
  });
}

// ============================================================================
// CUSTOMERS  (guide §4)  — Gender is a NUMBER (0 = Male, 1 = Female)
// ============================================================================

export function getCustomers() {
  return apiRequest("/customers", { method: "GET" });
}

export function upsertCustomer({ firstName, lastName, phoneNumber, gender }) {
  return apiRequest("/customers", {
    method: "POST",
    body: JSON.stringify({
      FirstName: firstName,
      LastName: lastName,
      PhoneNumber: phoneNumber,
      Gender: gender, // number
    }),
  });
}

export function updateCustomer(id, { firstName, lastName, phoneNumber }) {
  return apiRequest(`/customers/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      ...(firstName != null ? { FirstName: firstName } : {}),
      ...(lastName != null ? { LastName: lastName } : {}),
      ...(phoneNumber != null ? { PhoneNumber: phoneNumber } : {}),
    }),
  });
}

export function deleteCustomer(id) {
  return apiRequest(`/customers/${id}`, { method: "DELETE" });
}

// ============================================================================
// MEASUREMENTS  (guide §5)
// ============================================================================

export function generateMeasurementLink(customerId, orderReference) {
  return apiRequest("/measurements/generate-link", {
    method: "POST",
    body: JSON.stringify({
      CustomerId: customerId,
      ...(orderReference ? { OrderReference: orderReference } : {}),
    }),
  });
}

// Generates a link for a brand-new customer: the backend creates a placeholder
// customer from the supplied name/phone, and the public form fills in the rest.
export function generateMeasurementLinkForNewCustomer({
  firstName,
  lastName,
  phoneNumber,
  orderReference,
}) {
  return apiRequest("/measurements/generate-link", {
    method: "POST",
    body: JSON.stringify({
      ...(firstName ? { FirstName: firstName } : {}),
      ...(lastName ? { LastName: lastName } : {}),
      ...(phoneNumber ? { PhoneNumber: phoneNumber } : {}),
      ...(orderReference ? { OrderReference: orderReference } : {}),
    }),
  });
}

// GET /api/subscription — read-only subscription state for the authenticated
// vendor. Used to pre-check whether link generation is allowed before POSTing
// to /measurements/generate-link. Shape: { isActive, status, isSubscriptionActive, subscriptionExpiresAt }.
export function getSubscription() {
  return apiRequest("/subscription", { method: "GET" });
}

export function getMeasurements() {
  return apiRequest("/measurements", { method: "GET" });
}

export function getMeasurement(id) {
  return apiRequest(`/measurements/${id}`, { method: "GET" });
}

// ============================================================================
// PUBLIC  (guide §6) — no auth
// ============================================================================

// The vendor's PUBLIC profile page in OUR app (/vendor/{username}). This is the
// canonical store-handle link customers open: it renders the vendor's business
// profile with a WhatsApp button. Never share the raw backend URL — it dumps
// JSON.
export function publicProfileLinkFor(username) {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/vendor/${encodeURIComponent(username)}`;
}

// Legacy in-app vanity link (/v/{username}): renders a result card and forwards
// active vendors straight to WhatsApp (guide §6.1). Kept for older shared links.
export function whatsappLinkFor(username) {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/v/${encodeURIComponent(username)}`;
}

// The raw backend vanity endpoint (guide §6.1). Used internally to probe the
// vendor's status and to forward active vendors to the server's 302 → wa.me.
export function backendVanityUrl(username) {
  return `${API_BASE_URL}/public/v/${encodeURIComponent(username)}`;
}

// Mirror of PublicController.RedirectToWhatsApp (guide §6.1): build the wa.me
// link directly from the vendor's raw WhatsApp number. wa.me expects digits
// only (no leading "+") and a percent-encoded prefilled message.
export function whatsappDirectLinkFor(whatsappNumber) {
  const digits = String(whatsappNumber || "").replace(/\D/g, "");
  if (!digits) return "";

  const message = encodeURIComponent(
    "Hi! I'd like to get my measurements taken for an order."
  );

  return `https://wa.me/${digits}?text=${message}`;
}

// Probe a vendor vanity link without following the 302 (guide §6.1).
// Returns one of:
//   { kind: "redirect" }                    — vendor active; navigate browser to link
//   { kind: "inactive"|"notfound"|"error", message }  — show a result card
export async function probeVendorVanity(username) {
  const url = backendVanityUrl(username);

  let response;
  try {
    response = await fetch(url, {
      method: "GET",
      redirect: "manual",
      headers: { Accept: "application/json" },
    });
  } catch {
    return {
      kind: "error",
      message:
        "We couldn't reach the server. Check your connection and try again.",
    };
  }

  // A 3xx (shown as an opaque redirect under CORS) means the vendor is active.
  if (
    response.type === "opaqueredirect" ||
    (response.status >= 300 && response.status < 400)
  ) {
    return { kind: "redirect" };
  }

  let body = null;
  const text = await response.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
  }

  const message = readErrorMessage(body, response.status);

  if (response.status === 404) {
    return { kind: "notfound", message };
  }

  if (/inactive/i.test(message)) {
    return { kind: "inactive", message };
  }

  return { kind: "error", message };
}

// Fetch the vendor's public business profile for the customer-facing profile
// page (guide §6.3). Public — no auth. Returns the raw vendor object, or throws
// ApiError with the backend message (404 "Vendor not found." / 400 inactive).
export function getPublicVendorProfile(username) {
  return apiRequest(`/public/v/${encodeURIComponent(username)}/profile`, {
    method: "GET",
  });
}

// Submit measurement photos. Exactly one of heightCm / referencePhoto.
// The optional customer details fill in the placeholder customer created at
// link-generation time (ignored for existing customers by the backend).
export function submitPublicMeasurement(
  token,
  { frontPhoto, sidePhoto, heightCm, referencePhoto, firstName, lastName, phoneNumber, gender }
) {
  const form = new FormData();
  form.append("FrontPhoto", frontPhoto);
  form.append("SidePhoto", sidePhoto);

  if (heightCm != null && heightCm !== "") {
    form.append("HeightCm", String(heightCm));
  } else if (referencePhoto) {
    form.append("ReferencePhoto", referencePhoto);
  }

  if (firstName) form.append("FirstName", firstName);
  if (lastName) form.append("LastName", lastName);
  if (phoneNumber) form.append("PhoneNumber", phoneNumber);
  if (gender != null) form.append("Gender", String(gender));

  return apiRequest(`/public/measure/${token}`, {
    method: "POST",
    body: form,
  });
}

export { API_BASE_URL };
