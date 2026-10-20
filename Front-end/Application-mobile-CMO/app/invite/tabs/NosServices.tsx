import { Asset } from "expo-asset";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const RDV_URL = "https://www.conceptmaindoeuvre.com/prendre-rendez-vous";

const CATEGORIES = [
  { emoji: "🇫🇷", titre: "Main-d'œuvre locale" },
  { emoji: "🇪🇺", titre: "Main-d'œuvre en Europe de l'Est" },
  { emoji: "🇲🇦", titre: "Main-d'œuvre internationale (marocaine)" },
];

type Service = {
  image: number;
  titre: string;
  accroche: string;
  sous: string;
  intro: string;
  profilsTitre: string;
  profils: [string, string[]][];
  cats: [string[], string[], string[]]; // locale, Europe de l'Est, Maroc
  pourquoiTitre: string;
  pourquoi: string[];
};

const POURQUOI_STANDARD = [
  "Sélection rigoureuse des candidats selon les qualifications requises",
  "Renfort temporaire ou embauche longue durée",
  "Accompagnement avant, pendant et après l'embauche",
  "Gestion administrative complète : visas, autorisations de travail, hébergement",
  "Garantie satisfaction : période d'essai pour valider le profil",
];

const SERVICES: Service[] = [
  {
    image: require("@/img/servicesImg/img_1.webp"),
    titre: "Hôtellerie & Restauration",
    accroche:
      "Avec près de 100 millions de touristes en 2023, nos équipes passionnées garantissent un accueil chaleureux et des séjours inoubliables.",
    sous: "Des professionnels qualifiés pour les secteurs exigeants",
    intro:
      "Dans l'hôtellerie et la restauration, la qualité du service et la réactivité sont essentielles, surtout en période de forte activité. CMO sélectionne des travailleurs pour les hôtels, restaurants et établissements touristiques.",
    profilsTitre: "Profils disponibles",
    profils: [
      ["Métiers de la restauration", ["Cuisiniers & chefs de partie", "Commis de cuisine", "Serveurs & chefs de rang", "Plongeurs & aides de cuisine"]],
      ["Métiers de l'hôtellerie", ["Réceptionnistes & concierges", "Gouvernants & valets / femmes de chambre", "Bagagistes & voituriers"]],
      ["Tourisme et animation", ["Barmans & sommeliers", "Animateurs & guides touristiques"]],
    ],
    cats: [
      ["Disponibilité immédiate pour faire face aux urgences", "Embauche rapide et sans contrainte", "Intégration rapide, maîtrise des attentes clients"],
      ["Profils qualifiés, habitués aux exigences du secteur", "Recrutement simplifié grâce aux accords intra-européens", "Idéal pour les missions longues, réservation anticipée recommandée"],
      ["Expérience reconnue en hôtellerie et restauration", "Contrats nominatifs = 0 turnover, stabilité totale", "Gestion administrative et logistique assurée par CMO"],
    ],
    pourquoiTitre: "Pourquoi choisir CMO ?",
    pourquoi: [
      "Sélection rigoureuse pour garantir un service de qualité",
      "Renfort temporaire ou embauche longue durée",
      "Accompagnement : visas, autorisations de travail, contrats",
      "Garantie satisfaction : période d'essai",
    ],
  },
  {
    image: require("@/img/servicesImg/img_2.webp"),
    titre: "Chauffeurs Poids Lourds",
    accroche:
      "Garants de la logistique, nos chauffeurs poids lourds assurent les livraisons avec rigueur et fiabilité. Leur savoir-faire fait avancer toute l'économie.",
    sous: "Des conducteurs expérimentés pour le transport",
    intro:
      "Face à la pénurie de conducteurs, CMO propose des chauffeurs confirmés, formés et immédiatement opérationnels, titulaires des permis requis et formés aux normes de sécurité routière et de logistique.",
    profilsTitre: "Profils disponibles",
    profils: [
      ["Chauffeurs poids lourds (PL)", ["Transport de marchandises, courte et longue distance", "Chargement et déchargement dans le respect des normes de sécurité", "Conduite d'engins adaptés à la réglementation"]],
      ["Chauffeurs super lourd (SPL)", ["Semi-remorque, camion-benne, citerne ou frigo", "Trajets nationaux et internationaux", "Respect strict des temps de conduite et de repos"]],
      ["Chauffeurs d'engins spécialisés", ["Grue mobile, camion-toupie, porte-char", "Manutention et transport de matériaux lourds"]],
    ],
    cats: [
      ["Chauffeurs disponibles rapidement", "Connaissance de la réglementation et du terrain", "Embauche simplifiée"],
      ["Conducteurs expérimentés", "Recrutement facilité par les accords intra-européens", "Réservation anticipée recommandée"],
      ["Chauffeurs expérimentés formés aux normes de sécurité", "Gestion administrative et logistique assurée par CMO", "Solution pour les besoins à long terme"],
    ],
    pourquoiTitre: "Vous cherchez des chauffeurs compétents ?",
    pourquoi: ["Contactez-nous pour une solution rapide et efficace", "Conducteurs titulaires des permis requis", "Formés aux normes de sécurité routière et de logistique"],
  },
  {
    image: require("@/img/servicesImg/img_3.webp"),
    titre: "Conducteurs d'engins",
    accroche:
      "Maillons essentiels des chantiers, nos conducteurs d'engins manient précision et puissance pour façonner les infrastructures de demain en toute sécurité.",
    sous: "Des conducteurs d'engins expérimentés",
    intro:
      "Grâce à notre expertise dans le BTP, les travaux publics, l'agriculture et l'industrie, CMO recrute des conducteurs qualifiés, prêts à intégrer vos équipes rapidement.",
    profilsTitre: "Engins maîtrisés",
    profils: [
      ["Engins de chantier", ["Pelleteuses, bulldozers", "Niveleuses, chargeuses, tombereaux"]],
      ["Engins agricoles", ["Tracteurs, moissonneuses-batteuses", "Pulvérisateurs, ensileuses"]],
      ["Engins de levage", ["Grues mobiles", "Nacelles élévatrices, chariots télescopiques"]],
      ["Terrassement et VRD", ["Pelles hydrauliques", "Compacteurs, finisseurs de routes"]],
    ],
    cats: [
      ["Disponibles immédiatement sur le territoire français", "Idéal pour les besoins urgents ou missions courtes", "Expérience des réglementations locales et du terrain"],
      ["Profils de Pologne, Roumanie, Bulgarie…", "Expertise technique et certifications européennes", "Qualifiée, compétitive, spécialisée et flexible"],
      ["Conducteurs expérimentés du Maroc, formés aux normes européennes et françaises", "Aide aux démarches administratives et d'immigration", "Idéal pour les besoins à long terme"],
    ],
    pourquoiTitre: "Certifications et engagements",
    pourquoi: [
      "CACES (Certificat d'aptitude à la conduite en sécurité)",
      "Habilitations spécifiques selon le poste",
      "Formation continue aux normes de sécurité",
      "Recrutement sur mesure, gestion administrative incluse",
      "Solutions flexibles, adaptées à votre budget",
    ],
  },
  {
    image: require("@/img/servicesImg/img_4.webp"),
    titre: "Auxiliaire de vie",
    accroche:
      "Présents au quotidien, nos auxiliaires de vie apportent écoute, soutien et dignité aux personnes fragiles.",
    sous: "Des auxiliaires de vie qualifiés et fiables",
    intro:
      "CMO recrute des auxiliaires de vie qualifiés et stables pour les personnes âgées, en situation de handicap ou en perte d'autonomie, et vous aide à monter vos dossiers d'aides financières (APA, PCH, aide-ménagère, crédit d'impôt, CESU).",
    profilsTitre: "Missions",
    profils: [
      ["Au quotidien", ["Aide à la toilette et à l'hygiène", "Aide à la mobilité (déplacements intérieurs et extérieurs)", "Préparation et prise des repas", "Aide aux tâches ménagères (domicile et linge)", "Accompagnement social et soutien moral", "Suivi des traitements médicaux (hors actes médicaux)"]],
    ],
    cats: [
      ["Disponibilité immédiate pour les besoins urgents", "Embauche simplifiée sans lourdeur administrative", "Auxiliaires francophones, échange facilité"],
      ["Profils expérimentés, habitués au travail en établissement", "Recrutement simplifié grâce aux accords intra-européens", "Réservation recommandée (1 mois minimum)"],
      ["Expérience avérée auprès des personnes dépendantes", "Contrats nominatifs = 0 turnover, continuité du service", "Gestion administrative et logistique assurée par CMO"],
    ],
    pourquoiTitre: "Pourquoi choisir CMO ?",
    pourquoi: POURQUOI_STANDARD,
  },
  {
    image: require("@/img/servicesImg/img_5.webp"),
    titre: "Agriculture",
    accroche:
      "Essentielle à chaque récolte, notre main-d'œuvre agricole incarne le cœur battant de nos campagnes. Compétente, fiable et engagée.",
    sous: "Une main-d'œuvre agricole fiable pour toutes les saisons",
    intro:
      "L'agriculture nécessite une main-d'œuvre adaptée à chaque saison. CMO facilite l'embauche d'ouvriers saisonniers en maraîchage, viticulture, arboriculture, horticulture et élevage.",
    profilsTitre: "Travaux par saison",
    profils: [
      ["Hiver (déc. – fév.)", ["Taille en arboriculture et viticulture", "Ouvrier en exploitation laitière (traite, alimentation)", "Ouvrier avicole (œufs, soins aux volailles)", "Ouvrier en élevage bovin et ovin"]],
      ["Printemps (mars – mai)", ["Ouvrier maraîcher (sols, plantation de légumes)", "Ouvrier arboricole (taille, floraisons, traitements)", "Ouvrier viticole (ébourgeonnage, palissage)", "Surveillance des naissances en élevage"]],
      ["Été (juin – août)", ["Cueilleur de fruits rouges (fraises, cerises, framboises)", "Récoltant de légumes", "Vendangeur (premières vendanges)", "Manutentionnaire agricole"]],
      ["Automne (sept. – nov.)", ["Vendangeur (récolte du raisin)", "Cueilleur de pommes et poires", "Récoltant de betteraves, potirons, choux", "Agent de tri et conditionnement", "Tractoriste agricole"]],
    ],
    cats: [
      ["Disponibilité immédiate pour les besoins urgents", "Embauche simplifiée, sans formalités complexes", "Maîtrise du français, sans barrière linguistique"],
      ["Robuste et expérimentée, habituée aux conditions exigeantes", "Recrutement facilité par les accords intra-européens", "Réservation à l'avance (1 mois minimum recommandé)"],
      ["Partenariat historique France–Maroc, depuis le décret de 1963", "Saisonniers marocains recrutés : France 15 700 (2022) puis 16 000 (2023)", "Italie 15 350 (2023) et Espagne 17 200 (2023)"],
    ],
    pourquoiTitre: "Pourquoi choisir CMO ?",
    pourquoi: ["Recrutement efficace, légal et optimisé", "Main-d'œuvre fiable, qualifiée et immédiatement disponible", "Réseau de partenaires en France et en Europe"],
  },
  {
    image: require("@/img/servicesImg/img_6.webp"),
    titre: "BTP",
    accroche:
      "Acteurs clés des infrastructures, nos professionnels du BTP bâtissent, rénovent et transforment votre quotidien avec précision, force et savoir-faire.",
    sous: "Un recrutement adapté aux besoins du secteur du BTP",
    intro:
      "Le bâtiment et les travaux publics exigent une main-d'œuvre qualifiée pour respecter les délais et la qualité des chantiers. CMO recrute pour des missions ponctuelles, saisonnières ou de longue durée.",
    profilsTitre: "Profils disponibles",
    profils: [
      ["Gros œuvre", ["Maçons, coffreurs, ferrailleurs", "Grutiers, conducteurs de travaux"]],
      ["Second œuvre", ["Électriciens, plombiers, chauffagistes", "Peintres, plaquistes, carreleurs"]],
      ["Travaux publics", ["Conducteurs d'engins (pelles, bulldozers, chargeuses)", "Canalisateurs, terrassiers"]],
      ["Encadrement & gestion de chantier", ["Chefs de chantier, chefs d'équipe", "Conducteurs de travaux"]],
    ],
    cats: [
      ["Disponibilité immédiate pour les besoins urgents", "Embauche rapide sans formalités complexes", "Connaissance du marché et des normes locales"],
      ["Travailleurs qualifiés et endurants, habitués aux conditions difficiles", "Recrutement simplifié grâce aux accords intra-européens", "Réservation requise (1 mois minimum)"],
      ["Profils expérimentés adaptés aux métiers du BTP", "Gestion administrative et logistique assurée par CMO", "Solution adaptée aux besoins à long terme"],
    ],
    pourquoiTitre: "Pourquoi choisir CMO pour le BTP ?",
    pourquoi: POURQUOI_STANDARD,
  },
];

