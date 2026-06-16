import { getTokenId } from "../../employeur/services/token_id";
import url from "@/app/services/url.js";

//--------------------img------------------------------
export async function updateImage(image) {
    try {
        const token_id = await getTokenId();

        const formData = new FormData();

        formData.append("token_id", token_id);
        formData.append("image", image);

        const response = await fetch(url() + "employeur/documents/updateImage", {
            method: "POST",
            body: formData,
        });

        const data = await response.json();

        return data;

    } catch (error) {
        console.error("Error updating image:", error);
        throw error;
    }
}
export async function getImage() {
    try {
        const token_id = await getTokenId();
        const response = await fetch(url() + "employeur/documents/getImage", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token_id }),
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching image:", error);
        throw error;
    }
}

export async function DeleteImage() {
    try {
        const token_id = await getTokenId();
        const response = await fetch(url() + "employeur/documents/deleteImage", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token_id }),
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error deleting image:", error);
        throw error;
    }
}
