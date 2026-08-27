// services/dashboard.js

import { getTokenId, setPsaudo } from "./token_id";
import url from "@/app/services/url.js";

let dashboardRequestPromise = null;
let lastDashboardData = null;
let lastDashboardFetchAt = 0;

const DASHBOARD_CACHE_MS = 3000;

// Récupérer les données du dashboard
export async function getDashboardData() {
  const now = Date.now();

  if (
    lastDashboardData &&
    now - lastDashboardFetchAt < DASHBOARD_CACHE_MS
  ) {
    return lastDashboardData;
  }

  if (dashboardRequestPromise) {
    return dashboardRequestPromise;
  }

  dashboardRequestPromise = (async () => {
    try {
      const token_id = await getTokenId();

      const response = await fetch(url() + "candidat/Dashboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token_id }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      lastDashboardData = data;
      lastDashboardFetchAt = Date.now();

      // Enregistrer le pseudo
      setPsaudo(data?.user?.nom ?? "");

      return data;
    } catch (error) {
      console.error("Dashboard Error:", error);
      setPsaudo("");
      return null;
    } finally {
      dashboardRequestPromise = null;
    }
  })();

  return dashboardRequestPromise;
}

// Récupérer les secteurs d'activité
export async function getSecteursActivite() {
  try {
    const token_id = await getTokenId();

    const response = await fetch(
      url() + "candidat/Dashboard/secteurs",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token_id }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching secteurs d'activité:", error);
    return [];
  }
}

// Récupérer les catégories de métiers
export async function categorieMetier() {
  try {
    const token_id = await getTokenId();

    const response = await fetch(
      url() + "candidat/Dashboard/categorieMetier",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token_id }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching catégories de métiers:", error);
    return [];
  }
}

// Récupérer le pseudo
export async function getPsaudo() {
  try {
    const token_id = await getTokenId();

    const response = await fetch(
      url() + "candidat/Dashboard/pseudo",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token_id }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching pseudo:", error);
    return null;
  }
}
