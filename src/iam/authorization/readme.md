# 🔐 Authorization dans l'application NestJS

Deux types d’approches d’autorisation ont été implémentées dans ce projet :

- ✅ **Role-Based Access Control (RBAC)**
- 🛂 **Claims-Based Authorization**

---

## ✅ Role-Based Access Control (RBAC)

Cette approche repose sur un champ `roles` dans la table `user`, défini comme un **enum** (`admin`, `regular`, etc.).

Chaque route est protégée par des décorateurs (`@Roles`) indiquant le **niveau de rôle requis** pour y accéder.  
Par exemple, certaines routes ne seront accessibles qu’aux utilisateurs ayant le rôle `admin`.

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
- Tandis qu’un superviseur spécifique peut être le **seul autorisé** à :
  - ❌ supprimer des cafés (`coffee:delete`)

➡️ Ce modèle est particulièrement adapté aux systèmes complexes avec des règles d’accès **fines et personnalisées** par utilisateur.

---

### 🧠 En résumé

| Approche         | Basée sur                        | Granularité | Exemple de vérification        |
| ---------------- | -------------------------------- | ----------- | ------------------------------ |
| **RBAC**         | Rôles (`admin`, `regular`, etc.) | Moyenne     | `@Roles('admin')`              |
| **Claims-based** | Permissions (`action:resource`)  | Fine        | `@Permission('coffee:create')` |
