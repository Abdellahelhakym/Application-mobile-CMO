import { getTokenId } from "../../employeur/services/token_id";

import url from "@/app/services/url.js";

export async function getCommandes(){
        try {
        const token_id = await getTokenId(); 
        const response = await fetch(url() + "employeur/my-offers/commandes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token_id }),
        });
        const data = await response.json();
        return data;
        } catch (error) {
        console.error("Error fetching candidatures:", error);
        throw error;
    }
}
export async function getDevis(){
    try {
        const token_id = await getTokenId(); 
        const response = await fetch(url() + "employeur/my-offers/devis", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token_id }),
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching candidatures:", error);
        throw error;
    }
}