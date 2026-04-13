# Troubleshooting Guide - Stock Management System

Complete guide to resolving common issues with actual error messages and solutions.

---

## Common Issues & Solutions

### 1. Database Connection Errors

#### Issue: `Access denied for user 'postgres'`

**Error Message:**
```
org.postgresql.util.PSQLException: Connection to localhost:5432 refused.
Check that the hostname and port are correct and that the post master is accepting TCP/IP connections.
```

**Solution:**
```bash
# 1. Verify PostgreSQL is running
docker ps | grep postgres

# 2. If not running, start it
docker-compose -f docker-compose.dev.yml up -d postgres

# 3. Check credentials in application.properties
cat backend/src/main/resources/application.properties | grep datasource

# 4. Verify from command line
psql -h localhost -U postgres -d stock_db
# Enter password: postgres
```

**application.properties verification:**
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/stock_db
spring.datasource.username=postgres
spring.datasource.password=postgres
spring.datasource.driver-class-name=org.postgresql.Driver
```

---

#### Issue: `FATAL: database "stock_db" does not exist`

**Error Message:**
```
Caused by: org.postgresql.util.PSQLException: ERROR: database "stock_db" does not exist
```

**Solution:**
```bash
# Create the database
docker exec stock_management_postgres psql -U postgres -c "CREATE DATABASE stock_db;"

# Or use SQL directly
psql -h localhost -U postgres
# Inside psql:
> CREATE DATABASE stock_db;
> \l  (list databases)
```

---

### 2. Spring Boot Startup Issues

#### Issue: `Port 8080 already in use`

**Error Message:**
```
Caused by: java.net.BindException: Address already in use
```

**Solution:**
```bash
# 1. Find process using port 8080
lsof -i :8080

# 2. Kill the process
kill -9 <PID>

# OR use a different port
mvn spring-boot:run -Dspring-boot.run.arguments=--server.port=8081
```

**Or modify application.properties:**
```properties
server.port=8081
```

---

#### Issue: `Hibernate: cannot find table`

**Error Message:**
```
Caused by: org.hibernate.exc.SQLGrammarException: could not prepare statement
SQLState: 42P01
ERROR: relation "product" does not exist
```

**Solution:**
```bash
# 1. Verify ddl-auto setting
cat backend/src/main/resources/application.properties | grep "ddl-auto"

# 2. Should be set to 'create' or 'update':
spring.jpa.hibernate.ddl-auto=create

# 3. Restart application - Hibernate will recreate tables
mvn spring-boot:run
```

**Check if tables were created:**
```bash
docker exec stock_management_postgres psql -U postgres -d stock_db -c "\dt"
```

---

### 3. Data Loading Issues

#### Issue: `No data loaded after startup`

**Error Message:**
```
GET /api/products returns empty array []
```

**Solution:**
```bash
# 1. Check if data.sql was executed
docker-compose logs backend | grep -i "sql\|loading\|data"

# 2. Verify data.sql exists
ls -la backend/src/main/resources/data.sql

# 3. Check application.properties for data initialization
grep "sql.init" backend/src/main/resources/application.properties

# Should have:
spring.jpa.defer-datasource-initialization=true
spring.sql.init.mode=always

# 4. Manually insert test data
docker exec stock_management_postgres psql -U postgres -d stock_db < backend/src/main/resources/data.sql

# 5. Verify data was loaded
curl http://localhost:8080/api/products | jq '.[0]'
```

---

#### Issue: `Duplicate key value violates unique constraint`

**Error Message:**
```
Caused by: org.postgresql.util.PSQLException: ERROR: duplicate key value violates unique constraint "products_pkey"
```

**Solution:**
```bash
# 1. Clear all data (caution: deletes everything)
docker exec stock_management_postgres psql -U postgres -d stock_db << EOF
TRUNCATE TABLE bill_product CASCADE;
TRUNCATE TABLE bill CASCADE;
TRUNCATE TABLE stock_mouvement CASCADE;
TRUNCATE TABLE sale CASCADE;
TRUNCATE TABLE purchase CASCADE;
TRUNCATE TABLE product CASCADE;
TRUNCATE TABLE supplier CASCADE;
TRUNCATE TABLE customer CASCADE;
EOF

# 2. Restart backend to reload data.sql
mvn spring-boot:run

# 3. Verify data is present
curl http://localhost:8080/api/products
```

---

### 4. API Endpoint Issues

#### Issue: 404 Not Found on `/api/products`

**Error Message:**
```
HTTP 404
{
  "error": "Not Found",
  "path": "/api/products"
}
```

**Solution:**
```bash
# 1. Check if server is running
curl http://localhost:8080/swagger-ui.html

# 2. Verify context path in application.properties
grep "context-path" backend/src/main/resources/application.properties
# Should show:
server.servlet.context-path=/api

# 3. Try correct endpoint
curl http://localhost:8080/api/products

# 4. Check if controllers are registered
curl http://localhost:8080/swagger-ui.html
# Look for ProductController in Swagger
```

---

#### Issue: 400 Bad Request when creating purchase

**Error Message:**
```json
{
  "error": "Erreur lors de la création de l'achat : Produit non trouvé"
}
```

**Solution:**
```bash
# 1. Verify product exists
curl http://localhost:8080/api/products/1

# 2. Verify supplier exists
curl http://localhost:8080/api/suppliers/1

# 3. Check request body format
curl -X POST http://localhost:8080/api/purchases \
  -H "Content-Type: application/json" \
  -d '{
    "datePurchase": "2024-01-15T10:30:00",
    "supplierId": 1,
    "productId": 1,
    "invoiceNumber": "BL-001",
    "quantity": 50,
    "unitPriceTTC": 10.5
  }'

