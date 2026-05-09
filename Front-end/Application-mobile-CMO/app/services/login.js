import url from "./url";

 async function login(data) {
  try{
    const response = await fetch(url() + "login/candidat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message);
  }

  return result;
  }catch(error){
    console.error("Error during login:", error);
    return { success: false, error: error.message || "An error occurred during login." };
  }
}

export  { login };