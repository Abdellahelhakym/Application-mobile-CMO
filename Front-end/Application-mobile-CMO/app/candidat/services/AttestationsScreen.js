import url from "@/app/services/url.js";
import { getTokenId } from "./token_id";


//-----------------------------------------------------------
//---------------------documents-----------------------------
//-----------------------------------------------------------

// ✅ updateDocument avec logging pour déboguer
export async function updateDocument(document, id_attestation) {
  try {
    console.log('📤 updateDocument appelé avec:', { id_attestation });
    
    const token_id = await getTokenId();
    console.log('✅ token_id reçu:', token_id);

    const formData = new FormData();

    formData.append("token_id", token_id);
    formData.append("document", document);
    formData.append("id_attestation", String(id_attestation));

    const apiUrl = url() + "candidat/attestations/updateAttestations";
    console.log('🔗 URL API:', apiUrl);
    console.log('📋 FormData préparé - appel API...');

    const response = await fetch(apiUrl, {
      method: "POST",
      body: formData,
    });

    console.log('📨 Réponse status:', response.status);

    // ✅ Lire comme texte d'abord pour déboguer
    const responseText = await response.text();
    console.log('📨 Réponse brute (premiers 500 chars):', responseText.substring(0, 500));

    // Vérifier si c'est du JSON
    if (!responseText.startsWith('{') && !responseText.startsWith('[')) {
      console.error('❌ La réponse n\'est pas du JSON!');
      console.error('Réponse complète:', responseText);
      throw new Error(`Erreur API (status ${response.status}): ${responseText.substring(0, 300)}`);
    }

    const data = JSON.parse(responseText);
    console.log('✅ Réponse API:', data);

    return data;
  } catch (error) {
    console.error("❌ Error uploading document:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    throw error;
  }
}

export async function getDocument() {
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
        console.error("Error fetching document:", error);
        throw error;
    }
}

// ✅ CORRECTION : DeleteDocument prend id_attestation
export async function DeleteDocument(id_attestation) {
    try {
        console.log('🗑️ DeleteDocument appelé avec:', { id_attestation });
        
        const token_id = await getTokenId();
        const response = await fetch(url() + "candidat/attestations/deleteAttestation", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
                token_id,
                id_attestation
            }),
        });
        
        console.log('📨 Delete réponse status:', response.status);
        
        const responseText = await response.text();
        console.log('📨 Delete réponse brute:', responseText.substring(0, 500));

        if (!responseText.startsWith('{') && !responseText.startsWith('[')) {
          throw new Error(`Erreur API (status ${response.status}): ${responseText.substring(0, 300)}`);
        }

        const data = JSON.parse(responseText);
        console.log('✅ Delete réponse API:', data);
        
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