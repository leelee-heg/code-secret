# Consignes de travail

- Lire le README et les fichiers concernés avant de modifier. Les règles renvoient à l’énoncé `code-couleurs-1.0` cité dans le README.
- Garder une application statique en français, sans dépendance de production ni étape de compilation. Séparer moteur (`engine.js`), interface (`game.js`), structure et styles.
- Préserver le travail existant. Avancer par petites modifications réversibles ; expliquer le but et l’attendu avant le changement.
- Ne pas inventer une règle ou un résultat. Signaler les sources manquantes et distinguer vérifié, supposé et non vérifié.
- Après un changement du moteur, exécuter `node tests.cjs` depuis la racine (Node.js 24 testé). Après un changement d’interface, recharger la page et rejouer le cas concerné ainsi qu’un cas valide.
- Pour une correction, reproduire le défaut avant, conserver sa version Git et comparer le même essai après. Actualiser le README avec attendu, obtenu et limites.
- Conserver les noms ou symboles distincts des couleurs, les libellés accessibles, le clavier et la disposition sur petit écran.
- Faire un commit explicite en français après chaque modification cohérente vérifiée, en sélectionnant uniquement les fichiers concernés. Ne pas réécrire l’historique ni déplacer un tag de rendu existant.
- Ne pas ajouter de compte, clé API, service d’IA, donnée personnelle ou conversation au jeu ou au dépôt. Demander avant une publication qui n’a pas été autorisée.
- Limiter le travail au jalon demandé ; les extensions facultatives et l’API commune 0.2 relèvent d’un travail ultérieur tant qu’elles ne sont pas demandées.
