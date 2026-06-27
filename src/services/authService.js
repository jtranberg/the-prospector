const API_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5050/api";

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
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Registration failed");
  }

  return data;
}

export async function login({ email, password }) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Login failed");
  }

  return data;
}

export async function getCurrentUser(token) {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: getHeaders(token),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Authentication failed");
  }

  return data.user;
}

export async function changePassword(
  token,
  currentPassword,
  newPassword,
) {
  const response = await fetch(`${API_URL}/auth/change-password`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify({
      currentPassword,
      newPassword,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Password update failed");
  }

  return data;
}