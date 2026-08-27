import { decode } from 'html-entities';

export function fixUtf8Encoding(str) {
  if (!str || typeof str !== 'string') return '';

  let result = str;

  // 1. Décodage des entités HTML (&eacute;, &#233;, etc.)
  try {
    result = decode(result);
  } catch (e) {}

  // 2. Boucle de correction Mojibake (UTF-8 lu en Latin-1)
  // On tente de réparer jusqu'à 3 fois si l'encodage a été corrompu plusieurs fois
  for (let i = 0; i < 3; i++) {
    if (/[\xC2-\xF4][\x80-\xBF]/.test(result) || /Ã[\x80-\xBF]/.test(result)) {
      try {
        const fixed = decodeURIComponent(escape(result));
        if (fixed === result) break;
        result = fixed;
      } catch (e) {
        break;
      }
    } else {
      break;
    }
  }

  // 3. Nettoyage des séquences corrompues irrécupérables (ex: Ã?, Ã, etc.)
  result = result
    .replace(/Ã\?/g, 'é')  // Remplace explicitement les séquences "Ã?" fréquentes par "é"
    .replace(/\uFFFD/g, '') // Supprime les caractères de remplacement invalides
    .trim();

  return result;
}