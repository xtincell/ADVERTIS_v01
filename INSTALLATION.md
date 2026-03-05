# Installation locale d'ADVERTIS

Guide pas-a-pas pour installer et lancer ADVERTIS en local.

## Prerequis

| Outil | Version minimale | Lien |
|-------|-----------------|------|
| **Node.js** | 18+ | https://nodejs.org/ |
| **npm** | 10+ | (inclus avec Node.js) |
| **Docker** ou **Podman** | - | https://docs.docker.com/engine/install/ |
| **Git** | - | https://git-scm.com/ |

> **Windows** : installez d'abord [WSL](https://learn.microsoft.com/fr-fr/windows/wsl/install) puis Docker Desktop.

---

## 1. Cloner le depot

```bash
git clone <URL_DU_DEPOT> advertis
cd advertis
```

## 2. Installer les dependances

```bash
npm install
```

Cela installe toutes les dependances **et** genere automatiquement le client Prisma (`postinstall`).

## 3. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Editez le fichier `.env` et remplissez les valeurs :

### Variables obligatoires

| Variable | Description | Comment l'obtenir |
|----------|-------------|-------------------|
| `AUTH_SECRET` | Secret NextAuth (min. 32 caracteres) | `openssl rand -base64 32` |
| `DATABASE_URL` | URL de connexion PostgreSQL | Voir etape 4 |
| `ANTHROPIC_API_KEY` | Cle API Claude (fonctions IA) | https://console.anthropic.com/ |

### Variables optionnelles

| Variable | Description |
|----------|-------------|
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | OAuth Google (bouton "Continuer avec Google") |
| `UNSPLASH_ACCESS_KEY` | API Unsplash (images) |
| `PEXELS_API_KEY` | API Pexels (images) |
| `PIXABAY_API_KEY` | API Pixabay (images) |
| `PINTEREST_ACCESS_TOKEN` | API Pinterest |
| `ARENA_ACCESS_TOKEN` | API Are.na |

> Les fonctionnalites liees aux cles optionnelles manquantes se desactivent automatiquement (degradation gracieuse).

## 4. Lancer la base de donnees PostgreSQL

Le projet inclut un script qui cree un conteneur PostgreSQL via Docker ou Podman :

```bash
chmod +x start-database.sh
./start-database.sh
```

Le script :
- Detecte automatiquement Docker ou Podman
- Verifie que le port n'est pas deja utilise
- Propose de generer un mot de passe aleatoire si vous utilisez le mot de passe par defaut
- Cree et demarre le conteneur PostgreSQL

**Alternativement**, si vous avez deja un PostgreSQL local, mettez simplement a jour `DATABASE_URL` dans `.env` :

```
DATABASE_URL=postgresql://postgres:VOTRE_MDP@localhost:5432/advertis_dev
```

## 5. Initialiser le schema de la base de donnees

```bash
# Pousser le schema Prisma vers la base
npm run db:push
```

> Pour un environnement de production, preferez `npm run db:migrate` qui utilise les migrations Prisma.

## 6. Lancer le serveur de developpement

```bash
npm run dev
```

L'application est accessible sur **http://localhost:3000**.

---

## Commandes utiles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de developpement (hot reload) |
| `npm run build` | Build de production |
| `npm run start` | Lancer le build de production |
| `npm run preview` | Build + lancement en un seul commande |
| `npm run db:studio` | Interface graphique Prisma Studio |
| `npm run db:push` | Synchroniser le schema avec la base |
| `npm run lint` | Verifier le code (ESLint) |
| `npm run lint:fix` | Corriger automatiquement le linting |
| `npm run format` | Formater le code (Prettier) |
| `npm run typecheck` | Verification TypeScript |
| `npm run test` | Lancer les tests |
| `npm run test:watch` | Tests en mode watch |
| `npm run build:safe` | Typecheck + lint + test + build |
| `npm run clean` | Supprimer le dossier `.next` |

## Depannage

### Le port 5432 est deja utilise
Un autre service PostgreSQL tourne deja. Arretez-le ou changez le port dans `DATABASE_URL`.

### Erreur Prisma "Can't reach database server"
1. Verifiez que le conteneur PostgreSQL tourne : `docker ps`
2. Verifiez que `DATABASE_URL` dans `.env` correspond bien au conteneur

### Erreur "ANTHROPIC_API_KEY is not set"
Les fonctions IA ne marcheront pas sans cle API. Obtenez-en une sur https://console.anthropic.com/ et ajoutez-la dans `.env`.

### `npm run dev` echoue apres un pull
```bash
npm install          # reinstaller les dependances
npm run db:push      # resynchroniser le schema
```
