import url from "@/app/services/url.js";
import { getTokenId } from "../../employeur/services/token_id";

export async function getCandidats() {
    const token_id = await getTokenId();

    if (!token_id) {
        throw new Error("Session employeur introuvable");
    }

    const response = await fetch(`${url()}employeur/cv-database/candidat`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ token_id }),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result?.error || result?.message || "Erreur serveur");
    }

    return result;
}