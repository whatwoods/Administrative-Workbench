# Administrative Workbench - 全栈 Docker 镜像
# 前端 + 后端 + SQLite（无需 MongoDB）

# ====== 阶段1: 构建前端 ======
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ====== 阶段2: 构建后端 ======
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend

COPY backend/package*.json ./

# 安装 better-sqlite3 构建依赖
RUN apk add --no-cache python3 make g++

RUN npm ci

COPY backend/ ./
RUN npm run build

# ====== 阶段3: 生产镜像 ======
FROM node:20-alpine

# 安装 Nginx、Supervisor 和 better-sqlite3 运行依赖
RUN apk add --no-cache nginx supervisor

WORKDIR /app

# 复制后端构建产物和生产依赖
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/package*.json ./backend/
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules

# 复制前端构建产物
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# 创建数据目录
RUN mkdir -p /app/data

# Nginx 配置
RUN mkdir -p /etc/nginx/http.d
COPY <<'EOF' /etc/nginx/http.d/default.conf
server {
    listen 80;
    server_name _;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    location / {
        root /app/frontend/dist;
        try_files $uri $uri/ /index.html;
        
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    location /api {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /socket.io {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    location /health {
        access_log off;
        return 200 "healthy\n";
    }
}
EOF

# Supervisor 配置
COPY <<'EOF' /etc/supervisord.conf
[supervisord]
nodaemon=true
logfile=/dev/null
logfile_maxbytes=0

[program:nginx]
command=nginx -g "daemon off;"
autostart=true
autorestart=true
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0

[program:backend]
command=node /app/backend/dist/index.js
directory=/app/backend
autostart=true
autorestart=true
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0
environment=NODE_ENV=production,PORT=5000,DATABASE_PATH=/app/data/admin-workbench.db
EOF

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget -q --spider http://localhost:80/health || exit 1

EXPOSE 80

# 数据目录挂载点
VOLUME ["/app/data"]

CMD ["supervisord", "-c", "/etc/supervisord.conf"]
