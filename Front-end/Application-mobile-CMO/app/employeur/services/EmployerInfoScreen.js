import { getTokenId } from "../../employeur/services/token_id";

import url from "@/app/services/url.js";



export async function getEmployerInfo(){
    try {
        const token_id = await getTokenId(); 
        const response = await fetch(url() + "employeur/profile/getInfo", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token_id }),
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching employer info:", error);
        throw error;
    }
}

export async function updateEmployerInfo(data) {
    try {
        const token_id = await getTokenId(); 
        const response = await fetch(url() + "employeur/profile/updateInfo", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token_id, data }),
        });
        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error updating employer info:", error);
        throw error;
    }
}