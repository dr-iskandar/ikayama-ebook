#!/bin/bash

# Ikayama Katalog Deployment Script
# Server: 212.85.26.230
# Usage: ./deploy.sh [production|staging]

set -e

ENV=${1:-production}
SERVER_IP="212.85.26.230"
APP_NAME="ikayama_katalog"
APP_PATH="/var/www/$APP_NAME"
GIT_REPO="git@github.com:username/ikayama_katalog.git"  # Update this with actual repo URL

echo "🚀 Starting deployment to $ENV environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if PM2 is installed
check_pm2() {
    if ! command -v pm2 &> /dev/null; then
        print_error "PM2 is not installed. Please install PM2 first:"
        echo "npm install -g pm2"
        exit 1
    fi
}

# Deploy to server
deploy_to_server() {
    print_status "Deploying to server $SERVER_IP..."
    
    # Create deployment directory if it doesn't exist
    ssh root@$SERVER_IP "mkdir -p $APP_PATH/logs"
    
    # Clone or pull latest code
    ssh root@$SERVER_IP "cd $APP_PATH && \
        if [ -d .git ]; then \
            git pull origin main; \
        else \
            git clone $GIT_REPO .; \
        fi"
    
    # Install dependencies
    print_status "Installing dependencies..."
    ssh root@$SERVER_IP "cd $APP_PATH && \
        npm install --prefix backend --production && \
        npm install --prefix pvs_pg --production"
    
    # Copy environment files
    print_status "Setting up environment files..."
    ssh root@$SERVER_IP "cd $APP_PATH && \
        cp backend/.env.production backend/.env && \
        cp pvs_pg/.env.production pvs_pg/.env"
    
    # Start/Restart applications with PM2
    print_status "Starting applications with PM2..."
    ssh root@$SERVER_IP "cd $APP_PATH && \
        pm2 start ecosystem.config.js --env $ENV || \
        pm2 restart ecosystem.config.js --env $ENV"
    
    # Save PM2 configuration
    ssh root@$SERVER_IP "pm2 save"
    
    print_status "✅ Deployment completed successfully!"
    print_status "Application available at: https://ebook.ikayama.com"
    print_status "Backend (internal): http://127.0.0.1:3001"
    print_status "Payment Gateway (internal): http://127.0.0.1:3002"
}

# Setup SSL certificate with Certbot
setup_ssl() {
    print_status "Setting up SSL certificate for ebook.ikayama.com..."
    
    ssh root@$SERVER_IP "certbot --nginx -d ebook.ikayama.com --non-interactive --agree-tos --email admin@ikayama.com"
    
    print_status "SSL certificate setup completed!"
}

# Setup Nginx configuration
setup_nginx() {
    print_status "Setting up Nginx configuration..."
    
    # Copy nginx configuration
    scp nginx.conf root@$SERVER_IP:/etc/nginx/sites-available/ebook.ikayama.com
    
    # Enable site and restart nginx
    ssh root@$SERVER_IP "ln -sf /etc/nginx/sites-available/ebook.ikayama.com /etc/nginx/sites-enabled/ && \
        nginx -t && \
        systemctl reload nginx"
    
    print_status "Nginx configuration completed!"
}

# Setup server (first time only)
setup_server() {
    print_status "Setting up server for first deployment..."
    
    ssh root@$SERVER_IP "apt update && \
        apt install -y nodejs npm git nginx certbot python3-certbot-nginx && \
        npm install -g pm2 && \
        pm2 startup && \
        mkdir -p $APP_PATH && \
        systemctl enable nginx && \
        systemctl start nginx"
    
    # Setup Nginx configuration
    setup_nginx
    
    # Setup SSL certificate
    setup_ssl
    
    print_status "Server setup completed!"
}

# Main deployment process
main() {
    check_pm2
    
    case "$1" in
        "setup")
            setup_server
            ;;
        "production"|"staging"|"")
            deploy_to_server
            ;;
        "status")
            ssh root@$SERVER_IP "pm2 status"
            ;;
        "logs")
            ssh root@$SERVER_IP "pm2 logs"
            ;;
        "stop")
            ssh root@$SERVER_IP "pm2 stop all"
            ;;
        "restart")
            ssh root@$SERVER_IP "pm2 restart all"
            ;;
        "ssl-renew")
            ssh root@$SERVER_IP "certbot renew --nginx"
            ;;
        *)
            echo "Usage: $0 [setup|production|staging|status|logs|stop|restart|ssl-renew]"
            echo ""
            echo "Commands:"
            echo "  setup      - Setup server for first deployment (includes Nginx & SSL)"
            echo "  production - Deploy to production environment"
            echo "  staging    - Deploy to staging environment"
            echo "  status     - Show PM2 status"
            echo "  logs       - Show PM2 logs"
            echo "  stop       - Stop all applications"
            echo "  restart    - Restart all applications"
            echo "  ssl-renew  - Renew SSL certificate"
            exit 1
            ;;
    esac
}

main "$@"