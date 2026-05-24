# PostgreSQL & Supabase Production Hardening & Scalability Guide

This guide details best practices and operational procedures to harden, monitor, scale, and optimize the HireFlow database layer.

---

## 1. Connection Pool Optimization (Supavisor + Prisma)

Prisma Client establishes connection pools on application startup. In a serverless or auto-scaled server environment, connection limits can be quickly exhausted.

### The Connection Routing Strategy
By configuring both `url` and `directUrl` in `schema.prisma`, we split traffic:
- **`DATABASE_URL`**: Routes standard application queries through the Supabase **Supavisor Transaction Pooler** (typically port `6543`). This pooler allows thousands of active client connections to reuse a small set of physical database sessions.
- **`DIRECT_URL`**: Routes DDL changes, migrations (`prisma migrate`), and seed tasks directly to the PostgreSQL instance (session port `5432`). Transaction poolers do not support migration locks.

### Formula for Connection Limit Tuning
To calculate the optimal `connection_limit` parameter inside the connection string:
$$\text{Max DB Connections} \ge (\text{Max Server Instances} \times \text{Connection Limit}) + \text{Reserved Connections}$$

For standard Supabase tiers:
- Ensure the connection limit inside `DATABASE_URL` is explicitly set, e.g.:
  `DATABASE_URL="postgres://user:pass@host:6543/db?pgbouncer=true&connection_limit=10"`
- Always include `pgbouncer=true` when connecting to transactional poolers to let Prisma prepare queries safely.

---

## 2. Backup & Recovery Policy

Ensure a robust disaster recovery plan by combining automated daily snapshots with manual backups.

### Automated Backups
- **Supabase Platform**: Daily logical backups are automatically taken and kept for 7 days (free tier) or up to 30 days.
- **Point-in-Time Recovery (PITR)**: Enables database recovery to any specific second in the past (available on Pro/Enterprise tiers).

### Manual Logical Backups (CLI)
To run a logical backup and export the entire schema and seed records:
```bash
# Dump the schema & data using pg_dump
pg_dump -h <db-host> -U postgres -d hireflow -F c -f hireflow_prod_backup.dump

# To dump as pure SQL file:
pg_dump -h <db-host> -U postgres -d hireflow -f backup.sql
```

### Database Restore Procedure
To restore a logical dump file back to a fresh PostgreSQL instance:
```bash
# Restore logic schema & data from custom format backup
pg_restore -h <db-host> -U postgres -d hireflow -v hireflow_prod_backup.dump

# Restore from flat SQL file
psql -h <db-host> -U postgres -d hireflow -f backup.sql
```

---

## 3. Query Performance & Index Auditing

Slow response times in dashboards are usually caused by index misses leading to full table scans. Use the `EXPLAIN` and `EXPLAIN ANALYZE` commands to audit.

### How to Run an Execution Plan Audit
Run the query prefixed with `EXPLAIN (ANALYZE, BUFFERS)` inside the SQL console:
```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM jobs 
WHERE status = 'active' 
  AND work_mode = 'remote' 
ORDER BY created_at DESC 
LIMIT 10;
```

### Analyzing the Plan
- **`Seq Scan`**: Bad. PostgreSQL is scanning the entire table on disk. Add an index for the filtered columns.
- **`Index Scan` / `Bitmap Index Scan`**: Good. The database is locating records using index pointers.
- Look out for high **Execution time** and make sure you aren't doing sorting operations on non-indexed columns.

---

## 4. Transaction Boundary Scopes

Database integrity requires wrapping operations that update multiple models in atomic database transactions.

### Rules of Thumb for Prisma Transactions
1. **Implicit Transactions (Nested Writes)**:
   Always prefer nested writes over multiple queries. They compile to a single transactional unit:
   ```typescript
   // Atomic: events table entry is guaranteed to be saved with the application
   await prisma.application.create({
     data: {
       jobId: ...,
       candidateId: ...,
       events: {
         create: { status: 'applied', actor: 'candidate' }
       }
     }
   })
   ```
2. **Explicit Transactions (`$transaction`)**:
   Use `$transaction` when performing multiple non-nested database writes or when query results determine subsequent writes:
   ```typescript
   await prisma.$transaction(async (tx) => {
     const user = await tx.user.update(...)
     await tx.candidateProfile.create(...)
   })
   ```
   *Caution*: Keep business logic, network requests, and heavy computation OUTSIDE the `$transaction` block to avoid locking database connections open for too long.

---

## 5. Load Testing & Stress Scenarios

Validate database throughput limits before releasing to production.

### Using Autocannon for HTTP Load Testing
To stress test the read feed (jobs list) and write endpoints (applications):
1. Install `autocannon` globally:
   ```bash
   npm install -g autocannon
   ```
2. Run a 30-second stress run against the jobs feed route:
   ```bash
   autocannon -c 100 -d 30 http://localhost:8000/api/v1/jobs
   ```
3. Monitor database CPU, RAM, and active client connections inside the Supabase dashboard to verify that connection limits are not reached and memory usage remains stable.
