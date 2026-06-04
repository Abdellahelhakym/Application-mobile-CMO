# 📱 Application Mobile CMO


## 🛠️ Outils et Technologies Utilisés

Le projet repose sur une architecture **3-Tiers** scindant la présentation, la logique métier et les données.

### 💻 Front-end (Application Mobile)

- **React Native & TypeScript  & JavaScript** — Framework et langage principal pour une application multiplateforme native et réactive
- **Expo / Expo Go** — Outils pour le développement, le suivi et les tests sur environnement réel ou virtuel
- **Fetch API** — Communication asynchrone avec les API du Back-end
- **Figma & Pinterest** — Inspiration UI/UX et conception des maquettes graphiques

### ⚙️ Back-end (Serveur API)

- **Node.js & Express.js** — Environnement serveur et framework REST rapide et modulaire
- **CORS** — Middleware pour autoriser les communications cross-origin avec le terminal mobile
- **Dotenv** — Gestion sécurisée des variables de configuration (fichiers `.env`)
- **Multer** — Gestion des uploads de fichiers (CV, photos de profil, attestations)

### 🗄️ Base de Données & Outils de Gestion

- **MySQL & phpMyAdmin** — Système de base de données relationnelle et son interface d'administration
- **Pool de Connexions** — Implémenté dans `db.js` pour optimiser la réutilisation des connexions actives
- **Sécurité** — Hachage des mots de passe, contrôle des accès, validation des formats (PDF, PNG, JPG)
- **Git & GitHub** — Gestion de version et suivi du code source

---

## 🗂️ Structure de l'Architecture

```
📁 APPLICATION-MOBILE-CMO/
│
├── 📁 Back-end/
│   ├── app.js                         # Point d'entrée Express, routage général
│   ├── db.js                          # Connexion MySQL via Pool de connexions
│   ├── login.js                       # Authentification sécurisée
│   ├── signup.js                      # Inscription Candidat / Employeur
│   ├── changePassword.js              # Changement de mot de passe sécurisé
│   ├── .env                           # Variables d'environnement (Port, DB)
│   ├── package.json
│   │
│   ├── 📁 candidat/
│   │   ├── DashboardScreen.js         # Statistiques et résumé d'activité
│   │   ├── CandidatureScreen.js       # Envoi et suivi des postulations
│   │   ├── CVScreen.js                # Gestion du profil et du CV
│   │   ├── ProfileScreen.js           # Accès aux sous-modules du profil
│   │   ├── FavoritesScreen.js         # Offres sauvegardées en favoris
│   │   ├── AttestationsScreen.js      # Documents et certifications
│   │   └── 📁 fils/
│   │       ├── 📁 Document/           # CV et fichiers PDF candidats
│   │       └── 📁 img_user/           # Photos de profil utilisateur
│   │
│   └── 📁 employeur/
│       ├── EmployerDashboard.js       # Tableau de bord et indicateurs
│       ├── MyOffers.js                # Offres publiées par l'entreprise
│       ├── CreateOffer.js             # Publication d'une nouvelle offre
│       ├── CVDatabase.js              # Consultation des profils candidats
│       ├── EmployerInfo.js            # Données d'identité de l'entreprise
│       ├── EmployeurCandidatures.js   # Traitement des candidatures reçues
│       └── Subscription.js           # Forfaits et abonnements
│
└── 📁 Front-end (Application-mobile-CMO)/
    ├── index.tsx                      # Point d'entrée et navigation principale
    ├── loginCan.tsx                   # Interface de connexion Candidat
    ├── loginEmp.tsx                   # Interface de connexion Employeur
    ├── RegisterCandidateScreen.tsx    # Formulaire d'inscription Candidat
    ├── RegisterEmployeurScreen.tsx    # Formulaire d'inscription Employeur
    ├── ForgotPasswordScreen.tsx       # Récupération de compte
    │
    ├── 📁 service/
    │   ├── url.js                     # URL racine de l'API (Ngrok / Serveur)
    │   └── login.js                   # Fonctions fetch d'authentification
    │
    ├── 📁 candidat/
    │   ├── 📁 services/               # Appels API du périmètre candidat
    │   ├── 📁 tabs/                   # Écrans principaux (Bottom Tabs)
    │   └── 📁 autre/                  # Écrans secondaires et formulaires
    │
    └── 📁 employeur/
        ├── 📁 services/               # Appels API du périmètre employeur
        ├── 📁 tabs/                   # Écrans du tableau de bord recruteur
        └── 📁 autre/                  # Vues secondaires (détail CV, paiements)
```

