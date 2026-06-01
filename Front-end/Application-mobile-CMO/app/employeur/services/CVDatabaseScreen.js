import { getTokenId, getPsaudo } from "../../employeur/services/token_id";
import url from "@/app/services/url.js";

export async function getCandidats() {
   
    const response = await fetch(`${url()}employeur/cv-database/candidat`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
       
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result?.error || result?.message || "Erreur serveur");
    }

    return result;
}