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
export async function AccepterRefuserDevis(finaliser, id_fiche_post, id_devis){
    try {
        const token_id = await getTokenId(); 
        
        // On force la conversion en string ou nombre propre pour éviter les mauvaises surprises
        const bodyData = { 
            token_id, 
            finaliser: Number(finaliser), 
            id_fiche_post: String(id_fiche_post), 
            id_devis: Number(id_devis) 
        };

        console.log("Données envoyées au Backend :", bodyData);

        const response = await fetch(url() + "employeur/my-offers/AccepterRefuserDevis", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(bodyData),
        });

        // 🚨 SÉCURITÉ : Si le backend répond un code d'erreur (400, 404, 500...)
        if (!response.ok) {
            const errorResult = await response.json().catch(() => ({}));
            throw new Error(errorResult.error || `Erreur serveur (Code: ${response.status})`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Erreur dans AccepterRefuserDevis:", error);
        throw error;
    }
}


export async function getStatutFiche(){
    try {
        
        const response = await fetch(url() + "employeur/my-offers/getStatutFiche");
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching candidatures:", error);
        throw error;
    }
}