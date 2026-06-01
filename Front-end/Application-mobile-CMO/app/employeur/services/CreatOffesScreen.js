import { getTokenId, getPsaudo } from "../../employeur/services/token_id";
import url from "@/app/services/url.js";

export async function createCommande(data) {
    const token_id = getTokenId();
    const psaudo = getPsaudo();

    if (!token_id || !psaudo) {
        throw new Error("Informations utilisateur manquantes");
    }

    const response = await fetch(`${url()}employeur/create-offer/commande`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ token_id, psaudo, data }),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result?.error || result?.message || "Erreur serveur");
    }

    return result;
}