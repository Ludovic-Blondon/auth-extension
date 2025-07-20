# 🔐 JWT Authentication System

Ce projet implémente un système d'authentification basé sur JWT avec gestion sécurisée du renouvellement de tokens via le mécanisme de **Refresh Token Rotation**.

---

## 🧾 Fonctionnement

### 🔑 Authentification

Lors d'une requête `POST /authentication/sign-in`, deux tokens sont générés :

- **accessToken** :
  - Format JWT
  - Valide pendant **1 heure**
  - Transmis dans le header `Authorization` pour les requêtes protégées

- **refreshToken** :
  - Format JWT
  - Valide pendant **24 heures**
  - Permet de renouveler l’`accessToken` sans réauthentification manuelle

---

### 🔁 Renouvellement des tokens

Route : `POST /authentication/refresh-tokens`

#### ✅ Fonctionnalité :

- Le client envoie son `refreshToken` dans le **corps** de la requête.
- Le serveur vérifie sa validité.
- Un **nouvel `accessToken` et un nouveau `refreshToken`** sont générés.
- **L’ancien `refreshToken` est immédiatement invalidé**.

> Ce mécanisme est appelé **Refresh Token Rotation**, une bonne pratique de sécurité recommandée pour éviter la réutilisation frauduleuse des tokens.

---

### 🔐 Accès aux routes protégées

Pour appeler une route nécessitant une authentification :

```text
Authorization: Bearer <accessToken>
```

Le middleware de sécurité validera automatiquement le token.

---

## 🔒 Bonnes pratiques mises en place

- **Expiration courte** des `accessTokens` : limite la fenêtre d’exploitation en cas de vol.
- **Rotation des refresh tokens** : chaque `refreshToken` est **utilisable une seule fois**.
- **Invalidation immédiate** du `refreshToken` après usage.
- **Séparation des rôles** :
  - `accessToken` : authentification et autorisation.
  - `refreshToken` : renouvellement sécurisé des jetons.

---

## 📌 Suggestions d'intégration côté client

- Stocker l’`accessToken` en **mémoire volatile** ou `localStorage` _(avec précaution)_.
- Stocker le `refreshToken` en **cookie HTTP-only sécurisé**, pour éviter les attaques XSS.
- Implémenter une stratégie de **"silent refresh"** pour renouveler automatiquement l’`accessToken` avant son expiration.

---

## 📬 Routes disponibles

| Méthode | Endpoint                         | Description                                      |
| ------- | -------------------------------- | ------------------------------------------------ |
| `POST`  | `/authentication/sign-in`        | Authentifie l’utilisateur et retourne les tokens |
| `POST`  | `/authentication/refresh-tokens` | Renouvelle les tokens via un `refreshToken`      |

---

## 🛡️ Sécurité

Ce système applique plusieurs recommandations de l’[OWASP](https://owasp.org/) en matière d’authentification basée sur token :

- Utilisation de **JWT signés** pour assurer l’intégrité.
- **Refresh Token Rotation** pour éviter la réutilisation.
- Limitation de la durée de vie des tokens.
- Invalidation automatique des tokens compromis ou expirés.

---

## 🧩 Besoin d’aide ?

Ce projet est encore en amélioration continue.  
Tu peux proposer des évolutions, signaler des bugs ou poser des questions via les issues du repo.
