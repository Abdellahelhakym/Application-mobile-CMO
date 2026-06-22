import { getTokenId } from "../../employeur/services/token_id";

import url from "@/app/services/url.js";

export async function getMessages(){
        try {
        const token_id = await getTokenId(); 
        const response = await fetch(url() + "employeur/messagerie/getMessages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token_id }),
        });
        const data = await response.json();
        return data;
        } catch (error) {
        console.error("Error fetching messages:", error);
        throw error;
    }
}
export async function sendMessage(message , sujet){
        try {
        const token_id = await getTokenId(); 
        const response = await fetch(url() + "employeur/messagerie/sendMessage", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token_id, message, sujet }),
        });
        const data = await response.json();
        return data;
        } catch (error) {
        console.error("Error sending message:", error);
        throw error;
    }
}