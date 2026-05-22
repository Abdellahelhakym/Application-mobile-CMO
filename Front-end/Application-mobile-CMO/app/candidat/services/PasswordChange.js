import url from "@/app/services/url.js";
import { getTokenId } from "./token_id";

export async function changePassword( currentPassword, newPassword) {
    try {
        const token_id = await getTokenId();
        const response = await fetch(url() + "change-password/candidat", {
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
    try {
      //  url() + "change-password/candidat/forget"
      //'http://conceptmaindoeuvre.com/forget_app_mobile.php'

        const response = await fetch('http://conceptmaindoeuvre.com/forget_app_mobile.php', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({email }),
        });
        const raw = await response.text();
        let data = null;
        if (raw) {
            try {
                data = JSON.parse(raw);
            } catch (_parseError) {
                data = null;
            }
        }

        if (!response.ok) {
            const message = data && data.message ? data.message : raw || "Erreur serveur.";
            throw new Error(message);
        }

        return data;
    } catch (error) {
        console.error("Error in forgot password:", error);
        throw error;
    }
}