---
--------------------------------------------------------------Back-end 

## 🌐 Routes de l'API Back-end

Toutes les requêtes transitent au format JSON via des appels HTTP REST.

### 🔐 Services Communs

| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/login/candidat` | Authentification d'un candidat |
| `POST` | `/login/employeur` | Authentification d'un employeur |
| `POST` | `/signup` | Inscription d'un nouvel utilisateur |
| `POST` | `/change-password` | Mise à jour sécurisée du mot de passe |

### 👤 Endpoints Candidat (`/candidat`)

| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/candidat/dashboard` | Statistiques, compteurs d'activité, documents manquants |
| `POST` | `/candidat/dashboard/secteurs` | Répartition des candidatures par secteur métier |
| `POST` | `/candidat/candidature` | Liste des offres auxquelles le candidat a postulé |
| `POST` | `/candidat/candidature/ajouterFavoris` | Ajouter ou retirer une offre des favoris |
| `POST` | `/candidat/candidature/isFavorite` | Vérifier si une offre est en favoris |
| `POST` | `/candidat/favorites` | Liste complète des offres favorites |
| `POST` | `/candidat/cv/Informations` | Données personnelles du candidat |
| `POST` | `/candidat/cv/Mobilite` | Régions de mobilité et préférences de contrat |
| `POST` | `/candidat/cv/ToutMobilite` | Liste de toutes les régions disponibles |
| `POST` | `/candidat/cv/Permis` | Permis de conduire du candidat |
| `POST` | `/candidat/cv/Langues` | Langues maîtrisées |
| `GET`  | `/candidat/cv/Secteur` | Tous les secteurs / métiers disponibles |
| `POST` | `/candidat/cv/Secteur` | Secteurs choisis par le candidat |
| `POST` | `/candidat/cv/experiences` | Expériences professionnelles |
| `POST` | `/candidat/cv/formation` | Formations scolaires |
| `POST` | `/candidat/cv/updateInformations` | Modifier les données personnelles |
| `POST` | `/candidat/cv/updateMobilite` | Modifier la mobilité et préférences |
| `POST` | `/candidat/cv/updatePermis` | Modifier les permis |
| `POST` | `/candidat/cv/updateLangues` | Modifier les langues |
| `POST` | `/candidat/cv/updateSecteur` | Modifier les secteurs métier |
| `POST` | `/candidat/cv/addExperience` | Ajouter une expérience |
| `POST` | `/candidat/cv/updateExperiences` | Modifier une expérience |
| `POST` | `/candidat/cv/deleteExperiences` | Supprimer une expérience |
| `POST` | `/candidat/cv/addFormation` | Ajouter une formation |
| `POST` | `/candidat/cv/updateFormation` | Modifier une formation |
| `POST` | `/candidat/cv/deleteFormation` | Supprimer une formation |
| `POST` | `/candidat/cv/getImage` | Récupérer la photo de profil |
| `POST` | `/candidat/cv/updateImage` | Modifier la photo de profil |
| `POST` | `/candidat/cv/deleteImage` | Supprimer la photo de profil |
| `POST` | `/candidat/attestations` | Liste des documents requis et leur statut |
| `POST` | `/candidat/attestations/categorie` | Catégories d'attestations disponibles |
| `POST` | `/candidat/attestations/getAttestations` | Fichiers uploadés par le candidat |
| `POST` | `/candidat/attestations/updateAttestations` | Uploader un document (PDF) |
| `POST` | `/candidat/attestations/deleteAttestation` | Supprimer un document |
| `POST` | `/candidat/profile/data` | Pseudo, email, téléphone et pays du candidat |
| `GET` | `/files/*` | Accès statique aux fichiers (images, documents PDF) |

### 🏢 Endpoints Employeur (`/employeur`)

| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/employeur/dashboard/pseudo` | Nom de l'entreprise connectée |
| `POST` | `/employeur/dashboard/phase1` | Statistiques Phase 1 — nouvelles commandes, postes, statuts fiches |
| `POST` | `/employeur/dashboard/phase2` | Statistiques Phase 2 — affectations et statuts candidats |
| `POST` | `/employeur/dashboard/phase3` | Statistiques Phase 3 — suivi avancement (statuts 18/19/20) |
| `POST` | `/employeur/dashboard/phase4` | Statistiques Phase 4 — suivi avancement (statuts 21/22/23/24) |
| `POST` | `/employeur/dashboard/phase5` | Statistiques Phase 5 — suivi avancement (statuts 25/26/27) |
| `POST` | `/employeur/dashboard/pack` | Forfait actif de l'entreprise (`id_formule`) |
| `POST` | `/employeur/my-offers/commandes` | Liste des fiches de poste publiées (statuts 1/2/3) avec catégorie métier |
| `POST` | `/employeur/my-offers/devis` | Liste des devis liés aux fiches de poste de l'entreprise |
| `POST` | `/employeur/create-offer/commande` | Créer une nouvelle fiche de poste (offre d'emploi) |
| `POST` | `/employeur/cv-database/candidat` | Base complète des candidats avec secteurs, mobilité, parcours et attestations |
| `POST` | `/employeur/info/getInfo` | Récupérer toutes les informations de l'entreprise |
| `POST` | `/employeur/info/updateInfo` | Modifier les informations de l'entreprise (adresse, responsable, SIREN…) |
| `POST` | `/employeur/candidatures/getCandidatures` | Candidats affectés en cours (statut candidat ≠ 3) |
| `POST` | `/employeur/candidatures/getCandidaturesValide` | Candidats validés (statut candidat = 3) |
| `POST` | `/employeur/candidatures/setCandidaturesValide` | Valider un candidat (passer son statut à 3) |
| `POST` | `/employeur/subscription/historique` | Historique de facturation et nom du pack actif |

---

## 🚀 Installation et Lancement


### 1. Configuration de la Base de Données

#### 🖥️ En local avec XAMPP

1. Téléchargez et installez **XAMPP** depuis [https://www.apachefriends.org](https://www.apachefriends.org)
2. Démarrez les modules **Apache** et **MySQL** depuis le panneau de contrôle XAMPP
3. Ouvrez **phpMyAdmin** à l'adresse `http://localhost/phpmyadmin`
4. Importez ensuite la base de donner  SQL via le **phpMyAdmin** .
5. Renseignez vos informations de connexion dans le fichier `.env` :

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=cmo
DB_PORT=3000
```

> Par défaut sous XAMPP, l'utilisateur est `root` et le mot de passe est vide.

#### ☁️ En hébergement distant (serveur en ligne)

Renseignez les informations fournies par votre hébergeur dans le fichier `.env` :

```env
PORT=3000
DB_HOST=votre_host_hebergeur        # ex: sql.monhebergeur.com
DB_USER=votre_utilisateur_db
DB_PASS=votre_mot_de_passe_db
DB_NAME=votre_nom_base_de_donnees
```

### 2. Démarrage du Back-end

```bash
# Se placer dans le dossier serveur
cd Back-end

# Installer les dépendances
npm install

# Créer le fichier de configuration
# .env
PORT=3000
DB_HOST=localhost
DB_USER=votre_nom_utilisateur
DB_PASS=votre_mot_de_passe
DB_NAME=cmo_app_database

