# Déploiement — GitHub Pages

L'application est servie depuis la branche `gh-pages` du dépôt `ibarry23/groupe548-app` à l'adresse
https://ibarry23.github.io/groupe548-app/ (`base: './'` dans `vite.config.ts`, routeur par `#`, donc aucun réglage de sous-dossier n'est nécessaire).

## Redéployer

```bash
npm run build
```

Puis, depuis le dossier du projet (Git Bash) :

```bash
touch dist/.nojekyll && rm -rf /tmp/g548-pages && mkdir -p /tmp/g548-pages && cp -r dist/. /tmp/g548-pages/ && cd /tmp/g548-pages && git init -q && git checkout -q -b gh-pages && git add -A && git commit -q -m "Deploy Groupe 548 app" && git remote add origin https://github.com/ibarry23/groupe548-app.git && git push -f -q origin gh-pages && cd -
```

GitHub Pages reconstruit en 1 à 2 minutes. Les visiteurs qui ont déjà installé la PWA reçoivent la nouvelle version au prochain lancement en ligne (le service worker recharge l'index à chaque navigation).

## Mode d'envoi en production

`.env` n'est pas versionné. Le build publié a été produit avec `VITE_SUBMIT_MODE=web3forms` et la clé du site : les demandes envoyées depuis l'app en ligne sont **réelles**. Pour publier une version de démonstration, construire sans `.env`.

## Domaine personnalisé

1. Dépôt GitHub → Settings → Pages → Custom domain → `app.groupe548.ca` → Save.
2. Chez le registraire du domaine, ajouter un CNAME `app` → `ibarry23.github.io`.
3. Cocher « Enforce HTTPS » une fois le certificat émis (quelques minutes).
