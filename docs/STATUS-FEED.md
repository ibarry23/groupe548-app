# Suivi en direct — « L’équipe est en route »

L’app peut montrer au client où en est son service : **planifié → équipe en route → arrivée → en cours → terminé**, avec une heure d’arrivée prévue et un mot de l’équipe. L’app n’a pas de serveur : elle lit un petit tableau que l’équipe tient à jour. Une feuille Google Sheets suffit.

## 1. Créer la feuille (5 minutes, une seule fois)

1. Créez une feuille Google Sheets nommée par exemple **Suivi 548**.
2. Première ligne (en-têtes), exactement ces quatre colonnes :

   | reference | stage | eta | note |
   |-----------|-------|-----|------|

   Un modèle est fourni : [status-feed-template.csv](status-feed-template.csv).
3. **Fichier → Partager → Publier sur le web** → onglet *Lien* → choisissez la feuille, format **Valeurs séparées par des virgules (.csv)** → **Publier**. Copiez l’adresse (elle se termine par `output=csv`).

> Ne mettez **jamais** de nom, d’adresse ni de téléphone dans cette feuille : elle est lisible par quiconque a le lien. La référence (ex. `G548-7KQ2`) ne révèle rien.

## Feuille actuelle

La feuille **Suivi 548** existe déjà dans le compte Google de Groupe 548 et est branchée sur l’app :
https://docs.google.com/spreadsheets/d/17NRnJ-qT7yRmPFNqvFffu_9rLr5BdWLWHKyl8Sa91FE/edit — le répartiteur n’a qu’à y écrire. Google republie le CSV automatiquement ; comptez jusqu’à quelques minutes avant que l’app voie un changement.

## 2. Activer dans l’app (une seule fois)

Dans `.env` :

```
VITE_STATUS_FEED_URL=https://docs.google.com/spreadsheets/d/e/…/pub?gid=0&single=true&output=csv
```

Puis reconstruire et publier (voir [DEPLOY.md](DEPLOY.md)) :

```bash
npm run build
```

```bash
bash scripts/deploy-pages.sh
```

## 3. Au quotidien (le répartiteur)

Une ligne par demande, mise à jour au fil de la journée :

| reference | stage | eta | note |
|-----------|-------|-----|------|
| G548-7KQ2 | planifié | | |
| G548-7KQ2 | en route | vers 14 h 30 | Équipe de 2 · camion 16 pi |
| G548-7KQ2 | arrivée | | |
| G548-7KQ2 | en cours | | |
| G548-7KQ2 | terminé | | |

- **stage** accepte les mots courants, en français ou en anglais, avec ou sans accents : `reçu`, `soumission`, `planifié`, `en route`, `arrivée` / `sur place`, `en cours`, `terminé`.
- **eta** est libre : `vers 14 h 30`, `15 min`, `entre 13 h et 14 h`.
- **note** : un mot court pour le client (équipe, camion, consigne). Optionnel.
- Dès qu’une ligne passe à `en route`, le client qui a l’app ouverte reçoit un message dans l’app (et une notification système s’il l’a acceptée) ; la carte *Suivi en direct* montre le camion en mouvement et l’heure d’arrivée. L’app relit la feuille toutes les 45 s tant que la demande est ouverte, et à chaque retour au premier plan.
- Une fois `terminé`, la ligne peut rester ; l’app cesse d’interroger la feuille pour cette demande.

## Aperçu sans feuille

Pour voir la carte avant d’activer la feuille, ouvrez une demande et ajoutez `?preview=en-route` à l’adresse, par exemple
`https://ibarry23.github.io/groupe548-app/#/requests/G548-4J32?preview=en-route` (aussi `scheduled`, `arrived`, `in-progress`, `done`). Les données affichées sont alors des exemples, marquées *Aperçu*.

## Alternative JSON

À la place du CSV, l’adresse peut pointer vers un fichier JSON : `[{"reference":"G548-7KQ2","stage":"en route","eta":"vers 14 h 30","note":"…"}]`. Même vocabulaire.
