import url from "./url";

async function loginCan(data) {
  try {
    const response = await fetch(url() + "login/candidat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return { 
        ...result,
        success: false, 
        error: "" 
      };
    }

    return result;
  } catch (error) {
    console.log("Erreur de connexion:", error.message);
    return { 
      success: false, 
      error: "" 
    };
  }
}

async function loginEmp(data) {
  try {
    const response = await fetch(url() + "login/employeur", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return { 
        ...result,
        success: false, 
        error: "" 
      };
    }

    return result;
  } catch (error) {
    console.log("Erreur de connexion:", error.message);
    return { 
      success: false, 
      error: "" 
    };
  }
}

export { loginEmp, loginCan };