# Frontend Angular - Dockerfile

# Stage 1: Build
FROM node:20-alpine as builder

WORKDIR /app

# Installer les dépendances de build nécessaires pour les modules natifs
RUN apk add --no-cache python3 make g++

# Copier package files
COPY package*.json ./

# Installer dépendances avec cache optimisé
RUN npm install --legacy-peer-deps --prefer-offline --no-audit

# Copier code source
COPY . .

# Build Angular
RUN npm run build -- --configuration=production

# Stage 2: Runtime
FROM nginx:alpine

# Copier config nginx
RUN echo 'server {' > /etc/nginx/conf.d/default.conf && \
    echo '    listen 4200;' >> /etc/nginx/conf.d/default.conf && \
    echo '    root /usr/share/nginx/html;' >> /etc/nginx/conf.d/default.conf && \
    echo '    index index.html index.htm;' >> /etc/nginx/conf.d/default.conf && \
    echo '' >> /etc/nginx/conf.d/default.conf && \
    echo '    # Proxy API calls to backend' >> /etc/nginx/conf.d/default.conf && \
    echo '    location /api/ {' >> /etc/nginx/conf.d/default.conf && \
    echo '        proxy_pass http://backend:8080/api/;' >> /etc/nginx/conf.d/default.conf && \
    echo '        proxy_http_version 1.1;' >> /etc/nginx/conf.d/default.conf && \
    echo '        proxy_set_header Upgrade $http_upgrade;' >> /etc/nginx/conf.d/default.conf && \
    echo '        proxy_set_header Connection "upgrade";' >> /etc/nginx/conf.d/default.conf && \
    echo '        proxy_set_header Host $host;' >> /etc/nginx/conf.d/default.conf && \
    echo '        proxy_set_header X-Real-IP $remote_addr;' >> /etc/nginx/conf.d/default.conf && \
    echo '        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;' >> /etc/nginx/conf.d/default.conf && \
    echo '        proxy_set_header X-Forwarded-Proto $scheme;' >> /etc/nginx/conf.d/default.conf && \
    echo '    }' >> /etc/nginx/conf.d/default.conf && \
    echo '' >> /etc/nginx/conf.d/default.conf && \
    echo '    # Angular routing' >> /etc/nginx/conf.d/default.conf && \
    echo '    location / {' >> /etc/nginx/conf.d/default.conf && \
    echo '        try_files $uri $uri/ /index.html;' >> /etc/nginx/conf.d/default.conf && \
    echo '    }' >> /etc/nginx/conf.d/default.conf && \
    echo '}' >> /etc/nginx/conf.d/default.conf

# Copier app build depuis stage précédent
COPY --from=builder /app/dist/stock-management-frontend /usr/share/nginx/html

EXPOSE 4200

CMD ["nginx", "-g", "daemon off;"]
