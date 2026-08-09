const API_BASE_URL = "http://127.0.0.1:8000/api";

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("auth_token");

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  // Add authentication token when available
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  let data;

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    const error = new Error(
      data.message || `Request failed with status ${response.status}`
    );

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
}

// ================================
// SIGN UP
// ================================
export function signup(userData) {
  return apiRequest("/signup", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

// ================================
// VERIFY EMAIL
// ================================
export function verifyEmail(email, otp) {
  return apiRequest("/verify-email", {
    method: "POST",
    body: JSON.stringify({
      email,
      otp,
    }),
  });
}

// ================================
// RESEND OTP
// ================================
export function resendOtp(email) {
  return apiRequest("/resend-otp", {
    method: "POST",
    body: JSON.stringify({
      email,
    }),
  });
}

// ================================
// LOGIN
// ================================
export function login(loginValue, password) {
  return apiRequest("/login", {
    method: "POST",
    body: JSON.stringify({
      login: loginValue,
      password,
    }),
  });
}

// ================================
// GET PROFILE
// ================================
export function getProfile() {
  return apiRequest("/profile");
}

// ================================
// LOGOUT
// ================================
export function logout() {
  return apiRequest("/logout", {
    method: "POST",
  });
}