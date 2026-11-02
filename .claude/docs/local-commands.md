# Comandi in locale

Tutto si lancia dalla radice del progetto (`rag-ai-chat/`). Stato attuale: SQLite locale, nessun Postgres.

## Prima volta

```sh
pnpm install
```

Crea `.env.local` (non committato, ignorato da git) con queste variabili, copiando i nomi da `.env.example`:

| Variabile | A cosa serve |
|---|---|
| `OPENAI_API_KEY` | embedding (ingestion e domanda dell'utente) |
| `ANTHROPIC_API_KEY` | risposte di Claude |
| `VECTOR_STORE_DRIVER` | `sqlite` (default). `postgres` solo dopo la Fase H |
| `DATABASE_URL` | non serve finché si usa SQLite |

I valori reali vanno **solo** in `.env.local`, mai in `.env.example`.

## Avviare l'app

```sh
pnpm dev
```

- App: <http://localhost:3000>
- Chat: <http://localhost:3000/assistente>
- Si ferma con `Ctrl+C`. Dopo ogni modifica a `.env.local` va **riavviato**, perché Next legge le variabili solo all'avvio.
- Porta 3000 occupata: `lsof -ti :3000` mostra il processo, `lsof -ti :3000 | xargs kill` lo chiude.

Build di produzione in locale: `pnpm build` poi `pnpm start`.

## Database (SQLite, file `knowledge.db`)

Il file sta nella radice ed è ignorato da git.

| Cosa | Comando |
|---|---|
| Creare/aggiornare le tabelle dallo schema | `pnpm db:push` |
| Riempire il DB dai file in `knowledge/` | `pnpm ingest` |
| Interfaccia web per vedere le tabelle | `pnpm db:studio` (si apre su <https://local.drizzle.studio>) |
| Shell SQLite | `sqlite3 knowledge.db` |

Dalla shell SQLite:

```sql
.tables
.schema chunks
SELECT id, category, product, title FROM documents;
SELECT document_id, position, heading, length(content) FROM chunks;
SELECT count(*) FROM chunks;
.quit
```

Una riga sola da terminale: `sqlite3 -header -column knowledge.db "SELECT count(*) FROM chunks"`.

**Ripartire da zero**: cancella `knowledge.db`, poi `pnpm db:push` e `pnpm ingest`.

`pnpm ingest` chiama l'API di embedding a pagamento (circa 30 chunk, frazioni di centesimo) e va rilanciato dopo ogni modifica ai file in `knowledge/`. È sicuro rilanciarlo: sostituisce i chunk di ogni documento e non crea duplicati.

## Verifiche

| Cosa | Comando | Costo |
|---|---|---|
| Test unitari (chiamate LLM mockate) | `pnpm test` (`pnpm test:watch` in modalità watch) | nessuno |
| Tipi | `pnpm exec tsc --noEmit` | nessuno |
| Lint | `pnpm lint` | nessuno |
| Retrieval sul DB reale (5 domande + filtro) | `pnpm check:retrieval` | una chiamata di embedding |

## Ordine tipico

1. `pnpm db:push` (solo se lo schema è cambiato o `knowledge.db` non esiste)
2. `pnpm ingest` (se hai cambiato `knowledge/`)
3. `pnpm dev` e prova la chat con le domande in `.claude/docs/chat-test-questions.md`

## Se qualcosa non va

- **`x-api-key header is required` / `invalid x-api-key`**: la chiave Anthropic manca o è errata in `.env.local`. Salva il file e riavvia `pnpm dev`.
- **`OPENAI_API_KEY is not set`** nello script di ingestion: gli script leggono `.env.local` da soli (`--env-file`); controlla che il file esista nella radice e che la riga sia `NOME=valore` senza virgolette né spazi.
- **`no such table`**: manca `pnpm db:push`.
- **La chat risponde sempre col fallback**: il DB è vuoto (`SELECT count(*) FROM chunks;` deve dare 30) oppure serve `pnpm ingest`.
- **Errore su `better-sqlite3`** dopo un cambio di versione di Node: `pnpm rebuild better-sqlite3`.

## Provare Postgres + pgvector in locale (per la Fase H)

Si può fare tutto in locale prima di toccare Neon. Serve un Postgres con l'estensione `pgvector`, e il modo più semplice è Docker (già installato):

```sh
docker run -d --name rag-pg -p 5433:5432 \
  -e POSTGRES_PASSWORD=changeme -e POSTGRES_DB=rag \
  pgvector/pgvector:pg17

docker exec -it rag-pg psql -U postgres -d rag -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

Poi in `.env.local` (password solo di esempio, il database è locale):

```
VECTOR_STORE_DRIVER=postgres
DATABASE_URL=postgresql://postgres:changeme@localhost:5433/rag
```

(porta 5433 per non scontrarsi con un eventuale Postgres già installato sulla 5432.)

Gestione del container: `docker stop rag-pg`, `docker start rag-pg`, `docker rm -f rag-pg` (cancella anche i dati), shell con `docker exec -it rag-pg psql -U postgres -d rag`.

**Attenzione al driver.** Il piano (H2) prevede `@neondatabase/serverless`, che parla con Neon via HTTP/WebSocket e **non funziona** contro un Postgres locale normale. Per provare in locale serve un driver che parli il protocollo Postgres (`pg`, usato da Drizzle con `drizzle-orm/node-postgres`). L'alternativa è usare `pg` anche su Neon, che funziona su Vercel con la connection string "pooled". La scelta del driver va fatta all'inizio di H2.
