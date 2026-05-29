let tokenId = null;
let psaudo = null;


function setTokenId(token) {
  tokenId = token;
}

function getTokenId() {
  return tokenId;
}

function setPsaudo(pseudo) {
  psaudo = pseudo;
}
function getPsaudo() {
  return psaudo;
}

export { setTokenId, getTokenId, setPsaudo, getPsaudo };