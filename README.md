# Lunéa : suivi du cycle, tout inclus

Application mobile (iOS et Android) de suivi du cycle menstruel, de la fertilité et de la grossesse. Toutes les fonctionnalités sont incluses, sans abonnement, et les données restent chiffrées sur le téléphone.

## Fonctionnalités

| Domaine | Ce que fait Lunéa |
|---|---|
| Prédictions | Prochaines règles, ovulation et fenêtre de fertilité, avec une marge (±j) et un niveau de fiabilité. Moyenne pondérée des 6 derniers cycles, cycles aberrants exclus |
| Ovulation confirmée | Tests LH positifs et température basale (règle symptothermique « 3 au-dessus de 6 »). Lunéa apprend la durée réelle de la phase lutéale |
| Cycles irréguliers | Détection automatique et marge élargie |
| Journal | Flux, 18 symptômes, 12 humeurs, pertes, rapports sexuels, tests LH et de grossesse, pilule, température, poids, sommeil, eau, notes |
| Accueil | Anneau du cycle, bandeau de la semaine, phase du jour et conseils, chance de conception, retard de règles |
| Calendrier | Règles passées et prévues, fertilité, ovulation, jours notés, modification rapide |
| Analyses | Durée des cycles (graphique), courbe de température, symptômes par phase, historique, alertes santé (cycles < 21 j ou > 35 j, règles > 7 j, flux abondant, retard) |
| Objectifs | Suivre, concevoir, connaître sa fertilité, grossesse |
| Grossesse | SA + jours, trimestre, terme, taille du bébé, conseil de la semaine, date ajustable |
| Rappels | Règles, fenêtre fertile, ovulation, journal quotidien, pilule. Mode discret pour l'écran verrouillé |
| Rapport médical | PDF sur 3, 6 ou 12 mois à partager avec un médecin |
| Santé | Bibliothèque d'articles originaux par catégorie |
| Confidentialité | Aucun compte ni serveur. Chiffrement XSalsa20-Poly1305 avec une clé dans le Keychain ou le Keystore, exclue des sauvegardes. Verrou Face ID ou empreinte, export JSON, effacement total |

## Lancer le projet

```bash
npm install
npx expo start        # puis scanner le QR code avec un build de développement
npm test              # tests du moteur de prédiction et du chiffrement
npm run typecheck
```

Les modules natifs (SecureStore, notifications, biométrie) demandent un build de développement plutôt qu'Expo Go :

```bash
npx eas-cli@latest build --profile development --platform ios   # ou android
```

## Publier sur les stores

1. Créer un compte Apple Developer (99 $/an) et un compte Google Play Console (25 $ une fois).
2. `npx eas-cli@latest build --platform all --profile production`
3. `npx eas-cli@latest submit --platform all`

Avant de publier, vérifiez que le nom « Lunéa » est disponible (INPI, App Store, Play Store) et faites relire les articles santé par un professionnel.

## Architecture

```
src/
  domain/      logique pure et testée : dates, cycle (prédiction), grossesse, analyses, catalogue
  storage/     crypto.ts (chiffrement), vault.ts (fichier + clé sécurisée), store.tsx (état React)
  services/    rappels (notifications locales), rapport PDF et export
  components/  anneau du cycle, calendrier, icônes, éléments d'interface
  content/     articles santé
  app/         écrans (Expo Router)
```

Stack : Expo SDK 58, React Native 0.88, TypeScript, Expo Router, react-native-svg, tweetnacl, Vitest.

Lunéa ne remplace pas un avis médical et n'est pas une méthode de contraception.
