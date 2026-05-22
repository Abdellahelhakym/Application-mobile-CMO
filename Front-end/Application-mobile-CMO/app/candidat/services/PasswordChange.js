import { getTokenId } from "./token_id";
import url from "@/app/services/url.js";

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