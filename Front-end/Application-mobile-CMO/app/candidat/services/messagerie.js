import { getTokenId } from "./token_id";

import url from "@/app/services/url.js";

export async function getMessages(){
        try {
        const token_id = await getTokenId(); 
        const response = await fetch(url() + "candidat/messagerie/getMessages", {
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
export async function getSousMessages(id_msg){
        try {
        const token_id = await getTokenId(); 
        const response = await fetch(url() + "candidat/messagerie/getSousMessages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token_id, id_msg }),
        });
        const data = await response.json();
        return data;
        } catch (error) {
        console.error("Error fetching sous-messages:", error);
        throw error;
    }
}



export async function CreateMessage(message , sujet ){
        try {
        const token_id = await getTokenId(); 
        const response = await fetch(url() + "candidat/messagerie/CreateMessage", {
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


export async function sendMessage(message , id_msg){
        try {
        const token_id = await getTokenId(); 
        const response = await fetch(url() + "candidat/messagerie/sendMessage", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token_id, message, id_msg }),
        });
        const data = await response.json();
        return data;
        } catch (error) {
        console.error("Error sending message:", error);
        throw error;
    }
}
export async function ClotureMessage( id_msg){
        try {
        const token_id = await getTokenId(); 
        const response = await fetch(url() + "candidat/messagerie/ClotureMessage", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token_id, id_msg }),
        });
        const data = await response.json();
        return data;
        } catch (error) {
        console.error("Error sending message:", error);
        throw error;
    }
}