import url from "@/app/services/url.js";
import { getTokenId } from "./token_id";

export async function changePassword( currentPassword, newPassword) {
    try {
        const token_id = await getTokenId();
        const response = await fetch(url() + "change-password/employeur", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token_id, currentPassword, newPassword }),
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error changing password:", error);
        throw error;
    }
}

// forgot password
export async function forgotPassword(email) {
    const Email_app = email;
  const response = await fetch(
    "http://conceptmaindoeuvre.com/forget_app_mobile.php",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ Email_app }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Erreur serveur.");
  }

  return data;
}