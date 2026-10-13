# Vos favoris s’empilent ? Laissez l’IA ranger votre Linkwarden. 🧠🔖

**Une page intéressante. Un clic. Un favori bien rangé.**

L’extension Firefox qui transforme vos pages web en favoris utiles : titre clair, bonne collection, tags pertinents et résumé en français. Vous vérifiez, vous ajustez, vous enregistrez.

> Projet indépendant, non officiel. Votre Linkwarden reste hébergé chez vous ; l’analyse IA passe par OpenRouter et le fournisseur du modèle choisi.

Extension Firefox Manifest V3, en français, sans dépendances et sans serveur intermédiaire. Un clic extrait le texte de l’onglet (ou votre sélection), puis ouvre une fenêtre stable. OpenRouter prépare un titre, une collection, des tags et une description. Vous pouvez tout corriger avant l’enregistrement via l’API Linkwarden. L’URL originale, fragment compris, est conservée.

## Ce qu’il vous faut

| Élément | Où le trouver |
| --- | --- |
| Firefox 142 ou supérieur | Votre navigateur à jour |
| Un compte Linkwarden | Votre instance auto-hébergée, accessible en HTTPS |
| Un token Linkwarden | **Settings → Access Tokens** sur votre instance |
| Une clé API OpenRouter | [OpenRouter → API Keys](https://openrouter.ai/settings/keys) |
| Un modèle compatible JSON | Par défaut : `openai/gpt-4.1-mini` |

Aucune configuration IA côté serveur Linkwarden n’est nécessaire. Les appels au modèle sont facturés par OpenRouter selon le modèle utilisé.

## Installation en quelques minutes

Sur GitHub, cliquez sur **Code → Download ZIP**, puis décompressez le fichier dans un dossier que vous garderez sur votre ordinateur.

1. Ouvrez Firefox et saisissez `about:debugging#/runtime/this-firefox`.
2. Cliquez sur **Charger un module complémentaire temporaire**.
3. Sélectionnez `extension/manifest.json` dans ce dossier (ou le fichier ZIP dans `dist`).
4. Épinglez l’extension depuis le menu des extensions et cliquez sur son icône depuis une page web.
5. Dans **Réglages**, saisissez l’adresse Linkwarden, son token, la clé OpenRouter et un modèle compatible avec le mode JSON. Le modèle proposé est `openai/gpt-4.1-mini`.
6. Enregistrez les réglages et acceptez l’accès à votre serveur et à OpenRouter. Vous pouvez tester la connexion Linkwarden.
7. Vérifiez le texte à envoyer, cliquez sur **Analyser avec l’IA**, ajustez les champs, puis **Enregistrer dans Linkwarden**.

Firefox 142 minimum. L’installation temporaire disparaît au redémarrage de Firefox. Pour une installation permanente dans Firefox standard, il faudra signer l’extension via Mozilla ; l’archive fournie n’est pas signée.

## Où récupérer le token Linkwarden ?

Le token se crée **dans votre propre instance Linkwarden**, pas sur le site public de Linkwarden.

1. Ouvrez votre instance, par exemple `https://liens.mondomaine.fr`.
2. Connectez-vous au compte dont vous voulez utiliser les collections.
3. Ouvrez **Settings / Paramètres** depuis votre menu utilisateur.
4. Allez dans **Access Tokens / Jetons d’accès** ; le libellé peut varier selon la langue.
5. Créez un token nommé **Firefox Assistant**. Choisissez une expiration adaptée si proposée.
6. Copiez sa valeur et collez-la dans **Token Linkwarden** dans les réglages de l’extension.

Le token utilise les droits de votre compte. Ce n’est ni votre mot de passe ni la clé OpenRouter.

[La documentation officielle confirme le chemin Settings → Access Tokens.](https://docs.linkwarden.app/getting-started/mobile-app)

## Où récupérer la clé OpenRouter ?

1. Connectez-vous à [OpenRouter](https://openrouter.ai/).
2. Ouvrez [Settings → API Keys](https://openrouter.ai/settings/keys).
3. Créez une clé dédiée à l’extension et copiez-la.
4. Vérifiez que votre compte dispose du crédit nécessaire pour le modèle choisi.
5. Collez la clé dans **Clé API OpenRouter** dans les réglages de l’extension.

## Réglages : quoi mettre dans les champs ?

| Champ | Valeur |
| --- | --- |
| Adresse Linkwarden | `https://liens.mondomaine.fr` |
| Token Linkwarden | Le token créé sur votre instance |
| Clé API OpenRouter | Votre clé OpenRouter |
| Modèle OpenRouter | `openai/gpt-4.1-mini` ou un autre modèle compatible JSON |
| Limite de caractères | `24000` par défaut |

L’adresse racine suffit : n’ajoutez pas `/api/v1`. Une adresse copiée depuis `/fr/dashboard` est normalisée automatiquement.

Cliquez sur **Enregistrer les réglages**, acceptez l’accès aux serveurs et utilisez **Tester Linkwarden**. Ensuite : **Analyser avec l’IA → corriger les champs si nécessaire → Enregistrer dans Linkwarden**.

## Confidentialité et limites

- Aucune capture ni analyse automatique : l’extraction se fait au clic et l’envoi au clic sur Analyser.
- Les clés sont stockées dans `browser.storage.local`, dans le profil Firefox, sans synchronisation et **sans chiffrement**. Effacez-les avec le bouton dédié si nécessaire. Elles ne sont pas incorporées à l’archive et ne figurent jamais dans le prompt.
- Le texte, le titre, l’URL et les noms des collections/tags sont transmis à OpenRouter et au fournisseur du modèle. Le texte principal est limité par défaut à 24 000 caractères. Évitez l’envoi de données internes que votre organisation ne souhaite pas partager.
- Les champs de formulaire sont exclus de l’extraction automatique. Une sélection de texte est prioritaire ; vérifiez toujours l’aperçu. L’extraction est heuristique et ne remplace pas un parseur d’article spécialisé.
- Les pages internes Firefox, certains sites protégés et le lecteur PDF ne peuvent pas être lus. Les pages visuelles/canvas ou très dynamiques peuvent fournir peu de texte. Cette version n’envoie pas d’images.
- Le modèle choisit une collection existante ; il ne crée pas de collection. Il peut proposer jusqu’à six tags, créés à l’enregistrement si nécessaire.
- Linkwarden conserve le lien et les métadonnées. L’archivage d’une page accessible seulement avec votre session n’est pas assuré par cette extension.
- Un enregistrement réussi désactive le bouton pour éviter un double clic. En cas de délai dépassé lors de l’enregistrement, vérifiez Linkwarden avant de réessayer : le serveur peut avoir reçu la requête.
- Les captures et propositions résident uniquement dans la mémoire de session Firefox. Les modifications manuelles ne sont pas sauvegardées automatiquement avant l’enregistrement.

## Vérification et développement

Node.js **20 ou supérieur** pour les tests. L’extension n’a aucune dépendance à installer.

```sh
git clone https://github.com/alchymi/linkwarden.git
cd linkwarden
npm test
npm run check
```

Validation avec l’outil Mozilla :

```sh
npx web-ext lint --source-dir extension
```

Pour fabriquer une archive sous Windows :

```powershell
New-Item -ItemType Directory -Path dist -Force
Compress-Archive -Path extension\* -DestinationPath dist\linkwarden-assistant-firefox.zip -Force
```

`npm test` vérifie les règles de validation et les payloads API. `npm run check` vérifie la syntaxe JavaScript.

`npm run smoke` utilise le fichier local `tocken.git` pour tester les collections et OpenRouter (appel facturé selon le modèle). `node scripts/smoke.cjs --save` crée également un favori clairement nommé comme test et le relit. Ne distribuez jamais ce fichier de clés.

Pour ces tests facultatifs, créez votre propre `tocken.git` avec ce format. Les valeurs ci-dessous sont des exemples, pas des identifiants :

```text
url: https://liens.mondomaine.fr
tocken: VOTRE_TOKEN_LINKWARDEN
openrouterkey: VOTRE_CLE_OPENROUTER
```

Ce fichier, les profils Firefox de test, les caches et les archives locales sont exclus de Git.

L’extension est entièrement contenue dans `extension/`. Le ZIP de distribution doit inclure uniquement le contenu de ce dossier, avec `manifest.json` à la racine.
