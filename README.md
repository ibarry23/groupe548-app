# Groupe 548 — application mobile

Application mobile bilingue (FR-CA / EN) pour Groupe 548 : découverte des services, demande de soumission guidée, suivi des demandes sur l'appareil, contact direct.

**Format de livraison :** application hybride multiplateforme — interface web (React + TypeScript + Vite) empaquetée dans des coques natives iOS et Android avec **Capacitor**, et installable directement comme **PWA** (manifest + service worker). Ce n'est pas une application native Swift/Kotlin : voir `DELIVERY.md` pour le raisonnement.

## Démarrer

```bash
npm install
npm run dev
```

Ouvrir http://localhost:5173 (idéalement en mode « appareil mobile » des outils de développement, ou sur un téléphone du même réseau : `--host` est activé).

```bash
npm run build      # vérifie les types puis produit dist/
npm run preview    # sert dist/ (PWA installable, service worker actif)
```

## Mode d'envoi des demandes

Sans fichier `.env`, l'app est en **mode démonstration** : la demande est enregistrée sur l'appareil, affichée comme « Simulée (démo) » et **rien n'est transmis** à l'équipe.

Le dépôt contient actuellement un `.env` qui active **l'envoi réel** (vérifié le 2026-11-03 avec une demande test, référence G548-4J32). Pour revenir en démo, supprimer `.env` ou mettre `VITE_SUBMIT_MODE=mock`. Contenu du `.env` (voir aussi `.env.example`) :

```
VITE_SUBMIT_MODE=web3forms
VITE_WEB3FORMS_KEY=<clé Web3Forms>
```

Le site web actuel utilise déjà Web3Forms (sa clé publique est dans `.env.example`). L'app envoie les mêmes champs que le formulaire du site (`name`, `phone`, `email`, `city`, `service`, `description`, `date`, `language`) plus `reference` et `source=app`, donc les demandes arrivent dans la même boîte courriel, avec une référence lisible (ex. `G548-7K3Q`).

## Coques natives (iOS / Android)

Les projets natifs ne sont pas générés dans ce dépôt (Xcode / Android Studio requis) :

```bash
npm run build
npm run cap:add:ios        # macOS + Xcode
npm run cap:add:android    # Android Studio + SDK
npm run cap:sync
npm run cap:open:ios       # ou cap:open:android
```

`capacitor.config.ts` contient l'identifiant `ca.groupe548.app`, le nom et la couleur de fond. Les icônes (`public/icon.svg`) servent de base ; générer les jeux d'icônes et écrans de lancement avec `@capacitor/assets` avant publication.

## Structure

```
src/
  app/App.tsx          routeur (HashRouter), barre d'onglets, barre hors ligne, toasts
  data/services.ts     7 services (FR/EN), questions du formulaire par service, situations
  i18n/index.ts        toutes les chaînes FR/EN, téléphones, villes
  lib/store.tsx        état global : langue, brouillon, demandes, connectivité (localStorage)
  lib/submit.ts        envoi (mock | web3forms), corps du courriel, modèle de demande
  lib/format.ts        téléphone, dates, référence, réduction des photos, haptique
  components/          icônes SVG, boutons, champs, options, accordéon, feuille, toasts
  screens/             Home, Services, ServiceDetail, Quote (5 étapes), Confirmation,
                       Requests (+ détail), More (+ Contact, FAQ, À propos)
  styles/app.css       jetons de design et composants
public/
  video/               clips Kling 3.0 (héros d'accueil, 7 services, 5 ambiances), boucles 5 s H.264
  img/photos/          affiches (première image) de chaque clip + photos fixes de secours
  img/thumbs/          vignettes 192 px pour les listes (extraites des affiches)
  img/                 illustrations du site Groupe 548 (secours), icônes
  manifest.webmanifest, sw.js

Médias : `src/data/clips.ts` active ou désactive chaque clip d'ambiance; `clip: false` sur un service
dans `src/data/services.ts` revient à la photo fixe. Tous les visuels de personnes sont générés par IA
(Higgsfield) — ce ne sont pas des photos de l'équipe; remplacer par de vraies photos quand elles existent.
```

## Comportements notables

- Brouillon de demande conservé sur l'appareil (reprise possible depuis l'accueil et l'onglet Demandes).
- Hors ligne : la demande est mise « En attente d'envoi » et repart automatiquement au retour de la connexion.
- Protection contre les envois en double (verrou pendant l'envoi, brouillon vidé après succès).
- Validation expliquée (nom, téléphone à 10 chiffres, courriel), focus et défilement vers l'erreur.
- Zones sûres iOS (`env(safe-area-inset-*)`), `prefers-reduced-motion`, tailles en `rem`, étiquettes ARIA.
