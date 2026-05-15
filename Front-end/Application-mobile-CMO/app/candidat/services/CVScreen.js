import { getTokenId } from "./token_id";
import url from "@/app/services/url.js";

export async function getInformations() {
    try {
        const token_id = await getTokenId();
        const response = await fetch(url() + "candidat/cv/Informations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token_id }),
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching informations:", error);
        throw error;
    }
}


// update

export async function updateInformations(civilite, prenom, nom, email, tel, code_postal, ville, pays, num_secur_social) {
    try {
        const token_id = await getTokenId();
        const response = await fetch(url() + "candidat/cv/updateInformations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token_id, civilite, prenom, nom, email, tel, code_postal, ville, pays, num_secur_social  }),
            //
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error updating informations:", error);
        throw error;
    }
}