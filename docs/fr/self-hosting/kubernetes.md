# Déployer avec Kubernetes

Kubernetes est peut-être excessif pour un site statique, mais il peut très bien convenir si vous standardisez déjà sur Helm + GitOps.

> [!IMPORTANT]
> **En-têtes requis pour la conversion de fichiers Office**
>
> Les outils basés sur LibreOffice (conversion Word, Excel, PowerPoint) nécessitent ces en-têtes HTTP pour la prise en charge de `SharedArrayBuffer` :
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
>
> Les images nginx officielles de BentoPDF incluent ces en-têtes. Dans Kubernetes, **les contrôleurs Ingress/Gateway sont aussi des reverse proxies** : assurez-vous donc que ces en-têtes sont conservés (ou ajoutez-les en périphérie).

## Prérequis

- Un cluster Kubernetes
- Helm v3
- Une image nginx BentoPDF (par ex. `ghcr.io/alam00000/bentopdf:<tag>`) qui sert sur le **port 8080**

## Déployer avec Helm

### Installer depuis ce dépôt (chart local)

```bash
kubectl create namespace bentopdf

helm upgrade --install bentopdf /path/to/bentopdf/chart \
  --namespace bentopdf \
  --set image.repository=ghcr.io/alam00000/bentopdf \
  --set image.tag=latest
```

### Installer depuis GHCR (chart OCI)

Si le chart est publié sur GHCR en tant qu'artefact OCI :

```bash
export GHCR_USERNAME="<github-org-or-user>"

helm upgrade --install bentopdf oci://ghcr.io/$GHCR_USERNAME/charts/bentopdf \
  --namespace bentopdf \
  --create-namespace \
  --version 0.1.0 \
  --set image.repository=ghcr.io/alam00000/bentopdf \
  --set image.tag=latest
```

## L'exposer

### Port-forward (test rapide)

```bash
kubectl -n bentopdf port-forward deploy/bentopdf 8080:8080
```

### Ingress (facultatif)

Activez Ingress (exemple pour nginx-ingress) :

```yaml
ingress:
  enabled: true
  className: nginx
  hosts:
    - host: pdf.example.com
      paths:
        - path: /
          pathType: Prefix
```

### Gateway API (facultatif)

Ce chart prend en charge `Gateway` + `HTTPRoute` de Gateway API.

Exemple (opérateur Gateway API de Cloudflare) :

```yaml
gateway:
  enabled: true
  name: bento-tunnel
  namespace: bentopdf
  gatewayClassName: cloudflare

httpRoute:
  enabled: true
  parentRefs:
    - name: bento-tunnel
      namespace: bentopdf
      sectionName: http
  hostnames:
    - pdfs.example.com
```

## Vérifier que les en-têtes SharedArrayBuffer fonctionnent toujours (Ingress/Gateway)

### Ce qui « devrait » se passer

La configuration nginx de BentoPDF définit les en-têtes de réponse requis. La plupart des contrôleurs Ingress/Gateway **transmettent les en-têtes de réponse en amont sans les modifier**.

### Ce qui peut tout casser

- Une politique de contrôleur ou de périphérie qui **remplace** ou **supprime** les en-têtes de réponse
- Un middleware d'« en-têtes de sécurité » qui définit des valeurs COOP/COEP différentes

### Comment vérifier

Exécutez ceci sur votre point d'accès public :

```bash
curl -I https://pdf.example.com/ | egrep -i 'cross-origin-opener-policy|cross-origin-embedder-policy'
```

Vous devriez voir :

- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

### Si votre contrôleur Ingress ne les conserve pas

Ajoutez les en-têtes en périphérie (selon le contrôleur). Exemple pour **nginx-ingress** :

```yaml
ingress:
  enabled: true
  className: nginx
  annotations:
    nginx.ingress.kubernetes.io/configuration-snippet: |
      add_header Cross-Origin-Opener-Policy "same-origin" always;
      add_header Cross-Origin-Embedder-Policy "require-corp" always;
```

## Erreurs de type MIME `.mjs` (iframe vide dans Signer un PDF / remplissage de formulaire)

Si la console du navigateur affiche `Failed to load module script: ... non-JavaScript MIME type "application/octet-stream"` sur une requête `.mjs`, un contrôleur Ingress/Gateway placé devant le nginx de BentoPDF remplace l'en-tête `Content-Type` en amont par `application/octet-stream`.

Le nginx de l'image BentoPDF sert déjà `.mjs` en `application/javascript`. La solution consiste à empêcher le contrôleur de le supprimer ou de le remplacer. Pour nginx-ingress :

```yaml
ingress:
  annotations:
    nginx.ingress.kubernetes.io/configuration-snippet: |
      location ~* \.mjs$ {
        types {} default_type application/javascript;
      }
```

Ou utilisez un filtre `ResponseHeaderModifier` dans Gateway API pour définir `Content-Type: application/javascript` sur les chemins `.mjs`. Vérifiez avec les DevTools, onglet Network : la requête `.mjs` en échec doit maintenant afficher `content-type: application/javascript`.

### Si vous utilisez Gateway API et voulez forcer l'ajout d'en-têtes

Gateway API prend en charge un filtre `ResponseHeaderModifier`. Vous pouvez l'attacher dans `httpRoute.rules[*].filters` :

```yaml
httpRoute:
  enabled: true
  hostnames: [pdf.example.com]
  parentRefs:
    - name: bento-tunnel
      namespace: misc
      sectionName: http
  rules:
    - matches:
        - path: { type: PathPrefix, value: / }
      filters:
        - type: ResponseHeaderModifier
          responseHeaderModifier:
            set:
              - name: Cross-Origin-Opener-Policy
                value: same-origin
              - name: Cross-Origin-Embedder-Policy
                value: require-corp
```

La prise en charge de filtres précis dépend de votre contrôleur Gateway ; si un filtre est ignoré, ajoutez plutôt les en-têtes au niveau de la périphérie ou du contrôleur.

## Désactiver des outils précis

Utilisez un ConfigMap pour désactiver des outils à l'exécution sans reconstruire l'image :

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: bentopdf-config
  namespace: bentopdf
data:
  config.json: |
    {
      "disabledTools": ["edit-pdf", "sign-pdf", "encrypt-pdf"]
    }
```

Montez-le dans le répertoire servi :

```yaml
spec:
  containers:
    - name: bentopdf
      volumeMounts:
        - name: config
          mountPath: /usr/share/nginx/html/config.json
          subPath: config.json
          readOnly: true
  volumes:
    - name: config
      configMap:
        name: bentopdf-config
```

Les identifiants d'outils correspondent à l'URL de la page sans `.html` : ouvrez un outil et regardez l'URL (par ex. `edit-pdf`, `merge-pdf`, `compress-pdf`). Les outils désactivés sont masqués de la page d'accueil, de la recherche, des raccourcis, du constructeur de workflow et de l'accès direct par URL. Consultez le [guide Docker](/fr/self-hosting/docker#desactiver-des-outils-specifiques) pour la liste complète des options.
