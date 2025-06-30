# Dockerfile
FROM nginx:alpine

# Copy all the static files into Nginx’s document root
COPY . /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]