# 4. Check date format (should be ISO 8601)
# ✅ Correct: "2024-01-15T10:30:00"
# ❌ Wrong: "01/15/2024" or "2024-01-15"
```

---

#### Issue: 400 Bad Request when creating sale - insufficient stock

**Error Message:**
```json
{
  "error": "Erreur lors de la création de la vente : Quantité insuffisante en stock. Stock disponible : 50, Quantité demandée : 100"
}
```

**Solution:**
```bash
# 1. Check current stock
curl http://localhost:8080/api/products/1/stock

# 2. Create purchase to increase stock
curl -X POST http://localhost:8080/api/purchases \
  -H "Content-Type: application/json" \
  -d '{
    "datePurchase": "2024-01-15T10:30:00",
    "supplierId": 1,
    "productId": 1,
    "invoiceNumber": "BL-001",
    "quantity": 100,
    "unitPriceTTC": 10.5
  }'

# 3. Verify new stock
curl http://localhost:8080/api/products/1/stock

# 4. Now create sale with valid quantity
curl -X POST http://localhost:8080/api/sales \
  -H "Content-Type: application/json" \
  -d '{
    "dateSale": "2024-01-16T14:30:00",
    "productId": 1,
    "quantitySold": 50,
    "unitSalePrice": 15.0
  }'
```

---

### 5. Docker Issues

#### Issue: `docker-compose: command not found`

**Solution:**
```bash
# Install Docker Compose if not present
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
docker-compose --version
```

---

#### Issue: `Cannot connect to Docker daemon`

**Solution:**
```bash
# On Mac/Windows, ensure Docker Desktop is running

# On Linux, ensure Docker service is started
sudo systemctl start docker
sudo systemctl enable docker

# Verify Docker is running
docker ps
```

---

#### Issue: `Volumes not persisting data`

**Solution:**
```bash
# Check if volume exists
docker volume ls | grep stock_management

# Remove old containers and volumes (warning: deletes data)
docker-compose down -v

# Restart fresh
docker-compose up -d

# Verify volume was created
docker volume ls
```

---

### 6. Frontend Issues

#### Issue: `Cannot GET /` on localhost:4200

**Solution:**
```bash
# 1. Ensure npm dependencies are installed
cd frontend
npm install

# 2. Start dev server
npm start

# 3. Should open browser at http://localhost:4200 automatically

# 4. Check if port 4200 is already in use
lsof -i :4200

# 5. Use different port if needed
ng serve --port 4201
```

---

#### Issue: `Failed to fetch from /api/products`

**Error in browser console:**
```
Failed to fetch: http://localhost:4200/api/products
CORS error or network error
```

**Solution:**
```bash
# 1. Verify backend is running
curl http://localhost:8080/api/products

# 2. Check proxy configuration in frontend
cat frontend/proxy.conf.json

# Should have:
{
  "/api": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true
  }
}

# 3. Restart frontend dev server
# Stop: Ctrl+C
# Start: npm start

# 4. Verify CORS headers from backend
curl -I http://localhost:8080/api/products
```

---

### 7. Git & Version Control Issues

#### Issue: `git do not ignore exercises/ directory`

**Solution:**
```bash
# 1. Add to .gitignore
echo "exercises/" >> .gitignore

# 2. Remove from git cache
git rm -r --cached exercises/

# 3. Commit changes
git commit -m "Remove exercises/ from git tracking"

# 4. Verify it's ignored
git status exercises/  # Should show "nothing to commit"
```

---

### 8. Performance Issues

#### Issue: `Slow API responses`

**Diagnosis:**
```bash
# 1. Check database performance
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:8080/api/products

# 2. Check slow query logs
docker exec stock_management_postgres psql -U postgres -d stock_db -c "SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 5;"

# 3. Check Spring Boot metrics
curl http://localhost:8080/actuator/metrics | jq '.names[] | select(contains("http"))'
```

**Solution:**
```bash
# 1. Enable query logging
# In application.properties:
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
logging.level.org.hibernate.SQL=DEBUG

# 2. Add database indices
docker exec stock_management_postgres psql -U postgres -d stock_db << EOF
CREATE INDEX idx_product_supplier ON product(supplier_id);
CREATE INDEX idx_purchase_product ON purchase(product_id);
CREATE INDEX idx_sale_product ON sale(product_id);
EOF

# 3. Enable query caching
# In application.properties:
spring.jpa.properties.hibernate.cache.use_second_level_cache=true
```

---

## Debugging Checklist

```
Before reporting an issue:

☐ PostgreSQL is running
  docker ps | grep postgres

☐ Backend is running
  curl http://localhost:8080/swagger-ui.html

☐ Frontend is running
  curl http://localhost:4200

☐ Data is loaded
  curl http://localhost:8080/api/products | jq '.' | wc -l

☐ Latest code is deployed
  git log --oneline -1

☐ Dependencies are up-to-date
  mvn clean install

☐ Ports are not in use
  lsof -i :8080
  lsof -i :4200
  lsof -i :5432

☐ No stale Docker containers
  docker-compose ps

☐ Logs are checked
  docker-compose logs backend | tail -100
```

---

## Quick Recovery Steps

### Complete Reset

```bash
# 1. Stop everything
docker-compose down -v

# 2. Clean Maven cache
cd backend
mvn clean

# 3. Restart everything
cd ..
docker-compose up -d

# 4. Wait 30 seconds for database to initialize

# 5. Restart backend
cd backend
mvn spring-boot:run

# 6. In new terminal, restart frontend
cd frontend
npm install
npm start
```

---

**Document Version**: 1.0.0  
**Last Updated**: April 13, 2026  
**Covers**: Spring Boot 3.3.3, PostgreSQL 15, Angular 17, Docker Compose