# Lancer le serveur
node app.js
# → "Server running on port 3000"
```


--------------------------------------------------------------Front-end 


## Structure du Projet
## Structure du Projet

```text
front-end/Application-mobile-CMO/
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── loginCan.tsx
│   ├── loginEmp.tsx
│   ├── ForgotPasswordScreen.tsx
│   ├── RegisterCandidateScreen.tsx
│   ├── RegisterEmployerScreen.tsx
│   │
│   ├── candidat/
│   │   ├── _layout.tsx
│   │   ├── tabs/
│   │   │   ├── _layout.tsx
│   │   │   ├── CandidateLandingScreen.tsx
│   │   │   ├── DashboardScreen.tsx
│   │   │   ├── CVScreen.tsx
│   │   │   ├── ProfileScreen.tsx
│   │   │   └── FavoritesScreen.tsx
│   │   │
│   │   ├── autre/
│   │   │   ├── AttestationsScreen.tsx
│   │   │   ├── CvScreenProfile.tsx
│   │   │   ├── FavoritesScreen.tsx
│   │   │   └── PasswordChange.tsx
│   │   │
│   │   └── services/
│   │       ├── CandidateLandingScreen.js
│   │       ├── CVScreen.js
│   │       ├── DashboardScreen.js
│   │       ├── ProfileScreen.js
│   │       ├── AttestationsScreen.js
│   │       ├── FavoritesScreen.js
│   │       ├── PasswordChange.js
│   │       └── token_id.js
│   │
│   ├── employeur/
│   │   ├── _layout.tsx
│   │   ├── tabs/
│   │   │   ├── _layout.tsx
│   │   │   ├── EmployerDashboard.tsx
│   │   │   ├── CreateOfferScreen.tsx
│   │   │   ├── CVDatabaseScreen.tsx
│   │   │   ├── MyOffersScreen.tsx
│   │   │   └── EmployerProfileScreen.tsx
│   │   │
│   │   ├── autre/
│   │   │   ├── EmployerInfoScreen.tsx
│   │   │   ├── EmployerDocumentsScreen.tsx
│   │   │   ├── EmployeurCandidatures.tsx
│   │   │   ├── PasswordChange.tsx
│   │   │   └── SubscriptionScreen.tsx
│   │   │
│   │   └── services/
│   │       ├── EmployerDashboard.js
│   │       ├── CVDatabaseScreen.js
│   │       ├── MyOffers.js
│   │       ├── CreatOffesScreen.js
│   │       ├── EmployeurCandidatures.js
│   │       ├── EmployerInfoScreen.js
│   │       ├── PasswordChange.js
│   │       ├── SubscriptionScreen.js
│   │       └── token_id.js
│   │
│   └── services/
│       ├── login.js
│       ├── sign.js
│       └── url.js
│
├── assets/
│   └── images/
│       ├── icon.png
│       └── logo.png
│
├── img/
│
├── app.json
├── eas.json
├── tsconfig.json
├── eslint.config.js
└── package.json
```
## Explication de la Structure des Fichiers

### Écrans d'Authentification

| Fichier                           | Description                                        |
| --------------------------------- | -------------------------------------------------- |
| `app/index.tsx`                   | Écran d'accueil/splash au lancement                |
| `app/loginCan.tsx`                | Interface de connexion candidat                    |
| `app/loginEmp.tsx`                | Interface de connexion employeur                   |
| `app/ForgotPasswordScreen.tsx`    | Fonctionnalité de réinitialisation du mot de passe |
| `app/RegisterCandidateScreen.tsx` | Formulaire d'inscription candidat                  |
| `app/RegisterEmployerScreen.tsx`  | Formulaire d'inscription employeur                 |

### Module Candidat

| Fichier/Dossier            | Description                                |
| -------------------------- | ------------------------------------------ |
| `app/candidat/_layout.tsx` | Structure de navigation pour les candidats |
| `app/candidat/tabs/`       | Écrans de navigation par onglets           |
| `app/candidat/autre/`      | Écrans supplémentaires pour les candidats  |
| `app/candidat/services/`   | Appels aux services API des candidats      |

**Écrans Principaux du Candidat :**

* **CandidateLandingScreen** - Page principale et consultation des offres
* **DashboardScreen** - Analyses et statistiques
* **CVScreen** - Gestion et consultation du CV
* **ProfileScreen** - Gestion du profil personnel
* **FavoritesScreen** - Offres d'emploi enregistrées

### Module Employeur

| Fichier/Dossier             | Description                                 |
| --------------------------- | ------------------------------------------- |
| `app/employeur/_layout.tsx` | Structure de navigation pour les employeurs |
| `app/employeur/tabs/`       | Écrans de navigation par onglets            |
| `app/employeur/autre/`      | Écrans supplémentaires pour les employeurs  |
| `app/employeur/services/`   | Appels aux services API des employeurs      |

**Écrans Principaux de l'Employeur :**

* **EmployerDashboard** - Vue d'ensemble et statistiques
* **CreateOfferScreen** - Publication de nouvelles offres d'emploi
* **CVDatabaseScreen** - Consultation des CV candidats
* **MyOffersScreen** - Gestion des offres publiées
* **EmployeurCandidatures** - Consultation des candidatures

### Services Partagés

| Fichier                 | Description                             |
| ----------------------- | --------------------------------------- |
| `app/services/url.js`   | Configuration de l'URL de base de l'API |
| `app/services/login.js` | Fonctions du service de connexion       |
| `app/services/sign.js`  | Fonctions du service d'inscription      |

### Fichiers de Configuration

| Fichier            | Description                                               |
| ------------------ | --------------------------------------------------------- |
| `app.json`         | Configuration de l'application Expo, permissions, plugins |
| `eas.json`         | Profils de build EAS et paramètres de distribution        |
| `tsconfig.json`    | Options du compilateur TypeScript                         |
| `eslint.config.js` | Règles de style de code et de linting                     |
| `package.json`     | Dépendances et scripts du projet                          |

### Ressources

| Dossier          | Contenu                                |
| ---------------- | -------------------------------------- |
| `assets/images/` | Icônes, logos, images de splash screen |
| `img/`           | Ressources d'images supplémentaires    |

---


### Description des Répertoires

| Répertoire       | Description                                                        |
| ---------------- | ------------------------------------------------------------------ |
| `app/`           | Code principal de l'application avec routage basé sur les fichiers |
| `app/candidat/`  | Toutes les fonctionnalités destinées aux candidats                 |
| `app/employeur/` | Toutes les fonctionnalités destinées aux employeurs                |
| `app/services/`  | Services partagés et communication avec l'API                      |
| `assets/`        | Ressources statiques (images, icônes, polices)                     |
| `img/`           | Ressources d'images supplémentaires                                |

---

## Prérequis

Avant de commencer, assurez-vous d'avoir installé les éléments suivants :

### Logiciels Requis

1. **Node.js** (v18.0.0 ou supérieure)

   * Téléchargement : https://nodejs.org/
   * Vérification : `node --version`

2. **npm** (v9.0.0 ou supérieure, inclus avec Node.js)

   * Vérification : `npm --version`

3. **Expo CLI** (v19.0.5 ou supérieure)

   ```bash
   npm install -g expo-cli
   ```

   * Vérification : `expo --version`

4. **Serveur API Backend**

   * Assurez-vous que le serveur backend est en cours d'exécution (configuré dans `app/services/url.js`)
   * Par défaut : `http://192.168.0.114:3000/`

