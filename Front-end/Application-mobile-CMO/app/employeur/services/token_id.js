let tokenId = null;
let Raison= null;


function setTokenId(token) {
  tokenId = token;
}

function getTokenId() {
  return tokenId;
}

function setRaison(pseudo) {
  Raison = pseudo;
}
function getRaison() {
  return Raison;
}

export { setTokenId, getTokenId, setRaison, getRaison };