import { getTokenId } from "../../employeur/services/token_id";
import url from "@/app/services/url.js";

export async function createCommande(data) {
    const token_id = getTokenId();
   

    if (!token_id ) {
        throw new Error("Informations utilisateur manquantes");
    }

    const response = await fetch(`${url()}employeur/create-offer/commande`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ token_id, data }),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result?.error || result?.message || "Erreur serveur");
    }

    return result;
}