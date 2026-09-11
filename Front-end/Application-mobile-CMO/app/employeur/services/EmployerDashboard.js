import { getTokenId } from "../../employeur/services/token_id";

import url from "@/app/services/url.js";


async function getPhase1(){
      try {
        const token_id = await getTokenId(); 
        const response = await fetch(url() + "employeur/dashboard/phase1", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
               
            },
            body: JSON.stringify({ token_id }),
        });
        const data = await response.json();
        return data;    
    }catch (error) {
        console.error("Error fetching candidatures:", error);
        throw error;
    }
}
async function getPhase2(){
      try {
        const token_id = await getTokenId(); 
        const response = await fetch(url() + "employeur/dashboard/phase2", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
               
            },
            body: JSON.stringify({ token_id }),
        });
        const data = await response.json();
        return data;    
    }catch (error) {
        console.error("Error fetching candidatures:", error);
        throw error;
    }
}
async function getPhase3(){
      try {
        const token_id = await getTokenId(); 
        const response = await fetch(url() + "employeur/dashboard/phase3", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
               
            },
            body: JSON.stringify({ token_id }),
        });
        const data = await response.json();
        return data;    
    }catch (error) {
        console.error("Error fetching candidatures:", error);
        throw error;
    }
}
async function getPhase4(){
      try {
        const token_id = await getTokenId(); 
        const response = await fetch(url() + "employeur/dashboard/phase4", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
               
            },
            body: JSON.stringify({ token_id }),
        });
        const data = await response.json();
        return data;    
    }catch (error) {
        console.error("Error fetching candidatures:", error);
        throw error;
    }
}
async function getPhase5(){
      try {
        const token_id = await getTokenId(); 
        const response = await fetch(url() + "employeur/dashboard/phase5", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
               
            },
            body: JSON.stringify({ token_id }),
        });
        const data = await response.json();
        return data;    
    }catch (error) {
        console.error("Error fetching candidatures:", error);
        throw error;
    }
}


 async function getPack(){
      try {
        const token_id = await getTokenId(); 
        const response = await fetch(url() + "employeur/dashboard/pack", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
               
            },
            body: JSON.stringify({ token_id }),
        });
        const data = await response.json();
        return data;    
    }catch (error) {
        console.error("Error fetching pack:", error);
        throw error;
    }
}



export async function getTelAgent() {
  try {
    const token_id = await getTokenId();

    const response = await fetch(
      url() + "employeur/Dashboard/telAgent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token_id }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching tel agent:", error);
    return null;
  }
}

export { getPhase1, getPhase2, getPhase3, getPhase4, getPhase5, getPack };
