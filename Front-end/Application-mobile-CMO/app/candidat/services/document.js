import { fetch } from "expo/fetch";          // remplace le fetch global (obligatoire pour l'upload sur iOS)
import { File } from "expo-file-system";     // pas "/legacy"
import { getTokenId } from "./token_id";
import url from "@/app/services/url.js";

// Le token doit toujours être une chaîne dans le FormData
async function getTokenString() {
    const token = await getTokenId();
    if (token && typeof token === "object") {
        return String(token.token_id ?? token.token ?? "");
    }
    return String(token ?? "");
}

//--------------------img------------------------------
export async function updateImage(image) {
    try {
        if (!image?.uri) throw new Error("Fichier invalide : uri manquante");

        const formData = new FormData();
        formData.append("token_id", await getTokenString());
        formData.append("image", new File(image.uri));

        const response = await fetch(url() + "candidat/documents/updateImage", {
            method: "POST",
            body: formData,
        });

        return await response.json();
    } catch (error) {
        console.error("Error updating image:", error);
        throw error;
    }
}

export async function getImage() {
    try {
        const token_id = await getTokenString();
        const response = await fetch(url() + "candidat/documents/getImage", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token_id }),
        });
        return await response.json();
    } catch (error) {
        console.error("Error fetching image:", error);
        throw error;
    }
}

export async function DeleteImage() {
    try {
        const token_id = await getTokenString();
        const response = await fetch(url() + "candidat/documents/deleteImage", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token_id }),
        });
        return await response.json();
    } catch (error) {
        console.error("Error deleting image:", error);
        throw error;
    }
}