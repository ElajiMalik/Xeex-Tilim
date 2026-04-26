# Xeex‑Tilim Backend — Plan de remédiation sécurité

_Date : 2026-04-26_

Ce document formalise le rapport de corrections fourni pour le backend Xeex‑Tilim (Service National de l’Hygiène — Sénégal), avec un focus exécutable pour le suivi d’implémentation.

## Résumé exécutif

- **Score global**: 68/100 → 76/100 (+8)
- **Critiques traitées**: 3/3
- **Moyennes en attente**: 2
- **Faibles priorités**: 5

## Corrections critiques (appliquées)

1. **Injection SQL** dans `SignalementsService.lister()`
   - Suppression des interpolations SQL directes.
   - Passage à des placeholders paramétrés (`$1..$5`).
   - Pagination et rayon bornés côté backend.
   - DTO renforcé (`rayonMetres`, `limite`).

2. **Validation d’upload de fichiers**
   - Ajout d’une configuration Multer centralisée (`upload-validation.ts`).
   - Contrôle MIME + extension + taille max + nombre max.
   - Validation défensive en service médias (anti-bypass controller).
   - Sanitation des noms de fichier côté backend.

3. **RBAC (contrôle d’accès par rôles)**
   - Introduction de `Role`, décorateur `@Roles()`, `RolesGuard`.
   - Ajout du rôle au payload JWT et à la stratégie JWT.
   - Enregistrement des guards globaux (`JwtAuthGuard` + `RolesGuard`).
   - Matrice de permissions appliquée sur les endpoints sensibles.

## Corrections moyennes (priorité actuelle)

### 1) Centralisation Anthropic provider

- Créer un provider unique `ANTHROPIC_CLIENT`.
- Injecter ce provider dans les services qui consomment Anthropic.
- Supprimer les instanciations locales multiples.

### 2) Suppression des URLs publiques S3

- Retirer l’ACL publique et l’URL publique persistée.
- Stocker uniquement la clé S3.
- Exposer une méthode `genererUrlSignee()` (TTL par défaut 1h).
- Générer les URLs à la demande via endpoint dédié.

## Faibles priorités (backlog)

1. Mise à jour du modèle Anthropic (`claude-sonnet-4-6`).
2. Parsing JSON robuste dans `QualificationIaService`.
3. Limite de tentatives dans la génération de références.
4. Rate limiting (`@nestjs/throttler`) avec politiques court/long terme.
5. Nettoyage e2e avec fixtures dédiées et teardown explicite.

## Plan d’exécution recommandé

1. **Sprint 1**
   - Anthropic provider + refactor DI
   - Pre-signed URLs S3 + endpoint de consultation médias

2. **Sprint 2**
   - Throttling + hardening complémentaire
   - Parsing IA robuste

3. **Sprint 3**
   - Refonte tests e2e et couverture sécurité/rôle

## Critères d’acceptation

- Aucun SQL brut avec interpolation de données utilisateur.
- Aucun upload hors whitelist MIME/extension.
- Tous endpoints sensibles couverts par `@Roles()`.
- Aucune URL média permanente publique en base.
- Tests e2e role-based et upload validation au vert.

## Commandes de vérification (à exécuter dans le backend applicatif)

```bash
npm run lint
npm run test
npm run test:e2e
npx prisma migrate dev --name add_role_utilisateurs
```

## Notes

Ce dépôt contient actuellement principalement de la documentation. Ce plan sert de **trace projet** et de **base de suivi** pour l’implémentation dans le code backend concerné.
