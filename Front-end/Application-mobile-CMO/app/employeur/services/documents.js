import { fetch } from "expo/fetch";          // remplace le fetch global (obligatoire pour l'upload sur iOS)
import { File } from "expo-file-system";     // pas "/legacy"
import { getTokenId } from "../../employeur/services/token_id";
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

        const response = await fetch(url() + "employeur/documents/updateImage", {
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
        const response = await fetch(url() + "employeur/documents/getImage", {
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
        const response = await fetch(url() + "employeur/documents/deleteImage", {
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

//-----------------------------------------------------------
//---------------------documents-----------------------------
//-----------------------------------------------------------

export async function updateDocument(document, id_typeDocument) {
    try {
        if (!document?.uri) throw new Error("Fichier invalide : uri manquante");

        const formData = new FormData();
        formData.append("token_id", await getTokenString());
        formData.append("document", new File(document.uri));
        formData.append("id_typeDocument", String(id_typeDocument));

        const response = await fetch(url() + "employeur/documents/updateDocument", {
            method: "POST",
            body: formData,
        });

        return await response.json();
    } catch (error) {
        console.error("Error uploading document:", error);
        throw error;
    }
}

export async function getDocument() {
    try {
        const token_id = await getTokenString();
        const response = await fetch(url() + "employeur/documents/getDocument", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token_id }),
        });
        return await response.json();
    } catch (error) {
        console.error("Error fetching document:", error);
        throw error;
    }
}

export async function DeleteDocument(id_document) {
    try {
        const token_id = await getTokenString();
        const response = await fetch(url() + "employeur/documents/deleteDocument", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token_id, id_document }),
        });
        return await response.json();
    } catch (error) {
        console.error("Error deleting document:", error);
        throw error;
    }
}