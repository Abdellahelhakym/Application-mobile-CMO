
import url from "@/app/services/url.js";

export async function getOffres(page){
        try {
        
        const response = await fetch(url() + "employeur/my-offers/getAllOffres", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ page }),
        });
        const data = await response.json();
        return data;
        } catch (error) {
        console.error("Error fetching candidatures:", error);
        throw error;
    }
}