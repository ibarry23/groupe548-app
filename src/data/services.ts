import type { Lang } from '../i18n';

export type ServiceId =
  | 'residential-cleaning'
  | 'commercial-cleaning'
  | 'post-construction-cleaning'
  | 'window-cleaning'
  | 'moving'
  | 'transport-delivery'
  | 'interior-painting';

export type Family = 'cleaning' | 'moving' | 'painting';

type L = Record<Lang, string>;
type LList = Record<Lang, string[]>;

export interface Question {
  id: string;
  label: L;
  type: 'single' | 'multi' | 'text';
  options?: { id: string; label: L; sub?: L }[];
  placeholder?: L;
  cols?: 1 | 2;
}

export interface Service {
  id: ServiceId;
  family: Family;
  /** value used by the current website's form — kept so the business sees familiar labels */
  formValue: string;
  image?: 'cleaning' | 'moving' | 'transport' | 'painting';
  /** photorealistic still used by the service page hero (public/img/photos/<id>.jpg) */
  photo: boolean;
  /** cinematic clip for the service page hero (public/video/<id>.mp4 + <id>-poster.jpg) */
  clip?: boolean;
  icon: 'spray' | 'building' | 'hardhat' | 'window' | 'truck' | 'box' | 'roller';
  name: L;
  short: L;
  tagline: L;
  lead: L;
  includes: LList;
  factors: LList;
  note?: L;
  faqs: { q: L; a: L }[];
  combine: ServiceId[];
  questions: Question[];
}

const propertyType: Question = {
  id: 'property',
  type: 'single',
  label: { fr: 'Type de logement', en: 'Type of home' },
  options: [
    { id: 'apartment', label: { fr: 'Appartement', en: 'Apartment' } },
    { id: 'condo', label: { fr: 'Condo', en: 'Condo' } },
    { id: 'house', label: { fr: 'Maison', en: 'House' } },
    { id: 'office', label: { fr: 'Bureau / commerce', en: 'Office / shop' } },
  ],
};

const homeSize: Question = {
  id: 'size',
  type: 'single',
  label: { fr: 'Taille approximative', en: 'Approximate size' },
  options: [
    { id: 'small', label: { fr: 'Studio à 3½', en: 'Studio to 1-bed' } },
    { id: 'medium', label: { fr: '4½ à 5½', en: '2 to 3 bedrooms' } },
    { id: 'large', label: { fr: '6½ et plus', en: '4+ bedrooms' } },
    { id: 'house', label: { fr: 'Maison complète', en: 'Whole house' } },
  ],
};

