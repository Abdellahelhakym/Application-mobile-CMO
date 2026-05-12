// services/dashboard.js

import { getTokenId } from "./token_id";
import url from "@/app/services/url.js";

let dashboardRequestPromise = null;
let lastDashboardData = null;
let lastDashboardFetchAt = 0;
const DASHBOARD_CACHE_MS = 3000;

// Récupérer les données du dashboard
export async function getDashboardData() {
  const now = Date.now();
  if (lastDashboardData && now - lastDashboardFetchAt < DASHBOARD_CACHE_MS) {
    return lastDashboardData;
  }

  if (dashboardRequestPromise) {
    return dashboardRequestPromise;
  }

  try {
    dashboardRequestPromise = (async () => {
      const token_id = await getTokenId();

      const response = await fetch(url() + "candidat/Dashboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token_id }),
      });

      const data = await response.json();
      lastDashboardData = data;
      lastDashboardFetchAt = Date.now();
      return data;
    })();

    return await dashboardRequestPromise;
  } catch (error) {
    console.log("Dashboard Error:", error);
    return null;
  } finally {
    dashboardRequestPromise = null;
  }
}

// Compatible helper for legacy callers expecting getUserPseudo.
export async function getUserPseudo() {
  const data = await getDashboardData();
  return data?.user?.nom ?? "";
}

