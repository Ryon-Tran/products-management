"use client";

export function setUserRole(role: string | null) {
  if (typeof window === "undefined") return;
  if (role) localStorage.setItem("pm_role", role);
  else localStorage.removeItem("pm_role");
}

export function getUserRole(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("pm_role");
}

export function isAdmin(): boolean {
  const r = getUserRole();
  return r === "admin";
}

export function logout() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("pm_user");
  localStorage.removeItem("pm_role");
  window.dispatchEvent(new Event("pm.auth"));
}