// Affiche le collage (3 photos) en entier, sans rognage, à la bonne proportion
const ImageService = ({ source }: { source: number }) => {
  const [ratio, setRatio] = useState<number>(() => {
    const a = Asset.fromModule(source);
    return a.width && a.height ? a.width / a.height : 16 / 9;
  });

  useEffect(() => {
    let annule = false;
    const a = Asset.fromModule(source);
    a.downloadAsync()
      .then(() => {
        if (!annule && a.width && a.height) setRatio(a.width / a.height);
      })
      .catch(() => {});
    return () => {
      annule = true;
    };
  }, [source]);

  const [largeur, setLargeur] = useState(0);

  return (
    <View style={styles.imageWrap} onLayout={(e) => setLargeur(e.nativeEvent.layout.width)}>
      {largeur > 0 && (
        <Image
          source={source}
          resizeMode="contain"
          style={{ width: largeur, height: largeur / ratio }}
        />
      )}
    </View>
  );
};

const Liste = ({ items }: { items: string[] }) => (
  <View>
    {items.map((i) => (
      <Text key={i} style={styles.puce}>
        •  {i}
      </Text>
    ))}
  </View>
);

export default function NosServices() {
  const [ouverts, setOuverts] = useState<Record<string, boolean>>({});
  const basculer = (id: string) => setOuverts((o) => ({ ...o, [id]: !o[id] }));

  const openInternalLink = async (url: string) => {
    try {
      await WebBrowser.openBrowserAsync(url, {
        toolbarColor: "#122F78",
        controlsColor: "#ffffff",
        showTitle: true,
        enableBarCollapsing: true,
      });
    } catch (error) {
      console.log("Erreur lors de l'ouverture du lien :", error);
      Alert.alert("Erreur", "Impossible d'ouvrir la page.");
    }
  };

  const Bouton = () => (
    <Pressable style={styles.bouton} onPress={() => openInternalLink(RDV_URL)} accessibilityRole="button">
      <Text style={styles.boutonTexte}>Prendre rendez-vous</Text>
      <Text style={styles.fleche}>⟶</Text>
    </Pressable>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contenu}>
      <Text style={styles.pageTitre}>Nos services</Text>

      {SERVICES.map((s) => (
        <View key={s.titre} style={styles.bloc}>
          <Text style={styles.titre}>{s.titre}</Text>
          <Text style={styles.texte}>{s.accroche}</Text>
          <Bouton />

          <ImageService source={s.image} />

          <Pressable
            style={styles.flecheLigne}
            onPress={() => basculer(s.titre)}
            accessibilityRole="button"
            accessibilityState={{ expanded: !!ouverts[s.titre] }}
          >
            <Text style={styles.flecheLabel}>{ouverts[s.titre] ? "Masquer les détails" : "Voir les détails"}</Text>
            <View style={styles.flecheRond}>
              <Text style={styles.flecheIcone}>{ouverts[s.titre] ? "▲" : "▼"}</Text>
            </View>
          </Pressable>

          {ouverts[s.titre] && (
            <View>
              <Text style={styles.sousTitre}>{s.sous}</Text>
              <Text style={styles.texteNormal}>{s.intro}</Text>

              <Text style={styles.section}>{s.profilsTitre}</Text>
              {s.profils.map(([titre, items]) => (
                <View key={titre} style={styles.carte}>
                  <Text style={styles.carteTitre}>{titre}</Text>
                  <Liste items={items} />
                </View>
              ))}

              <Text style={styles.section}>Nos catégories de main-d'œuvre</Text>
              {CATEGORIES.map((c, i) => (
                <View key={c.titre} style={styles.carte}>
                  <Text style={styles.carteTitre}>
                    {c.emoji}  {c.titre}
                  </Text>
                  <Liste items={s.cats[i]} />
                </View>
              ))}

              <Text style={styles.section}>{s.pourquoiTitre}</Text>
              <View style={styles.carte}>
                <Liste items={s.pourquoi} />
              </View>

              <Bouton />
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  contenu: { padding: 16, paddingBottom: 40 },

  pageTitre: { fontSize: 36, fontWeight: "600", color: "#122F78", marginTop: 20, marginBottom: 28 },

  bloc: { marginBottom: 40, paddingBottom: 32, borderBottomWidth: 1, borderBottomColor: "#E2E8F4" },
  titre: { fontSize: 32, fontWeight: "600", color: "#122F78", lineHeight: 36 },
  texte: { fontSize: 14, fontWeight: "500", color: "#122F78", lineHeight: 26, marginTop: 16 },
  texteNormal: { fontSize: 14, color: "#122F78", lineHeight: 24, marginTop: 10 },

  bouton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#2B4590",
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginTop: 22,
    marginBottom: 20,
  },
  boutonTexte: { color: "#FFFFFF", fontSize: 16, fontWeight: "500" },
  fleche: { color: "#FFFFFF", fontSize: 24, marginLeft: 12 },

  imageWrap: { width: "100%", overflow: "hidden" },

  flecheLigne: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 18, paddingVertical: 10 },
  flecheLabel: { fontSize: 16, fontWeight: "600", color: "#2B4590" },
  flecheRond: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#2B4590", alignItems: "center", justifyContent: "center" },
  flecheIcone: { color: "#FFFFFF", fontSize: 14 },

  sousTitre: { fontSize: 24, color: "#3F5CA8", marginTop: 28, lineHeight: 30 },
  section: { fontSize: 20, fontWeight: "600", color: "#3F5CA8", marginTop: 26, marginBottom: 12 },

  carte: { backgroundColor: "#F4F7FC", borderRadius: 20, padding: 16, marginBottom: 10 },
  carteTitre: { fontSize: 16, fontWeight: "700", color: "#122F78", marginBottom: 6 },
  puce: { fontSize: 14, color: "#122F78", lineHeight: 22, marginTop: 2 },
});