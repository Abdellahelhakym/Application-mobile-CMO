import { getTokenId } from "./token_id";
import url from "@/app/services/url.js";

export async function getCandidatures() {
    try {
        const token_id = await getTokenId(); 
        const response = await fetch(url() + "candidat/candidature", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
               
            },
            body: JSON.stringify({ token_id }),
        });
        const data = await response.json();
        return data;    
    }catch (error) {
        console.error("Error fetching candidatures:", error);
        throw error;
    }
}


export async function addtoFavorites(id_offre, titre_offre) {
    try {
        const token_id = await getTokenId();
        const response = await fetch(url() + "candidat/candidature/ajouterFavoris", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                
            },
            body: JSON.stringify({ token_id, id_offre, titre_offre }),
        });
        const data = await response.json();
        return data;

    } catch (error) {
        console.error("Error adding to favorites:", error);
        throw error;
    }
}


export async function isfavorite(id_offre) {
    try {
        const token_id = await getTokenId();
        const response = await fetch(url() + "candidat/candidature/isFavorite", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
               
            },
            body: JSON.stringify({ token_id, id_offre }),
        });
        const data = await response.json();
        return data;

    } catch (error) {
        console.error("Error checking if favorite:", error);
        throw error;
    }
}

