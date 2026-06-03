import { getTokenId } from "../../employeur/services/token_id";

import url from "@/app/services/url.js";

export async function getCandidat() {
    try {
        const token_id = await getTokenId(); 
        const response = await fetch(url() + "employeur/candidatures/getCandidatures", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token_id }),
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching employer candidatures:", error);
        throw error;
    }
}
export async function getCandidatValides() {
    try {
        const token_id = await getTokenId(); 
        const response = await fetch(url() + "employeur/candidatures/getCandidaturesValide", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token_id }),
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching employer candidatures:", error);
        throw error;
    }
}

export async function setCandidatValides(id_candidat) {
    try {
        const token_id = await getTokenId(); 
        const response = await fetch(url() + "employeur/candidatures/setCandidaturesValide", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token_id, id_candidat }),
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching employer candidatures:", error);
        throw error;
    }
}
