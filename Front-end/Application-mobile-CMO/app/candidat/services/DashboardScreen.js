// services/dashboard.js

import { getTokenId } from "./token_id";
import url from "@/app/services/url.js";

// Récupérer les données du dashboard
export async function getDashboardData() {
  try {
    const token_id = await getTokenId(); // 🔥 FIX IMPORTANT

    const response = await fetch(url() + "candidat/Dashboard", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token_id }),
    });

    const data = await response.json();

    return data;
  } catch (error) {
    console.log("Dashboard Error:", error);
    return null;
  }
}


export async function getUserPseudo() {
  try {
    const dashboard = await getDashboardData();

    return dashboard?.user?.nom || "";
  } catch (error) {
    console.log("Pseudo Error:", error);
    return "";
  }
}