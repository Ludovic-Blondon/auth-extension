<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## 🔐 Authentification vs Autorisation

### 🧾 **Authentification**

L’**authentification** est le processus qui consiste à **identifier un utilisateur** et à **vérifier son identité**.

Un des moyens les plus courants pour authentifier une identité est **l’utilisation d’un mot de passe**.  
👉 Si l’utilisateur saisit le bon mot de passe, cela signifie que son identité est **valide**, et le système **lui accorde l’accès**.

> ⚠️ Cette étape se fait **avant** l’autorisation.

---

### 🔑 **Autorisation**

L’**autorisation**, quant à elle, est le processus qui consiste à **déterminer si un utilisateur a le droit d’accéder** à une **ressource** ou une **fonctionnalité** spécifique.

> Par exemple : même si un utilisateur est authentifié, il n’est pas forcément autorisé à accéder à toutes les parties du système.

---

### 🧠 À retenir

| Terme                | Rôle principal                               | Quand ?       |
| -------------------- | -------------------------------------------- | ------------- |
| **Authentification** | Vérifier **qui est l’utilisateur**           | Avant l'accès |
| **Autorisation**     | Vérifier **ce que l’utilisateur peut faire** | Après l'accès |

## 🔐 JWT Authentication System

Ce projet implémente un système d'authentification basé sur JWT avec gestion sécurisée du renouvellement de tokens via le mécanisme de **Refresh Token Rotation**.

### 🚀 **Fonctionnalités principales :**

- 🔑 **Access Token** : Authentification des requêtes (1h)
- 🔄 **Refresh Token** : Renouvellement automatique (24h)
- 🛡️ **Token Rotation** : Sécurité renforcée

### 📖 **Documentation complète :**

Pour plus de détails sur l'implémentation et l'utilisation, consultez la **[documentation complète](./src/iam/readme.md)** 📚

## 🔐 Authorization

Ce projet utilise deux approches complémentaires pour la gestion des autorisations :

- **RBAC (Role-Based Access Control)** : basé sur un rôle global (`admin`, `regular`, etc.)
- **Claims-Based Authorization** : basé sur des permissions plus granulaires (`coffees:create`, `coffees:read`, etc.)

### 📖 **Documentation complète :**

➡️ Pour plus de détails, voir la [documentation complète sur l'authorization](./src/iam/authorization/readme.md).
