import url from "./url";

async function signCandidat(candidat) {
  try {
    const response = await fetch(url() + "signup/candidat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
      console.log("Backend error:", data || text);
      return { success: false, error: data || text };
    }

    return data || { success: true };

  } catch (error) {
    console.error("Error signing up candidat:", error);
    return { success: false, error };
  }
}

export { signCandidat };