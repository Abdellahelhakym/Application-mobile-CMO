const bcrypt = require('bcrypt');

(async () => {
    const password = 'enMOhSjj5cAg';

    const phpHash = '$2y$12$WX79KKS4Gp0vO63d1v/EYeHju2R0.tjLSb1KFH3tRgGHpg8Lr7QLO';

    const nodeHash = phpHash.replace('$2y$', '$2b$');

    console.log("Avec hash original:");
    console.log(await bcrypt.compare(password, phpHash));

    console.log("Avec hash converti:");
    console.log(await bcrypt.compare(password, nodeHash));
})();