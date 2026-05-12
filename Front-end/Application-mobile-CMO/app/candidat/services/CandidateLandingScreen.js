import { getTokenId } from "./token_id";
import url from "@/app/services/url.js";

export async function getCandidatures() {
    try {
        const token_id = await getTokenId(); //  FIX IMPORTANT
        const response = await fetch(url() + "candidat/candidature", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token_id}`,
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