export const SERVICES: Service[] = [
  {
    id: 'residential-cleaning',
    photo: true,
    clip: true,
    family: 'cleaning',
    formValue: 'nettoyage-residuel',
    image: 'cleaning',
    icon: 'spray',
    name: { fr: 'Nettoyage résidentiel', en: 'Residential cleaning' },
    short: { fr: 'Ménage résidentiel', en: 'Home cleaning' },
    tagline: { fr: 'Ménage complet, fin de bail, emménagement, grand ménage', en: 'Full clean, end of lease, move-in, deep clean' },
    lead: {
      fr: 'Vous quittez un logement, vous emménagez ou vous voulez simplement un vrai grand ménage? L’équipe s’occupe de tout, avec des produits certifiés et un résultat prêt à inspecter.',
      en: 'Leaving a rental, moving in or just want a proper deep clean? The team handles everything, with certified products and a result that is ready for inspection.',
    },
    includes: {
      fr: [
        'Ménage complet : appartement, condo ou maison',
        'Nettoyage de fin de bail et avant emménagement',
        'Nettoyage en profondeur : récurage, dégraissage, désinfection, cadres de fenêtres et plinthes',
        'Nettoyage en surface : déchets, balayage, propreté visible',
        'Nettoyage de tapis : extraction, taches, odeurs, traitement enzymatique',
        'Traitement de moisissures légères en surface',
      ],
      en: [
        'Full clean: apartment, condo or house',
        'End-of-lease and pre-move-in cleaning',
        'Deep clean: scrubbing, degreasing, disinfection, window frames and baseboards',
        'Surface clean: waste removal, sweeping, visible tidiness',
        'Carpet cleaning: extraction, stains, odours, enzymatic treatment',
        'Treatment of light surface mould',
      ],
    },
    factors: {
      fr: ['Superficie et nombre de pièces', 'État du logement et niveau de saleté', 'Services choisis : surface, profondeur, tapis', 'Date et souplesse de l’horaire'],
      en: ['Surface area and number of rooms', 'Condition of the home and level of dirt', 'Services chosen: surface, deep, carpets', 'Date and schedule flexibility'],
    },
    note: {
      fr: 'Pour une contamination importante ou une moisissure structurelle, une firme spécialisée est nécessaire. Nous vous le dirons honnêtement lors de l’évaluation.',
      en: 'Significant contamination or structural mould requires a specialised firm. We will tell you honestly during the assessment.',
    },
    faqs: [
      { q: { fr: 'Faites-vous le ménage de fin de bail?', en: 'Do you do end-of-lease cleaning?' }, a: { fr: 'Oui. Nous nettoyons le logement en profondeur pour le remettre propre, pièce par pièce.', en: 'Yes. We deep-clean the unit, room by room, so it is handed back spotless.' } },
      { q: { fr: 'Quels produits utilisez-vous?', en: 'What products do you use?' }, a: { fr: 'Des produits certifiés, non toxiques et biodégradables.', en: 'Certified, non-toxic and biodegradable products.' } },
      { q: { fr: 'Nettoyez-vous les tapis?', en: 'Do you clean carpets?' }, a: { fr: 'Oui : extraction, traitement des taches et des odeurs, traitement enzymatique.', en: 'Yes: extraction, stain and odour treatment, enzymatic treatment.' } },
    ],
    combine: ['moving', 'interior-painting', 'window-cleaning'],
    questions: [
      {
        id: 'kind',
        type: 'single',
        label: { fr: 'Quel type de nettoyage?', en: 'What kind of cleaning?' },
        options: [
          { id: 'full', label: { fr: 'Ménage complet', en: 'Full clean' } },
          { id: 'end-lease', label: { fr: 'Fin de bail', en: 'End of lease' } },
          { id: 'move-in', label: { fr: 'Avant emménagement', en: 'Before move-in' } },
          { id: 'deep', label: { fr: 'En profondeur', en: 'Deep clean' } },
          { id: 'carpet', label: { fr: 'Tapis', en: 'Carpets' } },
          { id: 'recurring', label: { fr: 'Entretien régulier', en: 'Regular upkeep' } },
        ],
      },
      propertyType,
      homeSize,
    ],
  },
  {
    id: 'commercial-cleaning',
    photo: true,
    clip: true,
    family: 'cleaning',
    formValue: 'nettoyage-commercial',
    icon: 'building',
    name: { fr: 'Nettoyage commercial', en: 'Commercial cleaning' },
    short: { fr: 'Nettoyage commercial', en: 'Commercial cleaning' },
    tagline: { fr: 'Bureaux, commerces, espaces communs d’immeubles', en: 'Offices, shops, building common areas' },
    lead: {
      fr: 'Un espace de travail propre rassure vos clients et motive votre équipe. Bureaux, vitrines, corridors, garages et espaces communs, selon l’horaire qui convient à votre entreprise — y compris le soir et la fin de semaine.',
      en: 'A clean workplace reassures your customers and motivates your team. Offices, storefronts, hallways, garages and common areas, on the schedule that suits your business — evenings and weekends included.',
    },
    includes: {
      fr: ['Bureaux, salles de réunion et aires ouvertes', 'Vitrines, entrées et halls', 'Corridors, escaliers et espaces communs de condos et d’immeubles', 'Garages et aires techniques', 'Planchers : balayage et lavage', 'Salles de bain, cuisines et salles de pause', 'Désinfection des surfaces à contact fréquent'],
      en: ['Offices, meeting rooms and open areas', 'Storefronts, entrances and lobbies', 'Hallways, stairwells and common areas of condos and buildings', 'Garages and technical areas', 'Floors: sweeping and washing', 'Restrooms, kitchens and break rooms', 'Disinfection of high-touch surfaces'],
    },
    factors: {
      fr: ['Superficie et type de surfaces', 'Fréquence : ponctuel, hebdomadaire ou quotidien', 'Plage horaire : jour, soir ou fin de semaine', 'Accès et exigences de l’immeuble'],
      en: ['Surface area and type of surfaces', 'Frequency: one-time, weekly or daily', 'Time slot: daytime, evening or weekend', 'Building access and requirements'],
    },
    faqs: [
      { q: { fr: 'Pouvez-vous nettoyer après les heures d’ouverture?', en: 'Can you clean outside business hours?' }, a: { fr: 'Oui, le soir et la fin de semaine, 7 jours sur 7.', en: 'Yes, evenings and weekends, 7 days a week.' } },
      { q: { fr: 'Ponctuel ou récurrent?', en: 'One-time or recurring?' }, a: { fr: 'Les deux. Une seule intervention ou une fréquence régulière adaptée à votre activité.', en: 'Both. A single visit or a regular schedule that fits your operations.' } },
    ],
    combine: ['window-cleaning', 'post-construction-cleaning'],
    questions: [
      {
        id: 'space',
        type: 'single',
        label: { fr: 'Type d’espace', en: 'Type of space' },
        options: [
          { id: 'office', label: { fr: 'Bureau', en: 'Office' } },
          { id: 'retail', label: { fr: 'Commerce', en: 'Shop / retail' } },
          { id: 'common', label: { fr: 'Espaces communs (condo, immeuble)', en: 'Common areas (condo, building)' } },
          { id: 'other', label: { fr: 'Autre', en: 'Other' } },
        ],
      },
      {
        id: 'area',
        type: 'single',
        label: { fr: 'Superficie approximative', en: 'Approximate area' },
        options: [
          { id: 'xs', label: { fr: 'Moins de 1 000 pi²', en: 'Under 1,000 sq ft' } },
          { id: 's', label: { fr: '1 000 à 5 000 pi²', en: '1,000 to 5,000 sq ft' } },
          { id: 'm', label: { fr: 'Plus de 5 000 pi²', en: 'Over 5,000 sq ft' } },
          { id: 'unknown', label: { fr: 'Je ne sais pas', en: 'Not sure' } },
        ],
      },
      {
        id: 'frequency',
        type: 'single',
        label: { fr: 'Fréquence souhaitée', en: 'Desired frequency' },
        options: [
          { id: 'once', label: { fr: 'Une fois', en: 'One time' } },
          { id: 'weekly', label: { fr: 'Hebdomadaire', en: 'Weekly' } },
          { id: 'multi', label: { fr: 'Plusieurs fois par semaine', en: 'Several times a week' } },
          { id: 'daily', label: { fr: 'Quotidienne', en: 'Daily' } },
        ],
      },
    ],
  },
  {
    id: 'post-construction-cleaning',
    photo: true,
    clip: true,
    family: 'cleaning',
    formValue: 'nettoyage-post-construction',
    icon: 'hardhat',
    name: { fr: 'Nettoyage post‑construction', en: 'Post‑construction cleaning' },
    short: { fr: 'Post‑construction', en: 'Post‑construction' },
    tagline: { fr: 'Après rénovation ou chantier, prêt à habiter', en: 'After renovation or construction, ready to live in' },
    lead: {
      fr: 'Quand les travaux se terminent, la poussière fine et les résidus restent. L’équipe remet vos lieux propres, prêts à être habités, loués ou ouverts au public. Nettoyage continu pendant les travaux aussi possible.',
      en: 'When the work ends, fine dust and residue remain. The team hands your space back clean and ready to live in, lease or open to the public. Ongoing cleaning during the work is also possible.',
    },
    includes: {
      fr: ['Poussière fine sur surfaces, rebords et plinthes', 'Enlèvement des débris et résidus de chantier', 'Fenêtres et cadres de fenêtres', 'Planchers : balayage, aspiration et lavage', 'Salles de bain et cuisines', 'Nettoyage pendant les travaux : propreté continue et sécuritaire'],
      en: ['Fine dust on surfaces, ledges and baseboards', 'Removal of debris and job-site residue', 'Windows and window frames', 'Floors: sweeping, vacuuming and washing', 'Bathrooms and kitchens', 'During-construction cleaning: continuous, safe tidiness'],
    },
    factors: {
      fr: ['Superficie à nettoyer', 'Ampleur et type de travaux', 'État du chantier et quantité de débris', 'Échéancier de remise des clés ou d’ouverture'],
      en: ['Surface area to clean', 'Scale and type of work', 'Site condition and amount of debris', 'Handover or opening deadline'],
    },
    note: {
      fr: 'Idéalement, écrivez-nous avant la fin des travaux : le nettoyage final sera planifié en fonction de votre date de livraison.',
      en: 'Ideally, contact us before the work ends: the final clean will be planned around your delivery date.',
    },
    faqs: [
      { q: { fr: 'Pendant ou après les travaux?', en: 'During or after the work?' }, a: { fr: 'Les deux. Pendant : chantier propre et sécuritaire. Après : la passe finale qui élimine la poussière fine avant la remise des lieux.', en: 'Both. During: a tidy, safe site. After: the final pass that removes fine dust before handover.' } },
      { q: { fr: 'Après une rénovation résidentielle?', en: 'After a home renovation?' }, a: { fr: 'Oui, appartements, condos et maisons comme locaux commerciaux.', en: 'Yes, apartments, condos and houses as well as commercial spaces.' } },
    ],
    combine: ['window-cleaning', 'interior-painting'],
    questions: [
      {
        id: 'phase',
        type: 'single',
        label: { fr: 'À quel moment?', en: 'At what stage?' },
        options: [
          { id: 'after', label: { fr: 'Après les travaux', en: 'After the work' } },
          { id: 'during', label: { fr: 'Pendant les travaux', en: 'During the work' } },
          { id: 'both', label: { fr: 'Les deux', en: 'Both' } },
        ],
      },
      {
        id: 'space',
        type: 'single',
        label: { fr: 'Type de lieu', en: 'Type of space' },
        options: [
          { id: 'home', label: { fr: 'Résidentiel', en: 'Residential' } },
          { id: 'commercial', label: { fr: 'Commercial', en: 'Commercial' } },
        ],
      },
      {
        id: 'scope',
        type: 'single',
        label: { fr: 'Ampleur des travaux', en: 'Scale of the work' },
        options: [
          { id: 'room', label: { fr: 'Une pièce', en: 'One room' } },
          { id: 'several', label: { fr: 'Plusieurs pièces', en: 'Several rooms' } },
          { id: 'whole', label: { fr: 'Tout le lieu', en: 'Whole space' } },
          { id: 'new', label: { fr: 'Construction neuve', en: 'New construction' } },
        ],
      },
    ],
  },
  {
    id: 'window-cleaning',
    photo: true,
    clip: true,
    family: 'cleaning',
    formValue: 'lavage-vitres',
    icon: 'window',
    name: { fr: 'Lavage de vitres', en: 'Window cleaning' },
    short: { fr: 'Vitres', en: 'Windows' },
    tagline: { fr: 'Fenêtres, vitrines et portes vitrées', en: 'Windows, storefronts and glass doors' },
    lead: {
      fr: 'Des vitres propres changent l’apparence d’un commerce, d’un condo ou d’une maison. À l’unité ou selon une fréquence régulière, l’accès en hauteur est évalué avant la soumission.',
      en: 'Clean glass changes how a shop, condo or home looks. One-off or on a regular schedule; access at height is assessed before the quote.',
    },
    includes: {
      fr: ['Vitres intérieures et extérieures accessibles', 'Cadres et rebords de fenêtres', 'Vitrines et portes vitrées de commerces', 'Vitres après rénovation : résidus et poussière'],
      en: ['Accessible interior and exterior glass', 'Window frames and sills', 'Storefronts and glass doors', 'Glass after renovation: residue and dust'],
    },
    factors: {
      fr: ['Nombre et dimension des vitres', 'Accès : étage, balcon, hauteur', 'Fréquence : ponctuel ou récurrent', 'Résidus de chantier ou de peinture'],
      en: ['Number and size of windows', 'Access: floor level, balcony, height', 'Frequency: one-time or recurring', 'Construction or paint residue'],
    },
    note: { fr: 'L’accès en hauteur est évalué avant la soumission afin de travailler de façon sécuritaire.', en: 'Access at height is assessed before the quote so the work is done safely.' },
    faqs: [
      { q: { fr: 'Lavez-vous l’extérieur?', en: 'Do you clean the outside?' }, a: { fr: 'Oui, lorsque l’accès est sécuritaire. Nous l’évaluons avant de remettre la soumission.', en: 'Yes, when access is safe. We assess it before sending the quote.' } },
    ],
    combine: ['commercial-cleaning', 'post-construction-cleaning', 'residential-cleaning'],
    questions: [
      {
        id: 'sides',
        type: 'single',
        label: { fr: 'Quelles faces?', en: 'Which sides?' },
        options: [
          { id: 'in', label: { fr: 'Intérieur', en: 'Inside' } },
          { id: 'out', label: { fr: 'Extérieur', en: 'Outside' } },
          { id: 'both', label: { fr: 'Les deux', en: 'Both' } },
        ],
      },
      {
        id: 'count',
        type: 'single',
        label: { fr: 'Nombre de vitres (environ)', en: 'Number of windows (approx.)' },
        options: [
          { id: '1-10', label: { fr: '1 à 10', en: '1 to 10' } },
          { id: '11-25', label: { fr: '11 à 25', en: '11 to 25' } },
          { id: '25+', label: { fr: 'Plus de 25', en: 'More than 25' } },
          { id: 'storefront', label: { fr: 'Vitrine commerciale', en: 'Storefront' } },
        ],
      },
      {
        id: 'access',
        type: 'single',
        label: { fr: 'Accès', en: 'Access' },
        options: [
          { id: 'ground', label: { fr: 'Rez-de-chaussée', en: 'Ground floor' } },
          { id: 'balcony', label: { fr: 'Étage avec balcon', en: 'Upper floor with balcony' } },
          { id: 'height', label: { fr: 'En hauteur, sans balcon', en: 'At height, no balcony' } },
        ],
      },
    ],
  },
  {
    id: 'moving',
    photo: true,
    clip: true,
    family: 'moving',
    formValue: 'demenagement',
    image: 'moving',
    icon: 'truck',
    name: { fr: 'Déménagement', en: 'Moving' },
    short: { fr: 'Déménagement', en: 'Moving' },
    tagline: { fr: 'Résidentiel et commercial, local et régional', en: 'Residential and commercial, local and regional' },
    lead: {
      fr: 'Appartements, condos, maisons et bureaux, avec une équipe professionnelle et le bon équipement. Vos biens sont traités comme s’ils étaient les nôtres, 7 jours sur 7, jours fériés inclus.',
      en: 'Apartments, condos, houses and offices, with a professional crew and the right equipment. Your belongings are treated as if they were ours, 7 days a week, holidays included.',
    },
    includes: {
      fr: ['Déménagement résidentiel complet', 'Déménagement commercial et de bureaux', 'Équipement professionnel : couvertures, sangles, diable', 'Service local et régional', 'Équipe ponctuelle et respectueuse', '7 jours sur 7, jours fériés inclus'],
      en: ['Complete residential moving', 'Commercial and office moving', 'Professional equipment: blankets, straps, hand truck', 'Local and regional service', 'Punctual, respectful crew', '7 days a week, holidays included'],
    },
    factors: {
      fr: ['Volume : nombre de pièces et de meubles', 'Étages, ascenseurs ou escaliers aux deux adresses', 'Distance entre le départ et l’arrivée', 'Objets lourds ou fragiles', 'Date : fin juin et début juillet sont très demandés'],
      en: ['Volume: number of rooms and furniture', 'Floors, elevators or stairs at both addresses', 'Distance between origin and destination', 'Heavy or fragile items', 'Date: late June and early July are in very high demand'],
    },
    faqs: [
      { q: { fr: 'Combien de temps à l’avance réserver?', en: 'How far ahead should I book?' }, a: { fr: 'Le plus tôt possible, surtout autour du 1er juillet et en fin de mois.', en: 'As early as possible, especially around July 1 and at month end.' } },
      { q: { fr: 'Le dimanche et les jours fériés?', en: 'Sundays and holidays?' }, a: { fr: 'Oui, 7 jours sur 7, jours fériés inclus.', en: 'Yes, 7 days a week, holidays included.' } },
      { q: { fr: 'Les déménagements d’entreprises?', en: 'Business moves?' }, a: { fr: 'Oui : bureaux, commerces et équipement, avec une planification qui limite l’arrêt d’activité.', en: 'Yes: offices, shops and equipment, planned to limit downtime.' } },
    ],
    combine: ['residential-cleaning', 'transport-delivery', 'interior-painting'],
    questions: [
      {
        id: 'from',
        type: 'single',
        label: { fr: 'Vous déménagez…', en: 'You are moving…' },
        options: [
          { id: 'apartment', label: { fr: 'Un appartement', en: 'An apartment' } },
          { id: 'condo', label: { fr: 'Un condo', en: 'A condo' } },
          { id: 'house', label: { fr: 'Une maison', en: 'A house' } },
          { id: 'office', label: { fr: 'Un bureau / commerce', en: 'An office / shop' } },
        ],
      },
      homeSize,
      {
        id: 'stairs',
        type: 'single',
        label: { fr: 'Étages et accès', en: 'Floors and access' },
        cols: 1,
        options: [
          { id: 'ground', label: { fr: 'Rez-de-chaussée aux deux adresses', en: 'Ground floor at both addresses' } },
          { id: 'elevator', label: { fr: 'Étage avec ascenseur', en: 'Upper floor with elevator' } },
          { id: 'stairs', label: { fr: 'Étage par escaliers', en: 'Upper floor by stairs' } },
          { id: 'mixed', label: { fr: 'Ça dépend de l’adresse', en: 'Depends on the address' } },
        ],
      },
      {
        id: 'to',
        type: 'text',
        label: { fr: 'Ville d’arrivée', en: 'Destination city' },
        placeholder: { fr: 'Ex. : Laval', en: 'E.g. Laval' },
      },
      {
        id: 'heavy',
        type: 'multi',
        label: { fr: 'Objets particuliers', en: 'Special items' },
        options: [
          { id: 'piano', label: { fr: 'Piano', en: 'Piano' } },
          { id: 'appliances', label: { fr: 'Gros électros', en: 'Large appliances' } },
          { id: 'fragile', label: { fr: 'Objets fragiles', en: 'Fragile items' } },
          { id: 'none', label: { fr: 'Rien de particulier', en: 'Nothing special' } },
        ],
      },
    ],
  },
  {
    id: 'transport-delivery',
    photo: true,
    clip: true,
    family: 'moving',
    formValue: 'transport',
    image: 'transport',
    icon: 'box',
    name: { fr: 'Transport & livraison', en: 'Transport & delivery' },
    short: { fr: 'Transport', en: 'Transport' },
    tagline: { fr: 'Meubles, électros, matériaux et marchandises', en: 'Furniture, appliances, materials and goods' },
    lead: {
      fr: 'Un meuble acheté en ligne, des matériaux pour un chantier ou une livraison pour votre commerce : vos marchandises arrivent à bon port, à l’heure, localement et en région.',
      en: 'Furniture bought online, materials for a job site or a delivery for your shop: your goods arrive safely and on time, locally and across the region.',
    },
    includes: {
      fr: ['Marchandises et matériaux', 'Meubles et électroménagers', 'Soutien logistique pour les entreprises', 'Ramassage et livraison locale et régionale', 'Service rapide et ponctuel'],
      en: ['Goods and materials', 'Furniture and appliances', 'Logistics support for businesses', 'Local and regional pick-up and delivery', 'Fast, punctual service'],
    },
    factors: {
      fr: ['Taille, poids et nombre d’articles', 'Adresses de ramassage et de livraison', 'Étages ou accès à la livraison', 'Urgence et plage horaire souhaitée'],
      en: ['Size, weight and number of items', 'Pick-up and delivery addresses', 'Floors or delivery access', 'Urgency and preferred time window'],
    },
    faqs: [
      { q: { fr: 'Pouvez-vous livrer rapidement?', en: 'Can you deliver quickly?' }, a: { fr: 'Selon la disponibilité. Appelez-nous avec les détails et nous confirmons ce qui est possible.', en: 'Subject to availability. Call us with the details and we will confirm what is possible.' } },
    ],
    combine: ['moving'],
    questions: [
      {
        id: 'what',
        type: 'multi',
        label: { fr: 'Que faut-il transporter?', en: 'What needs transporting?' },
        options: [
          { id: 'furniture', label: { fr: 'Meubles', en: 'Furniture' } },
          { id: 'appliances', label: { fr: 'Électroménagers', en: 'Appliances' } },
          { id: 'materials', label: { fr: 'Matériaux', en: 'Materials' } },
          { id: 'goods', label: { fr: 'Marchandises', en: 'Goods' } },
        ],
      },
      {
        id: 'count',
        type: 'single',
        label: { fr: 'Nombre d’articles', en: 'Number of items' },
        options: [
          { id: '1', label: { fr: '1 article', en: '1 item' } },
          { id: '2-5', label: { fr: '2 à 5', en: '2 to 5' } },
          { id: '6+', label: { fr: '6 et plus', en: '6 or more' } },
          { id: 'recurring', label: { fr: 'Livraisons régulières', en: 'Regular deliveries' } },
        ],
      },
      { id: 'pickup', type: 'text', label: { fr: 'Ramassage à', en: 'Pick-up at' }, placeholder: { fr: 'Ville ou adresse', en: 'City or address' } },
      { id: 'dropoff', type: 'text', label: { fr: 'Livraison à', en: 'Deliver to' }, placeholder: { fr: 'Ville ou adresse', en: 'City or address' } },
    ],
  },
  {
    id: 'interior-painting',
    photo: true,
    clip: true,
    family: 'painting',
    formValue: 'peinture',
    image: 'painting',
    icon: 'roller',
    name: { fr: 'Peinture intérieure', en: 'Interior painting' },
    short: { fr: 'Peinture', en: 'Painting' },
    tagline: { fr: 'Murs, plafonds, boiseries et sous-sols', en: 'Walls, ceilings, trim and basements' },
    lead: {
      fr: 'De la préparation des surfaces à la protection des lieux, un résultat net. Vous choisissez vos couleurs à partir du nuancier fourni; l’équipe s’occupe du reste, deux couches comprises.',
      en: 'From surface preparation to protecting the space, a clean result. You choose your colours from the swatch book provided; the team handles the rest, two coats included.',
    },
    includes: {
      fr: ['Préparation : ponçage, remplissage des fissures, apprêt', 'Murs : 2 couches de latex premium', 'Plafonds : 2 couches, blanc', 'Boiseries, cadres de portes et plinthes', 'Murs de blocs de sous-sol : scellant et peinture à maçonnerie', 'Protection des lieux et nettoyage après les travaux', 'Couleurs choisies par vous, nuancier fourni'],
      en: ['Preparation: sanding, filling cracks, primer', 'Walls: 2 coats of premium latex', 'Ceilings: 2 coats, white', 'Trim, door frames and baseboards', 'Basement block walls: sealer and masonry paint', 'Protection of the space and clean-up afterwards', 'Colours chosen by you, swatch book provided'],
    },
    factors: {
      fr: ['Superficie des murs et des plafonds', 'État des surfaces : fissures, trous, anciennes peintures', 'Nombre de pièces et présence de boiseries', 'Type de surface : plâtre, gypse, blocs'],
      en: ['Wall and ceiling surface area', 'Condition of surfaces: cracks, holes, old paint', 'Number of rooms and amount of trim', 'Type of surface: plaster, drywall, block'],
    },
    faqs: [
      { q: { fr: 'Qui choisit les couleurs?', en: 'Who chooses the colours?' }, a: { fr: 'Vous. Un nuancier est fourni pour vous aider.', en: 'You do. A swatch book is provided to help.' } },
      { q: { fr: 'Combien de couches?', en: 'How many coats?' }, a: { fr: 'Deux couches de latex premium sur les murs, deux couches de blanc au plafond, après préparation.', en: 'Two coats of premium latex on walls, two coats of white on ceilings, after preparation.' } },
      { q: { fr: 'Les sous-sols?', en: 'Basements?' }, a: { fr: 'Oui, y compris les murs de blocs, avec scellant pénétrant et peinture à maçonnerie.', en: 'Yes, including block walls, with penetrating sealer and masonry paint.' } },
    ],
    combine: ['residential-cleaning', 'post-construction-cleaning'],
    questions: [
      {
        id: 'rooms',
        type: 'single',
        label: { fr: 'Combien de pièces?', en: 'How many rooms?' },
        options: [
          { id: '1', label: { fr: '1 pièce', en: '1 room' } },
          { id: '2-3', label: { fr: '2 à 3', en: '2 to 3' } },
          { id: '4+', label: { fr: '4 et plus', en: '4 or more' } },
          { id: 'all', label: { fr: 'Tout le logement', en: 'Whole home' } },
        ],
      },
      {
        id: 'surfaces',
        type: 'multi',
        label: { fr: 'Surfaces à peindre', en: 'Surfaces to paint' },
        options: [
          { id: 'walls', label: { fr: 'Murs', en: 'Walls' } },
          { id: 'ceilings', label: { fr: 'Plafonds', en: 'Ceilings' } },
          { id: 'trim', label: { fr: 'Boiseries, plinthes', en: 'Trim, baseboards' } },
          { id: 'basement', label: { fr: 'Sous-sol (blocs)', en: 'Basement (block)' } },
        ],
      },
      {
        id: 'condition',
        type: 'single',
        label: { fr: 'État des surfaces', en: 'Condition of surfaces' },
        options: [
          { id: 'good', label: { fr: 'Bon état', en: 'Good condition' } },
          { id: 'minor', label: { fr: 'Quelques retouches', en: 'Minor repairs' } },
          { id: 'damaged', label: { fr: 'Fissures ou trous', en: 'Cracks or holes' } },
        ],
      },
    ],
  },
];

