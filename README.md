# Code secret · Mastermind

Jeu solo réalisé pour le cours avec l’aide de Codex. Retrouvez quatre couleurs cachées en dix essais. Version **0.1.0**, préparée pour le jalon 1 du **20 novembre 2026 au soir**.

- [Dépôt GitHub](https://github.com/leelee-heg/code-secret)
- Application GitHub Pages : publication et adresse encore à vérifier.
- Version de rendu : tag `jalon-1` conservé localement ; transfert de l’historique et du tag, puis remise Cyberlearn à effectuer.

## Jouer et comprendre les règles

Ouvrir `index.html` dans un navigateur récent : aucune installation pour jouer. Choisir quatre couleurs de gauche à droite, puis « Valider l’essai ». Consulter les indices et l’historique ; « Nouvelle partie » recommence le jeu.

L’[énoncé du projet, édition 2.2 du 3 novembre 2026](https://docs.google.com/document/d/17RUqUnEvIilitiNSY1kbK0QT7vBVcUeAT3L6ONJN8XU/edit) fait foi : référence **code-couleurs-1.0**.

- Palette ordonnée : `rouge`, `bleu`, `vert`, `jaune`, `orange`, `violet`. Le programme tire quatre couleurs avec répétitions possibles ; le code reste fixe et caché pendant la partie.
- Dix essais. Les quatre couleurs de la proposition sont modifiables avant validation. Une proposition valide consomme un essai ; une proposition incomplète ou non autorisée est expliquée et refusée sans changer le compteur ni l’historique.
- Compter d’abord les bien placées, puis les mal placées parmi les occurrences restantes. Une occurrence compte au maximum une fois ; les indices ne désignent aucune position. Les propositions et indices restent visibles.
- Quatre bien placées donnent la victoire, même au dixième essai. Sinon, dix essais donnent la défaite. La solution est alors révélée ; aucune proposition ne change la partie terminée.
- « Nouvelle partie » tire un code et efface essais, historique et indices. Le hasard peut produire à nouveau le même code.

Exemple : secret rouge–rouge–bleu–vert, proposition rouge–bleu–rouge–rouge → **1 bien placée, 2 mal placées**. Les noms et les symboles **R, B, V, J, O, Vi** permettent de distinguer les couleurs.

## Organisation et décision prise avec Codex

Nous conservons une application statique en HTML, CSS et JavaScript, sans framework ni compilation : cela suffit au jeu et à GitHub Pages. Le moteur est séparé de l’affichage pour tester ses règles avec un secret connu, sans modifier le hasard du jeu visible. Cette décision proposée avec Codex est à relire et à expliquer personnellement lors de la reprise.

| Fichier | Rôle |
| --- | --- |
| `index.html`, `style.css` | Structure, version et adaptation aux petits écrans |
| `engine.js` | Secret, validation, indices et fin de partie |
| `game.js` | Sélecteurs, historique, messages et redémarrage |
| `tests.cjs` | Vérifications reproductibles du moteur |
| `AGENTS.md` | Consignes durables pour Codex |
| `docs/preuves/` | Captures de la correction avant/après |

API interne : `CodeCouleurs.createGame(generateurCouleur?)` crée une partie, `etat()` en retourne une copie, `proposer([...])` retourne `{ ok, erreur?, partie }`, `nouvellePartie()` réinitialise. États : `en_cours`, `gagnee`, `perdue`. Le générateur injectable sert aux tests. Cette API interne n’est pas le contrat commun 0.2.

## Vérifier

Depuis la racine, avec **Node.js 24** (testé avec 24.22.1) :

```sh
node tests.cjs
```

Attendu et obtenu le **12 novembre 2026**, sur la base `a7b1e6c`, puis après correction `ded079f` : « Tous les tests passent, dont 6 561 paires de combinaisons. » Node n’étant pas dans le PATH de cette session, l’exécution a utilisé le runtime Node fourni par Codex ; aucun paquet supplémentaire installé.

| Contrôle automatisé | Attendu | Obtenu |
| --- | --- | --- |
| Secret R R B V, proposition R B R R | 1 bien placée, 2 mal placées | Conforme |
| Proposition courte, vide, trouée, nulle ou couleur inconnue | Refus, état inchangé | Conforme |
| 6 561 paires sur trois couleurs | Score égal à un second calcul indépendant | Conforme |
| Modification d’une copie de l’historique | Partie originale inchangée | Conforme |
| Victoire au dixième essai | Victoire prioritaire sur défaite | Conforme |
| Dix erreurs, puis proposition après la fin | Défaite, puis état inchangé | Conforme |
| Redémarrage | 0 essai, historique vide, secret caché | Conforme |

Essais d’interface dans le navigateur intégré à Codex le 12 novembre, version 0.1.0 servie localement avec `python3 -m http.server 8000 --bind 127.0.0.1` :

| Action à reproduire | Attendu | Obtenu |
| --- | --- | --- |
| Valider sans couleur, puis avec trois couleurs | Message de refus ; compteur 0/10 | Conforme |
| Compléter quatre couleurs et valider | Une ligne, compteur 1/10 | Conforme |
| Répéter dix fois une proposition connue comme fausse | Défaite, 10 lignes, solution révélée, validation désactivée | Conforme |
| Activer « Nouvelle partie » avec Entrée | Historique et sélecteurs vides, compteur 0/10, secret caché | Conforme |
| Afficher à 390 et 1 280 pixels de largeur | Contenu lisible sans débordement horizontal | Conforme à l’inspection visuelle et aux largeurs mesurées |

Ces contrôles ne remplacent pas un essai sur vrai smartphone, un parcours clavier complet ou un audit d’accessibilité.

## Une correction expliquée

**Avant** (`a7b1e6c`, preuve enregistrée dans `0fd7f2e`) : choisir vert–violet–vert–violet et valider affichait **V V V V** dans l’historique. Impossible de distinguer ces deux couleurs par leur symbole seul.

**Attendu** : des symboles distincts, aussi dans l’historique. **Correction** (`ded079f`) : associer « Vi » à violet et rendre les symboles visibles dans la légende. Le même essai donne **V Vi V Vi**, observé après rechargement. Les scores des captures ne sont pas comparés : chaque partie a un secret aléatoire.

[Capture avant](docs/preuves/symboles-avant.png) · [Capture après](docs/preuves/symboles-apres.png). Les ressources portent `0.1.0` dans leur URL pour éviter les anciens scripts en cache après cette mise à jour ; modifier ce repère lors d’une prochaine livraison.

## Limites, questions ouvertes et remise J1

- Confirmer le nom « Code secret » et l’apparence proposée ; ce sont des choix libres.
- Les quatre liens fournis ont été lus. La pièce jointe a été remplacée par un lien, selon la précision donnée dans le chat.
- Relire la décision avec Codex et les preuves ; aucune conversation n’est à publier dans le dépôt.
- Le 13 novembre, le dépôt cible est devenu `leelee-heg/code-secret`. L’écriture par la connexion GitHub du chat fonctionne sur ce nouveau dépôt ; les fichiers sont envoyés par cette connexion, avec de nouveaux commits d’import. Les SHA cités dans les preuves ci-dessus désignent les commits locaux d’origine, qui ne sont pas encore transférés sur GitHub.
- Le terminal Git reste sans authentification HTTPS. Son dépôt `origin` désigne encore l’ancien dépôt ; les historiques local et GitHub sont distincts. Avant tout prochain envoi avec Git, relier le nouveau dépôt et intégrer les historiques sans réécriture ni envoi forcé. Le tag local n’a pas été déplacé ni publié.
- GitHub Pages reste à activer : dans le dépôt, Settings → Pages → « Deploy from a branch », branche `main`, dossier `/ (root)`. Vérifier le jeu à l’adresse affichée puis noter cette adresse ici. Le serveur local ne constitue pas une publication. Sur Cyberlearn, remettre les deux liens et le tag avant le 20 novembre au soir ; l’heure exacte est à vérifier sur la plateforme. Aucune vidéo pour J1.
- Le secret local n’est pas protégé contre l’inspection du navigateur. Recharger perd la partie. Les polices Google sont facultatives ; le fonctionnement hors ligne n’a pas été vérifié.
- L’API interne n’est **pas annoncée conforme à l’API commune 0.2**. L’intégration sur la même partie que l’interface reste pour J2, ainsi que l’essai sur vrai smartphone. Pas de PWA ni d’extension à ce stade.

Pour reprendre : lire ce README, lancer les tests, reproduire le cas à changer, puis suivre `AGENTS.md`. Signaler un défaut par une issue du dépôt avec version, étapes, attendu et obtenu, sans donnée privée.

Autres supports consultés : [atelier du 11 novembre](https://docs.google.com/presentation/d/1Yi_XaAN5B_8kT8FrJXQ6rpPXLBk-8riz5rpyb55_Weo/edit), [guide README](https://docs.google.com/document/d/10FoB8lHkMB_Ys30Zcll1dFR_1TZ5nlNyhXRihrIIFjw/edit), [guide AGENTS](https://docs.google.com/document/d/1_epbOr-PrHMvFYcZaeLMDIjAmcKWd40ORtTX8Ia6_Sw/edit).
