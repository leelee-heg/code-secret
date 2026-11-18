# Consignes de travail

Ces consignes s’appliquent à tout le projet. Le README présente le jeu ; ce fichier décrit la manière d’y travailler. Le périmètre de chaque tâche est donné par la demande en cours.

## Repères et conventions

- Lire le README et les fichiers concernés avant de modifier. Les règles renvoient à l’énoncé `code-couleurs-1.0` cité dans le README.
- Garder une application statique en français, sans dépendance de production ni étape de compilation. Séparer moteur (`engine.js`), interface (`game.js`), structure et styles.
- Préserver les six identifiants de couleur et leur ordre indiqués dans le README. Ne pas confondre l’API interne actuelle avec le contrat commun 0.2.
- Conserver les noms ou symboles distincts des couleurs, les libellés accessibles, le clavier et la disposition sur petit écran.

## Méthode

- Examiner `git status` avant de travailler et préserver les modifications de l’utilisateur.
- Préserver le travail existant. Avancer par petites modifications réversibles ; expliquer le but et l’attendu avant le changement.
- Ne pas inventer une règle ou un résultat. Signaler les sources manquantes et distinguer vérifié, supposé et non vérifié.
- Si une ambiguïté change le résultat attendu, la signaler et proposer un choix motivé avant la modification concernée.
- Limiter le travail au jalon demandé ; les extensions facultatives et l’API commune 0.2 relèvent d’un travail ultérieur tant qu’elles ne sont pas demandées.

## Vérification

- Après un changement du moteur, exécuter `node tests.cjs` depuis la racine, avec Node.js 24 disponible. Le résultat attendu est décrit dans le README. Si le runtime manque, signaler le blocage ; ne pas annoncer les tests comme exécutés.
- Après un changement d’interface, recharger la page et rejouer le cas concerné ainsi qu’un cas valide. Contrôler le clavier et l’affichage sur petit écran lorsque le changement les concerne.
- Pour une correction, reproduire le défaut avant, conserver sa version Git et comparer le même essai après. Actualiser le README avec attendu, obtenu et limites.
- Après un changement de documentation seule, vérifier les chemins et liens relatifs, les commandes citées et le diff ; ne pas présenter cette relecture comme un nouveau test du jeu.
- Consigner séparément les contrôles réussis, les échecs et les contrôles non réalisés. Conserver les preuves utiles dans `docs/preuves/`, sans données privées.

## Git et limites

- Faire un commit explicite en français après chaque modification cohérente vérifiée, en sélectionnant uniquement les fichiers concernés. Ne pas réécrire l’historique ni déplacer un tag de rendu existant.
- Avant un envoi distant, vérifier la destination et l’état des historiques. Ne pas forcer un envoi pour résoudre leur divergence ; voir les limites du README.
- Ne pas ajouter de compte, clé API, service d’IA, donnée personnelle ou conversation au jeu ou au dépôt. Demander avant une publication qui n’a pas été autorisée.
- Ne pas supprimer définitivement de contenu sans autorisation. Signaler les outils ou accès manquants.

## Restitution

- Résumer les fichiers modifiés, le but du changement, les contrôles exécutés et leurs résultats, puis les limites ou décisions encore ouvertes.
- Actualiser le README lorsque l’usage, les choix, les vérifications ou les limites changent. Garder ici les consignes durables, sans calendrier ni journal de conversation.

Rédaction adaptée du [guide AGENTS.md du cours](https://docs.google.com/document/d/1_epbOr-PrHMvFYcZaeLMDIjAmcKWd40ORtTX8Ia6_Sw/edit), version 1.0 du 3 novembre 2026, relu le 13 novembre 2026. Entretenir ces consignes à partir des difficultés observées et retirer celles devenues inutiles.
