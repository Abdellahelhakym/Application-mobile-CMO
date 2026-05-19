import url from "./url";

async function signCandidat(candidat) {
  try {
    const response = await fetch(url() + "signup/candidat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(candidat),
    });

    const text = await response.text();

    let data = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch (parseError) {
      data = { message: text };
    }

  
    if (!response.ok) {
      console.log("Backend error:", data);

      return {
        success: false,
        message: data?.message || "Erreur serveur",
      };
    }

  
    return {
      success: true,
      message: data?.message || "Succès",
      data,
    };

  } catch (error) {
    console.error("Error signing up candidat:", error);

    return {
      success: false,
      message: "Erreur réseau ou serveur",
    };
  }
}




export { signCandidat };