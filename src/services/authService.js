const API_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5050";

function getHeaders(token) {
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

export async function register({ name, email, password }) {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ name, email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Registration failed");
  }

  return data;
}

export async function login({ email, password }) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Login failed");
  }

  return data;
}

export async function getCurrentUser(token) {
  const response = await fetch(`${API_URL}/api/auth/me`, {
    headers: getHeaders(token),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Authentication failed");
  }

  return data.user;
}

export async function changePassword(token, currentPassword, newPassword) {
  const response = await fetch(`${API_URL}/api/auth/change-password`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  const data = await response.json();

 if (!response.ok) {
  const error = new Error(data.error || "Login failed");
  error.status = response.status;
  throw error;
}

  return data;
}

export async function forgotPassword(email) {
  const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ email }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Unable to process password reset request");
  }

  return data;
}

export async function resetPassword(token, newPassword) {
  const response = await fetch(`${API_URL}/api/auth/reset-password`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ token, newPassword }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Unable to reset password");
  }

  return data;
}

export async function deleteMyData(token) {
  const response = await fetch(`${API_URL}/api/auth/delete-my-data`, {
    method: "DELETE",
    headers: getHeaders(token),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Unable to delete account data");
  }

  return data;
}