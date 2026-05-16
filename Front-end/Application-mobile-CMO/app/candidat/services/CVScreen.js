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

// Mobilité 

export async function getMobiliteUser() {
    try {
        const token_id = await getTokenId();
        const response = await fetch(url() + "candidat/cv/Mobilite", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token_id }),
        });
        const data = await response.json();
        return data;   
    } catch (error) {
        console.error("Error fetching mobilite:", error);
        throw error;
    }
}


export async function getToutMobilite() {
    try {
        const token_id = await getTokenId();
        const response = await fetch(url() + "candidat/cv/ToutMobilite", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token_id }),
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching tout mobilite:", error);
        throw error;
    }
}



export async function getPermis() {
    try {
        const token_id = await getTokenId();
        const response = await fetch(url() + "candidat/cv/Permis", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token_id }),
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching permis:", error);
        throw error;
    }
}

export async function getLangues() {
    try {
        const token_id = await getTokenId();
        const response = await fetch(url() + "candidat/cv/Langues", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token_id }),
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching langues:", error);
        throw error;
    }
}



export async function getExperiences() {
    try {
        const token_id = await getTokenId();
        const response = await fetch(url() + "candidat/cv/Experiences", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token_id }),
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching experiences:", error);
        throw error;
    }
}


export async function getFormations() {
    try {
        const token_id = await getTokenId();
        const response = await fetch(url() + "candidat/cv/Formations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token_id }),
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching formations:", error);
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

export async function updateMobilite(mobilite, niveau_etude, experience, contrat_prefere1, contrat_prefere2, disponibilite, date_disponibilite) {
    try {
        const token_id = await getTokenId();
        const response = await fetch(url() + "candidat/cv/updateMobilite", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token_id, mobilite, niveau_etude, experience, contrat_prefere1, contrat_prefere2, disponibilite, date_disponibilite }),
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error updating mobilite:", error);
        throw error;
    }
}


export async function updatePermis(perm_am, perm_a1, perm_a2, perm_a, perm_b1, perm_b, perm_c1, perm_c, perm_d1, perm_d, perm_be, perm_c1e, perm_ce, perm_d1e, perm_de, perm_cotier, perm_fluvial, perm_grandes_eaux, perm_hauturier) {
    try {
        const token_id = await getTokenId();
        const response = await fetch(url() + "candidat/cv/updatePermis", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token_id, perm_am, perm_a1, perm_a2, perm_a, perm_b1, perm_b, perm_c1, perm_c, perm_d1, perm_d, perm_be, perm_c1e, perm_ce, perm_d1e, perm_de, perm_cotier, perm_fluvial, perm_grandes_eaux, perm_hauturier }),
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error updating permis:", error);
        throw error;
    }
}


export async function updateLangues(lang_fr, lang_en, lang_es, lang_de, lang_it, lang_ch, lang_po, lang_da, lang_ru, lang_ar, lang_ne, lang_por, lang_no, lang_fi) {
    try {
        const token_id = await getTokenId();
        const response = await fetch(url() + "candidat/cv/updateLangues", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token_id, lang_fr, lang_en, lang_es, lang_de, lang_it, lang_ch, lang_po, lang_da, lang_ru, lang_ar, lang_ne, lang_por, lang_no, lang_fi }),
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error updating langues:", error);
        throw error;
    }
}



export async function updateExperiences(date1, date2, titre, societe, ville_pays, pays, description) {
    try {
        const token_id = await getTokenId();
        const response = await fetch(url() + "candidat/cv/updateExperiences", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token_id, date1, date2, titre, societe, ville_pays, pays, description }),
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error updating experiences:", error);
        throw error;
    }
}


export async function updateFormations(ecole, diplome, mois_debut, annee_debut, mois_obtention, annee_obtention, description) {
    try {
        const token_id = await getTokenId();
        const response = await fetch(url() + "candidat/cv/updateFormations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token_id, ecole, diplome, mois_debut, annee_debut, mois_obtention, annee_obtention, description }),
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error updating formations:", error);
        throw error;
    }
}