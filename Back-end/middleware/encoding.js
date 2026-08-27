/**
 * ============================================================
 * MIDDLEWARE D'ENCODAGE / DÉCODAGE
 * UTF-8 <-> ISO-8859-1 / Latin1
 * ============================================================
 */

/**
 * Convertit une chaîne de caractères UTF-8 (envoyée par le Mobile)
 * vers le format Latin1 utilisé par la base de données Web Legacy.
 */
function encodeForLegacyWeb(value) {
    if (typeof value !== 'string') {
        return value;
    }

    try {
        return Buffer.from(value, 'utf8').toString('latin1');
    } catch (error) {
        console.error('Erreur encodage UTF-8 -> legacy :', error);
        return value;
    }
}

/**
 * Corrige le Mojibake
 *
 * Exemple :
 * "IngÃ©nierie" -> "Ingénierie"
 * "Ã‰" -> "É"
 *
 * Reconvertit les données Latin1 issues de la BDD
 * vers UTF-8 pour le Mobile.
 */
function fixMojibake(value) {
    if (typeof value !== 'string') {
        return value;
    }

    // Détecte les caractères typiques du Mojibake
    if (!/[\u00C0-\u00C3]/.test(value) && !/[ÃÂ]/.test(value)) {
        return value;
    }

    try {
        const decoded = Buffer.from(value, 'latin1').toString('utf8');

        // Si le décodage produit un caractère de remplacement,
        // on conserve la valeur originale.
        if (decoded.includes('\uFFFD')) {
            return value;
        }

        return decoded;
    } catch (error) {
        console.error('Erreur décodage legacy -> UTF-8 :', error);
        return value;
    }
}

/**
 * Encode toutes les valeurs textuelles d'un objet
 * vers le format Legacy (Latin1).
 *
 * Les objets Date sont conservés tels quels.
 */
function encodeObject(obj) {
    if (!obj || typeof obj !== 'object') {
        return obj;
    }

    // IMPORTANT :
    // Ne pas transformer les objets Date.
    if (obj instanceof Date) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(encodeObject);
    }

    return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [
            key,
            typeof value === 'string'
                ? encodeForLegacyWeb(value)
                : value
        ])
    );
}

/**
 * Fonction récursive pour décoder une valeur.
 *
 * Types gérés :
 * - String
 * - Array
 * - Object
 * - Date
 *
 * Les objets Date sont volontairement ignorés.
 */
function decodeObjectValue(value) {

    // String
    if (typeof value === 'string') {
        return fixMojibake(value);
    }

    // IMPORTANT :
    // Un Date est un objet JavaScript.
    // Il faut donc le tester AVANT le test "typeof value === 'object'".
    if (value instanceof Date) {
        return value;
    }

    // Array
    if (Array.isArray(value)) {
        return value.map(decodeObjectValue);
    }

    // Object
    if (value && typeof value === 'object') {
        return decodeObject(value);
    }

    return value;
}

/**
 * Décode toutes les valeurs d'un objet
 * venant de la BDD vers UTF-8.
 *
 * Les objets Date sont conservés tels quels.
 */
function decodeObject(obj) {

    if (!obj || typeof obj !== 'object') {
        return obj;
    }

    // IMPORTANT :
    // Si decodeObject() reçoit directement une Date,
    // on la retourne sans modification.
    if (obj instanceof Date) {
        return obj;
    }

    // Tableau
    if (Array.isArray(obj)) {
        return obj.map(decodeObjectValue);
    }

    return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [
            key,
            decodeObjectValue(value)
        ])
    );
}

module.exports = {
    encodeForLegacyWeb,
    fixMojibake,
    encodeObject,
    decodeObject
};