export const byId = (id: ServiceId): Service => SERVICES.find((s) => s.id === id)!;

export const FAMILIES: Family[] = ['cleaning', 'moving', 'painting'];

export interface Situation {
  id: string;
  icon: 'truck' | 'key' | 'hardhat' | 'building' | 'roller';
  label: Record<Lang, string>;
  services: ServiceId[];
  /** pre-filled answers so the customer does not re-select the obvious */
  presets?: Record<string, string>;
}

export const SITUATIONS: Situation[] = [
  { id: 'moving', icon: 'truck', label: { fr: 'Je déménage', en: 'I am moving' }, services: ['moving', 'residential-cleaning'], presets: { 'residential-cleaning.kind': 'end-lease' } },
  { id: 'lease', icon: 'key', label: { fr: 'Fin de bail', en: 'End of lease' }, services: ['residential-cleaning'], presets: { 'residential-cleaning.kind': 'end-lease' } },
  { id: 'reno', icon: 'hardhat', label: { fr: 'Après des travaux', en: 'After renovations' }, services: ['post-construction-cleaning', 'window-cleaning'] },
  { id: 'business', icon: 'building', label: { fr: 'Mon commerce ou immeuble', en: 'My business or building' }, services: ['commercial-cleaning'] },
  { id: 'refresh', icon: 'roller', label: { fr: 'Rafraîchir mes murs', en: 'Refresh my walls' }, services: ['interior-painting'] },
];
