# Stage 1: Build React app
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Pass the backend URL during build time
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Add nginx config for React Router
RUN printf "server { \n \
    listen 80; \n \
    location / { \n \
        root /usr/share/nginx/html; \n \
        index index.html index.htm; \n \
        try_files \$uri \$uri/ /index.html; \n \
    } \n \
}" > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