---

## Configuration du Frontend

### 1. Installer les Dépendances

```bash
npm install
```

Cette commande installe tous les packages requis listés dans `package.json`.

### 2. Configurer l'Environnement

#### URL de Base

Avant de démarrer, mettez à jour l'URL de l'API dans `app/service/url.js` selon votre environnement :

##### 🖥️ En local

Récupérez l'adresse IP de votre machine en exécutant dans le terminal Windows :

```cmd
ipconfig
```

Repérez l'**Adresse IPv4** (ex : `192.168.1.10`) et renseignez-la dans `service/url.js` :

```javascript
// service/url.js
export default function url() {
  return "http://192.168.1.10:3000/"; // Remplacez par votre IP locale + le '/' final
}
```

> ⚠️ Votre smartphone et votre PC doivent être connectés au **même réseau Wi-Fi**.

##### ☁️ En hébergement distant

```javascript
// service/url.js
export default function url() {
  return "https://votre-domaine.com/"; // URL de votre serveur hébergé + le '/' final
}
```

### 3. Lancer l'Application

```bash
npm start
# ou
npx expo start
```

Cette commande lance le serveur de développement Expo. Un QR code s'affichera dans le terminal.

#### Exécution avec Expo Go

1. Démarrez le serveur de développement : `npm start`
2. Scannez le QR code avec :

   * **Android** : application Expo Go (depuis Google Play Store)
   * **iOS** : application Appareil photo ou Expo Go (depuis l'App Store)
3. L'application se charge dans Expo Go avec le rechargement automatique


-------------en resume :


###  Lancement de l'Application Mobile (Front-end)

```bash
# Se placer dans le dossier front-end
cd Application-mobile-CMO

# Installer les dépendances
npm install
```

Avant de démarrer, mettez à jour l'URL de l'API dans `service/url.js` selon votre environnement :

#### 🖥️ En local

Récupérez l'adresse IP de votre machine en exécutant dans le terminal Windows :

```cmd
ipconfig
```

Repérez l'**Adresse IPv4** (ex: `192.168.1.10`) et renseignez-la dans `service/url.js` :

```javascript
// service/url.js
export default function url() {
  return "http://192.168.1.10:3000/"; // Remplacez par votre IP locale + le '/' final
}
```

> ⚠️ Votre smartphone et votre PC doivent être connectés au **même réseau Wi-Fi**.

#### ☁️ En hébergement distant

```javascript
// service/url.js
export default function url() {
  return "https://votre-domaine.com/"; // URL de votre serveur hébergé + le '/' final
}
```

Démarrez ensuite le serveur de développement :

```bash
npm start
```

Scannez le QR Code affiché avec l'application Expo Go sur votre smartphone pour lancer l'application sur votre appareil.

Ou appuyez sur la touche w dans le terminal (ou cliquez sur Open in browser) pour ouvrir l'application dans votre navigateur web et la tester directement sur votre ordinateur.