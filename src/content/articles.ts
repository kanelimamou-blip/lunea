// Original educational content. Always reviewed against current medical
// guidance before publication; never a substitute for a consultation.

export interface Article {
  id: string;
  category: 'Cycle' | 'Fertilité' | 'Grossesse' | 'Bien-être' | 'Santé';
  title: string;
  minutes: number;
  body: string[];
}

export const ARTICLES: Article[] = [
  {
    id: 'phases',
    category: 'Cycle',
    title: 'Les 4 phases du cycle, simplement',
    minutes: 4,
    body: [
      "Un cycle commence le premier jour des règles et se termine la veille des suivantes. Il dure en moyenne 28 jours, mais tout cycle entre 21 et 35 jours est considéré comme normal chez l'adulte.",
      "Règles (jours 1 à 5 environ) : la muqueuse utérine s'élimine. Les hormones sont au plus bas, la fatigue est fréquente.",
      "Phase folliculaire : un follicule mûrit dans l'ovaire sous l'effet de la FSH et les œstrogènes augmentent. Beaucoup se sentent plus énergiques.",
      "Ovulation : un pic de LH libère l'ovule, qui vit 12 à 24 heures. Les spermatozoïdes pouvant survivre jusqu'à 5 jours, la fenêtre fertile couvre environ 6 jours.",
      "Phase lutéale : la progestérone prépare l'utérus. Sa durée est assez stable d'un cycle à l'autre (10 à 16 jours). Sans fécondation, les hormones chutent et les règles arrivent.",
    ],
  },
  {
    id: 'fertile-window',
    category: 'Fertilité',
    title: 'Repérer sa fenêtre de fertilité',
    minutes: 5,
    body: [
      "Le calendrier seul donne une estimation. Pour plus de précision, combinez plusieurs signes : c'est le principe de la méthode symptothermique.",
      "La glaire cervicale devient claire, glissante et élastique (comme du blanc d'œuf) dans les jours qui précèdent l'ovulation.",
      "Les tests d'ovulation détectent le pic de LH, qui précède l'ovulation de 24 à 36 heures. Notez-les dans Lunéa : l'application s'en sert pour confirmer l'ovulation.",
      "La température basale monte de 0,2 à 0,5 °C après l'ovulation et reste haute jusqu'aux règles. Prenez-la au réveil, avant de vous lever, à heure fixe.",
      "Important : aucune application ne constitue à elle seule une méthode de contraception fiable.",
    ],
  },
  {
    id: 'pms',
    category: 'Bien-être',
    title: 'Syndrome prémenstruel : ce qui aide vraiment',
    minutes: 4,
    body: [
      "Le SPM regroupe des symptômes physiques et émotionnels qui apparaissent pendant la phase lutéale et disparaissent avec les règles.",
      "L'activité physique régulière, un sommeil suffisant et la réduction de la caféine, de l'alcool et du sel améliorent souvent les symptômes.",
      "Noter vos symptômes plusieurs cycles de suite permet de vérifier qu'ils suivent bien le cycle. C'est aussi une information précieuse pour un médecin.",
      "Si l'humeur devient très sombre ou que la vie quotidienne est perturbée, parlez-en à un professionnel : un trouble dysphorique prémenstruel (TDPM) se soigne.",
    ],
  },
  {
    id: 'irregular',
    category: 'Santé',
    title: 'Cycles irréguliers : quand consulter ?',
    minutes: 4,
    body: [
      "Une variation de quelques jours d'un cycle à l'autre est normale. Le stress, le voyage, une maladie ou un changement de poids peuvent décaler l'ovulation.",
      "Consultez si vos cycles font régulièrement moins de 21 jours ou plus de 35 jours, si les règles durent plus de 7 jours, si vous n'avez pas de règles pendant 3 mois, ou en cas de douleurs intenses.",
      "Le syndrome des ovaires polykystiques (SOPK), les troubles de la thyroïde ou l'endométriose font partie des causes à explorer. Le rapport de Lunéa peut servir de base à la consultation.",
    ],
  },
  {
    id: 'endometriosis',
    category: 'Santé',
    title: "Endométriose : les signes à connaître",
    minutes: 5,
    body: [
      "L'endométriose touche environ une femme sur dix. Le diagnostic prend souvent plusieurs années car les douleurs de règles sont banalisées.",
      "Signes d'alerte : règles très douloureuses qui résistent aux antalgiques courants, douleurs pendant les rapports, douleurs en allant à la selle ou en urinant pendant les règles, difficultés à concevoir.",
      "Noter l'intensité de vos douleurs dans le journal permet de montrer leur évolution au médecin.",
    ],
  },
  {
    id: 'first-trimester',
    category: 'Grossesse',
    title: 'Premier trimestre : les essentiels',
    minutes: 5,
    body: [
      "L'acide folique est recommandé dès le projet de grossesse et jusqu'à la fin du premier trimestre.",
      "Évitez l'alcool, le tabac et certains aliments (fromages au lait cru, viande et poisson crus ou peu cuits) et lavez bien les fruits et légumes.",
      "Nausées et fatigue sont fréquentes. Fractionnez les repas et reposez-vous dès que possible.",
      "Consultez sans attendre en cas de saignements abondants, de douleurs fortes ou de fièvre.",
    ],
  },
  {
    id: 'sleep',
    category: 'Bien-être',
    title: 'Sommeil et cycle',
    minutes: 3,
    body: [
      "La hausse de température de la phase lutéale peut rendre le sommeil plus léger en fin de cycle.",
      "Une chambre fraîche, des horaires réguliers et moins d'écrans le soir aident particulièrement les jours précédant les règles.",
      "Notez vos heures de sommeil dans Lunéa pour voir si elles varient selon vos phases.",
    ],
  },
];
