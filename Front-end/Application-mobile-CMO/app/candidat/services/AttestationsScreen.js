import url from "@/app/services/url.js";
import { getTokenId } from "./token_id";


export async function updateFils(fichier, id_attestation, id_document_manquant) {
    try {
        const token_id = await getTokenId();

        const formData = new FormData();

        formData.append("token_id", token_id);
        if (id_attestation != null) {
            formData.append("id_attestation", id_attestation);
        }
        if (id_document_manquant != null) {
            formData.append("id_document_manquant", id_document_manquant);
        }
        formData.append("fichier", fichier);

        const response = await fetch(url() + "candidat/attestations/updateAttestations", {
            method: "POST",
            body: formData,
        });

        const data = await response.json();

        return data;

    } catch (error) {
        console.error("Error updating fils:", error);
        throw error;
    }
}
export async function getFils() {
    try {
        const token_id = await getTokenId();
        const response = await fetch(url() + "candidat/attestations/getAttestations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token_id }),
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching fils:", error);
        throw error;
    }
}

export async function deletDocument(id_attestation) {
    try {
        const token_id = await getTokenId();
        const response = await fetch(url() + "candidat/attestations/deleteAttestation", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token_id, id_attestation }),
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error deleting document:", error);
        throw error;
    }
}

export async function getListFils() {
    try {
        const token_id = await getTokenId();
        const response = await fetch(url() + "candidat/attestations", {
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
export async function getCategorie() {
    try {
        const token_id = await getTokenId();
        const response = await fetch(url() + "candidat/attestations/categorie", {
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
