import { getTokenId } from "./token_id";
import url from "@/app/services/url.js";


export async function getProfile() {
    try {
        const token_id = await getTokenId();
        const response = await fetch(url() + "candidat/profile/data", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token_id }),
        });
        const data = await response.json();
        return data;

    } catch (error) {
        console.error("Error fetching profile:", error);
        throw error;
    }
}

export async function getPaysAutoriser() {
    try {
       
        const response = await fetch(url() + "candidat/profile/pays_autoriser");
        const data = await response.json();
        return data;

    } catch (error) {
        console.error("Error fetching profile:", error);
        throw error;
    }
}

