# 🔐 Authorization dans l'application NestJS

Ce projet implémente trois approches d'autorisation différentes :

- ✅ **Role-Based Access Control (RBAC)**
- 🛂 **Claims-Based Authorization**
- 🧩 **Policy-Based Authorization**

---

## ✅ Role-Based Access Control (RBAC)

Cette approche repose sur un champ `roles` dans la table `user`, défini comme un **enum** (`admin`, `regular`, etc.).

Chaque route est protégée par des décorateurs (`@Roles`) indiquant le **niveau de rôle requis** pour y accéder.  
Par exemple, certaines routes ne seront accessibles qu'aux utilisateurs ayant le rôle `admin`.

➡️ Ce modèle est simple et adapté quand les rôles sont peu nombreux et bien définis.

---

## 🛂 Claims-Based Authorization

Cette approche est plus **granulaire** et **flexible**.

Elle repose sur un champ `permissions` dans la table `user`, qui est un **tableau JSON** contenant des chaînes de type :

```json
["coffee:create", "coffee:read", "coffee:update", "coffee:delete"]
```

### 🎯 Contrôle de permissions fin par route

Chaque route peut vérifier une **permission précise**, indépendamment du rôle global de l'utilisateur.

Par exemple :

- Un utilisateur peut avoir le droit de :
  - ✅ créer des cafés (`coffee:create`)
  - ✏️ modifier des cafés (`coffee:update`)
- Tandis qu'un superviseur spécifique peut être le **seul autorisé** à :
  - ❌ supprimer des cafés (`coffee:delete`)

➡️ Ce modèle est particulièrement adapté aux systèmes complexes avec des règles d'accès **fines et personnalisées** par utilisateur.

---

## 🧩 Policy-Based Authorization

L'approche Policy-Based Authorization permet de définir des règles d'accès personnalisées et dynamiques, allant au-delà des simples rôles ou permissions.

Au lieu de baser l'autorisation sur un rôle (admin, user, etc.) ou une permission (coffee:create), une "policy" (politique) est un objet contenant une logique métier explicite qui détermine si un utilisateur peut accéder à une ressource.

### 🧪 Exemple concret

Imaginons une règle où seuls les utilisateurs avec une adresse email se terminant par `@gmail.com` peuvent accéder à une ressource.

**framework-contributor.policy.ts**

```typescript
// framework-contributor.policy.ts
async handle(
  policy: FrameworkContributorPolicy,
  user: ActiveUserData,
): Promise<void> {
  const isContributor = user.email.endsWith('@gmail.com');
  if (!isContributor) {
    throw new ForbiddenException();
  }
}
```

Avec ça, si on injecte le décorateur `@Policies(new FrameworkContributorPolicy())` sur une route, l'utilisateur devra avoir un email en `@gmail.com` pour accéder à la ressource. Cela montre un échantillon de la puissance de cet outil.

**coffees.controller.ts**

```typescript
// coffees.controller.ts
@Policies(new FrameworkContributorPolicy())
@Post()
create(@Body() createCoffeeDto: CreateCoffeeDto) {
  return this.coffeesService.create(createCoffeeDto);
}
```

Dans cet exemple, seuls les utilisateurs avec un email `@gmail.com` peuvent créer un café.

### ⚙️ Avantages des policies

- ✅ **Flexibilité maximale** : permet d'exprimer des règles complexes (âge minimum, appartenance à un groupe, validation d'un profil, etc.)
- 🧱 **Réutilisabilité** : les policies sont des classes indépendantes pouvant être utilisées sur plusieurs routes
- 🔐 **Séparation claire des responsabilités** : la logique d'autorisation est séparée de la logique métier du contrôleur

---

## 🧠 En résumé

| Approche         | Basée sur                        | Granularité | Exemple de vérification                       |
| ---------------- | -------------------------------- | ----------- | --------------------------------------------- |
| **RBAC**         | Rôles (`admin`, `regular`, etc.) | Moyenne     | `@Roles('admin')`                             |
| **Claims-based** | Permissions (`action:resource`)  | Fine        | `@Permission('coffee:create')`                |
| **Policy-based** | Règles personnalisées (classe)   | Très fine   | `@Policies(new FrameworkContributorPolicy())` |
