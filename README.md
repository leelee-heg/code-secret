# Code secret · Mastermind

Jeu solo réalisé pour le cours avec l’aide de Codex. Retrouvez quatre couleurs cachées en dix essais. Version **0.3.0**, préparée pour l’installation comme PWA (application web installable), avec l’API commune 0.2. La version du jalon 1 reste conservée par le tag ci-dessous.

- [Dépôt GitHub](https://github.com/leelee-heg/code-secret)
- [Application publiée sur GitHub Pages](https://leelee-heg.github.io/code-secret/).
- [Ouvrir le guide d’installation](https://leelee-heg.github.io/code-secret/?installer=1).
- [Application en mode test API 0.2](https://leelee-heg.github.io/code-secret/?test=1).
- [Version de rendu J1 : tag GitHub `jalon-1`](https://github.com/leelee-heg/code-secret/tree/jalon-1), commit `9f1d7c2`.

## État actuel

La version J1 reste repérée par son tag. Le **25 novembre 2026**, l’API commune 0.2 a été intégrée, vérifiée localement, puis publiée sur GitHub Pages. Les contrôles API et interface ont aussi réussi en ligne sur le commit `bb2cfe7`. Les résultats et leurs limites sont détaillés ci-dessous.

La version 0.3.0 ajoute le nom et l’icône d’installation **Code secret**, le guide d’installation, un QR code et un cache hors connexion. Elle conserve le même moteur et la même API. Les tests PWA du 26 novembre sont décrits ci-dessous ; l’installation native sur appareil reste à confirmer.

Le lien du QR, le manifeste, les icônes et le véritable cache ont également été vérifiés sur GitHub Pages après publication de cette version (`194722d`).

## Installer sur téléphone ou ordinateur

Ouvrir l’application en HTTPS, puis choisir **« Installer l’application »**. Le guide présente les étapes adaptées aux différents navigateurs. Lorsque Chrome ou Edge transmet une invitation d’installation au jeu, un bouton **« Installer sur cet appareil »** permet d’ouvrir la confirmation native. L’installation reste un choix de la personne qui joue.

- **Android, dont Pixel 8, avec Chrome** : menu ⋮ → « Installer l’application » ou « Ajouter à l’écran d’accueil », puis confirmer l’installation.
- **iPhone/iPad avec Safari** : menu de partage → « Sur l’écran d’accueil » ; activer « Ouvrir comme app web » si proposé, puis « Ajouter ».
- **Ordinateur avec Chrome ou Edge** : icône d’installation dans la barre d’adresse ou option d’installation du menu. Sur Mac avec Safari, « Fichier » → « Ajouter au Dock » si disponible.

Les intitulés et possibilités varient selon le navigateur et sa version. Un navigateur intégré peut nécessiter l’ouverture du lien dans Chrome, Edge ou Safari. Le jeu reste utilisable comme site si l’installation n’est pas proposée. Le manifeste demande un lancement autonome, avec le nom **Code secret** et l’icône représentant quatre pions dans un losange vert. L’affichage effectif sur l’écran d’accueil ou le Dock doit être confirmé sur chaque appareil testé.

### QR code à scanner ou partager

Le [QR code PNG](assets/qr-code-secret.png) et sa [version SVG imprimable](assets/qr-code-secret.svg) pointent vers **https://leelee-heg.github.io/code-secret/?installer=1**. Scanner avec l’appareil photo du téléphone, ouvrir le lien, puis suivre le guide affiché automatiquement. Le QR code ne déclenche pas lui-même une installation.

![QR code vers Code secret et le guide d’installation](assets/qr-code-secret.png)

### Hors connexion et mises à jour

Après une première ouverture en ligne et le message « Jeu disponible hors connexion sur cet appareil », les fichiers nécessaires au jeu sont mis en cache. Le chargement initial exige Internet ; un navigateur peut ensuite supprimer son stockage. Les polices sont désormais celles disponibles sur l’appareil : aucun téléchargement de police n’est nécessaire. La partie n’est pas sauvegardée : recharger ou rouvrir le jeu recommence une partie.

Le service worker est limité au dossier du jeu et à ses ressources, sans stocker le secret ou l’historique. Le mode `?test=1` utilise le réseau et n’enregistre pas le worker ; les contrôles enseignants ne sont pas destinés à fonctionner hors ligne. Les ressources demandées par un client en mode test sont servies depuis le réseau, même si un worker est déjà actif.

Une mise à jour attend la fermeture des fenêtres du jeu ; elle ne force pas le rechargement d’une partie en cours. Si le jeu signale une nouvelle version, fermer ses fenêtres puis le rouvrir avec Internet. Lors d’une prochaine livraison, actualiser la version du cache dans `sw.js` et les repères des ressources modifiées dans `index.html` et la liste de préchargement.

## Jouer et comprendre les règles

Ouvrir l’[application en ligne](https://leelee-heg.github.io/code-secret/) dans un navigateur récent : aucune installation pour jouer. Choisir quatre couleurs de gauche à droite, puis « Valider l’essai ». Consulter les indices et l’historique ; « Nouvelle partie » recommence le jeu. Il est aussi possible d’ouvrir `index.html` localement.

Pour obtenir les fichiers, télécharger le ZIP depuis le dépôt GitHub, l’extraire, puis ouvrir `index.html` dans le dossier extrait en conservant les autres fichiers à côté. Node.js est nécessaire pour les tests automatisés uniquement, pas pour jouer.

Premier parcours : sélectionner rouge–bleu–vert–jaune, puis valider. **Attendu** : une ligne dans l’historique, un essai consommé et deux nombres d’indices. Les valeurs dépendent du secret aléatoire. Si la proposition gagne, la partie se termine immédiatement. « Nouvelle partie » doit ensuite vider l’historique et les sélecteurs, remettre le compteur à zéro et cacher le secret. Le parcours à partir d’un ZIP fraîchement téléchargé reste à essayer.

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
| `api.js` | Adaptateur du contrat 0.2 et partie unique partagée avec l’interface |
| `game.js` | Sélecteurs, historique, messages et redémarrage |
| `manifest.webmanifest`, `pwa.js`, `sw.js` | Identité installable, guide, invitation native et cache hors connexion |
| `assets/` | Icône originale SVG, PNG d’installation et QR code |
| `tests.cjs`, `api-checks.js` | Vérifications du moteur et du contrat API |
| `tests-api.html`, `tests-browser.js` | Contrôles de la véritable interface et de son API dans le navigateur |
| `tests-pwa.cjs`, `tests-pwa.html`, `tests-pwa-browser.js` | Contrôles automatisés PWA et vérification du vrai cache dans le navigateur |
| `scripts/generate-pwa-assets.py` | Régénération facultative des icônes et du QR code, avec Pillow et qrcode côté développement uniquement |
| [AGENTS.md](AGENTS.md) | Consignes durables pour Codex : méthode, contrôles, Git et restitution |
| `docs/preuves/` | Captures de la correction avant/après |

Le moteur interne `CodeCouleurs.createGame()` reste utilisé. L’adaptateur `api.js` traduit son état vers le contrat commun ; `game.js` crée une seule session, utilisée aussi bien par les boutons que par l’API. Le calcul des indices reste uniquement dans `engine.js`.

## API commune 0.2

Source : [contrat API 0.2, édition Google 1.5 du 28 octobre 2026](https://docs.google.com/document/d/1hxqc3QfG0PTknulNIisBvg-0h0W7CjRe6eHC1q_jBYU/edit), lu le 25 novembre 2026.

Ouvrir `index.html?test=1` via un serveur local. L’objet `window.codeSecretTest` est exposé lorsque l’interface est prête, avec `version === "0.2"`. Sans `test=1`, il est absent et une partie aléatoire commence immédiatement. En mode test, l’état initial est `not-started` et la validation est désactivée jusqu’au démarrage d’une partie. Aucun secret de test n’est enregistré pour le chargement suivant.

| Fonction | Retour et comportement |
| --- | --- |
| `getConfig()` | Configuration fixe, synchrone : quatre positions, dix essais, répétitions possibles et palette commune |
| `getState()` | Copie indépendante, synchrone : `status`, `attempts`, `history`, `lastGuess`, `lastResult`, `lastError` |
| `startGame(options?)` | Promesse : nouvelle partie aléatoire, ou secret imposé avec `{ secret: [...] }` ; réinitialise aussi l’interface |
| `submitGuess(guess)` | Promesse : proposition sur la partie visible, réponse après sa mise à jour |

Les états sont `not-started`, `playing`, `won` et `lost`. Les indices sont `wellPlaced` et `misplaced`. Les refus de proposition renseignent `lastError`, sans consommer d’essai. Ils respectent l’ordre : partie non démarrée, partie terminée, type, longueur, couleur. Un démarrage invalide rejette une `Error` avec `code` et `message`, sans modifier l’état ni l’écran. Les getters ne modifient pas la partie.

Exemple dans la console du navigateur, sur la page en mode test :

```js
const api = window.codeSecretTest;
await api.startGame({ secret: ["rouge", "rouge", "bleu", "vert"] });
const state = await api.submitGuess(["rouge", "bleu", "rouge", "rouge"]);
console.log(state.attempts);   // 1
console.log(state.lastResult); // { wellPlaced: 1, misplaced: 2 }
```

Attendre chaque mutation avant la suivante. Le mode test ne révèle pas le code, même après une défaite ; les états API ne comportent jamais de champ `secret` ou `solution`. Le mode de jeu normal conserve la révélation finale déjà présente dans J1. Les deux modes utilisent le même moteur et les mêmes règles. Aucun serveur applicatif, compte, service d’IA ou paquet de production n’est ajouté.

## Vérifier

Depuis la racine, avec **Node.js 24** (testé avec 24.22.1) :

```sh
node tests.cjs
```

Résultats historiques du **12 novembre 2026**, sur la base `a7b1e6c`, puis après correction `ded079f` : « Tous les tests passent, dont 6 561 paires de combinaisons. » Node n’étant pas dans le PATH de cette session, l’exécution a utilisé le runtime Node fourni par Codex ; aucun paquet supplémentaire installé.

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

### Vérifications de l’API le 25 novembre 2026

Avant l’intégration, sur `c188f3b`, les 6 561 paires du moteur passaient ; l’objet commun `codeSecretTest` et le mode test n’existaient pas. Après intégration, la commande ci-dessus exécutée depuis la racine avec Node.js **24.22.1** passe : **6 561 paires et 18 groupes de contrôles API**, dont les neuf exemples T01–T09 du contrat. Le journal est conservé dans [api-0.2-node.txt](docs/preuves/api-0.2-node.txt).

Pour reproduire les contrôles dans le navigateur, lancer depuis la racine :

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Ouvrir `http://127.0.0.1:8000/tests-api.html`, attendre « Prêt », puis cliquer sur « Lancer les contrôles ». Attendu : « SUCCÈS : API et interface synchronisées. » Recharger cette page avant une nouvelle exécution. Cette adresse locale désigne l’ordinateur du lecteur ; elle n’est pas l’adresse publique du jeu.

| Contrôle exécuté | Résultat observé |
| --- | --- |
| Configuration, état initial, getters et copies indépendantes | Conforme |
| T01–T09, répétitions et indices | Conforme |
| Priorité des erreurs ; refus sans essai ; démarrage invalide atomique | Conforme |
| Victoire au dixième, refus à neuf essais, défaite, blocage et redémarrage | Conforme |
| Absence d’API en mode normal ; présence avec d’autres paramètres et `test=1` | Conforme |
| Comparaison des lignes, couleurs, indices et compteurs après les mutations API | Conforme |
| Proposition et nouvelle partie par l’interface, relues par l’API | Conforme |
| Refus visible ; démarrage invalide conservant aussi les sélecteurs | Conforme |
| Code caché après défaite en mode test | Conforme |
| Largeurs de 320 et 390 px | Aucun débordement horizontal mesuré |
| Saisie rouge–bleu–vert–jaune avec les touches de sélection et Tab, validation par Entrée | Une proposition ajoutée, compteur 1/10 |

Les contrôles du navigateur ont été exécutés dans le navigateur intégré, après rechargement de la page locale. Leur relevé est conservé dans [api-0.2-navigateur.txt](docs/preuves/api-0.2-navigateur.txt). Ils vérifient une seule véritable partie visible, et non un moteur de démonstration séparé.

### Vérification sur GitHub Pages le 25 novembre 2026

Le déploiement du commit `bb2cfe7` a réussi. Le même banc de contrôle, ouvert depuis [tests-api.html publié](https://leelee-heg.github.io/code-secret/tests-api.html), a affiché « SUCCÈS : API et interface synchronisées. » Les 18 groupes API passent en ligne, ainsi que les échanges API/interface, les refus, les fins de partie, le code caché en mode test et les contrôles de largeur. L’API est présente avec `test=1` et absente en mode normal. Le relevé est conservé dans [api-0.2-publication.txt](docs/preuves/api-0.2-publication.txt).

### Tests sur mobile et à largeur réduite — relevé du 26 novembre 2026

| Appareil ou configuration | Navigateur | Résultat et origine du constat |
| --- | --- | --- |
| Google Pixel 8, appareil physique | Chrome | Le jeu fonctionnait correctement, selon le retour de la personne ayant réalisé ce test sur son téléphone. |
| Fenêtre réglée à 412 px, sans téléphone physique | Navigateur intégré à Codex | Sélecteurs modifiables avant validation ; compteur passé de 4/10 à 5/10 ; cinquième ligne ajoutée sans perte de l’historique ; mêmes indices 1/1 pour la même proposition ; aucun débordement horizontal mesuré. Un défaut d’accord du résumé a été repéré, puis corrigé comme décrit ci-dessous. |

Le test sur Pixel 8 est un retour d’utilisation, distinct du contrôle effectué par Codex à 412 px. Les versions de Chrome et d’Android ainsi que les étapes détaillées de l’essai sur téléphone n’ont pas été consignées ; ce retour ne constitue pas un test exhaustif de l’API ou de tous les navigateurs mobiles.

### Vérifications PWA — 26 novembre 2026

Depuis la racine, exécuter `node tests.cjs`, puis `node tests-pwa.cjs`. Les contrôles PWA ne nécessitent aucune dépendance supplémentaire. Ils examinent le manifeste et les PNG livrés, puis utilisent des doubles de test pour vérifier le repli hors ligne, l’isolation des caches, les invitations d’installation et leur annulation. Ces simulations ne constituent pas une installation réelle.

Avec le serveur local décrit ci-dessus, ouvrir `tests-pwa.html` et cliquer sur « Vérifier les ressources PWA ». Attendu : « SUCCÈS : ressources PWA prêtes. » Ce banc vérifie un véritable service worker et le contenu de son cache, sans couper le réseau. `tests-api.html` reste disponible pour rejouer les contrôles du jeu et des accords.

| Contrôle exécuté localement | Résultat |
| --- | --- |
| Moteur : 6 561 paires ; API : 18 groupes | Réussis |
| Manifeste, identité propre à `/code-secret/`, icônes PNG 192 et 512 px, icône maskable et icône Apple | Conformes aux contrôles de fichiers |
| QR PNG décodé par un outil indépendant de celui de génération | Adresse exacte `https://leelee-heg.github.io/code-secret/?installer=1` |
| Repli hors ligne, priorité réseau, cache propre au jeu et exclusion du mode test | Réussis dans les simulations du worker |
| Service worker réellement actif et ressources réellement présentes dans Cache Storage | Vérifiés dans le navigateur intégré |
| Guide ouvert automatiquement par `?installer=1`, fermeture par Échap, réouverture pendant une partie | Vérifiés ; partie conservée |
| Affichage du guide à 412 px | Aucun débordement horizontal mesuré, contenu accessible par défilement |
| Contrôles API/interface et accords après ajout PWA | Réussis dans le navigateur intégré |

Le [relevé PWA](docs/preuves/pwa-0.3.0.txt) distingue les observations réelles des simulations. Sur GitHub Pages, `tests-pwa.html` a aussi confirmé les icônes, le worker actif et les ressources du cache. Le banc API prend en compte les cadres déjà chargés avant l’attachement de ses écouteurs ; cet ajustement évite de dépendre uniquement d’un futur événement de chargement lorsque les pages sont en cache. Il a été revérifié localement puis sur GitHub Pages avec le worker actif : les 18 groupes API, l’interface et les accords ont réussi.

La génération et le décodage du QR ont utilisé qrcode, Pillow et zxing-cpp uniquement comme outils de développement ; les images livrées sont statiques. La régénération n’est requise ni pour jouer ni pour déployer.

Pour vérifier sur un appareil réel : installer depuis le site public, contrôler le nom et l’icône sur l’écran d’accueil ou le Dock, ouvrir l’icône, attendre la préparation hors connexion, fermer le jeu, activer le mode avion puis rouvrir et jouer un coup. Tester ensuite une mise à jour avec une partie déjà ouverte. Ces essais natifs n’ont pas été réalisés par Codex ; le retour Pixel 8/Chrome ci-dessus concernait le jeu avant l’ajout de la PWA.

Sources techniques consultées pour cette étape : [installation PWA (MDN)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable), [invitation d’installation (MDN)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Trigger_install_prompt), [identité du manifeste (MDN)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/id), [cycle de vie du service worker (web.dev)](https://web.dev/articles/service-worker-lifecycle) et [ajout à l’écran d’accueil sur iPhone (Apple)](https://support.apple.com/guide/iphone/bookmark-a-website-iph42ab2f3a7/ios).

## Une correction expliquée

**Avant** (`a7b1e6c`, preuve enregistrée dans `0fd7f2e`) : choisir vert–violet–vert–violet et valider affichait **V V V V** dans l’historique. Impossible de distinguer ces deux couleurs par leur symbole seul.

**Attendu** : des symboles distincts, aussi dans l’historique. **Correction** (`ded079f`) : associer « Vi » à violet et rendre les symboles visibles dans la légende. Le même essai donne **V Vi V Vi**, observé après rechargement. Les scores des captures ne sont pas comparés : chaque partie a un secret aléatoire.

[Capture avant](docs/preuves/symboles-avant.png) · [Capture après](docs/preuves/symboles-apres.png). Les ressources portent `0.1.0` dans leur URL pour éviter les anciens scripts en cache après cette mise à jour ; modifier ce repère lors d’une prochaine livraison.

### Accords du résumé des indices — 26 novembre 2026

Avant correction (version locale `da86e5d`), un résultat 1/1 affichait « 1 bien placées, 1 mal placées » dans le résumé, alors que l’historique utilisait le singulier. Le défaut a été reproduit ; un contrôle ajouté au banc navigateur échouait également pour 0/0.

La correction reprend dans le résumé la règle d’accord déjà utilisée par l’historique : « placée » pour 0 et 1, « placées » à partir de 2. Après rechargement sur une adresse locale sans l’ancienne page en cache, les cas 0/0, 2/2 et 1/1 ainsi que les contrôles API/interface ont réussi. Pour 1/1, le secret rouge–bleu–vert–jaune et la proposition rouge–orange–orange–bleu affichent exactement « Essai 1 : 1 bien placée, 1 mal placée. » Le repère de chargement de `game.js` est actualisé pour éviter un ancien script en cache. Cette correction ne change pas le calcul des indices. Voir le [relevé avant/après](docs/preuves/accords-indices.txt).

## Limites et suite du projet

Le secret est caché pendant la partie, mais reste accessible à une personne qui inspecte le navigateur. Recharger la page fait perdre la partie en cours.

Le rechargement et le jeu réellement sans réseau, l’installation native sur smartphone/ordinateur et un parcours clavier complet restent à vérifier sur appareil. Le cache réel et le repli hors ligne simulé ont été contrôlés séparément. Un fonctionnement correct du jeu avant ajout PWA a été rapporté sur Pixel 8 avec Chrome ; ce retour ne valide pas son installation ni les autres appareils et navigateurs mobiles.

L’API 0.2 a été vérifiée localement et sur GitHub Pages avec les contrôles décrits ci-dessus. Restent à vérifier : son comportement depuis un contexte neuf avec caches explicitement vidés, et l’outil de test de l’enseignant, qui n’a pas été fourni. Le tag `jalon-1` n’est pas une version de cette API ; il reste inchangé. Aucun résultat de conformité à un outil non exécuté n’est revendiqué.

## Repères Git

La version de rendu est le tag GitHub `jalon-1` (`9f1d7c2`), accessible par le lien en tête du README. Le tag local du même nom pointe vers `05f7b67` : ne pas l’envoyer par-dessus le tag distant. Les références de commits des preuves avant/après appartiennent à l’historique local. Les mises à jour documentaires suivantes ne modifient pas le contenu figé du tag.

## Aide et reprise

Pour reprendre le développement, lire ce README et les consignes de [AGENTS.md](AGENTS.md), puis lancer `node tests.cjs` depuis la racine du projet avec Node.js 24.

Pour signaler un problème, ouvrir une [issue sur GitHub](https://github.com/leelee-heg/code-secret/issues) en précisant les étapes, le résultat attendu et le résultat obtenu.

Autres supports consultés : [atelier du 11 novembre](https://docs.google.com/presentation/d/1Yi_XaAN5B_8kT8FrJXQ6rpPXLBk-8riz5rpyb55_Weo/edit), [guide README](https://docs.google.com/document/d/10FoB8lHkMB_Ys30Zcll1dFR_1TZ5nlNyhXRihrIIFjw/edit), [guide AGENTS](https://docs.google.com/document/d/1_epbOr-PrHMvFYcZaeLMDIjAmcKWd40ORtTX8Ia6_Sw/edit).
