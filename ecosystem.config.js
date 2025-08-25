module.exports = {
  apps: [
    {
      name: 'ikayama-backend',
      script: './backend/server.js',
      cwd: '/var/www/ikayama_katalog',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 3001
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
        DB_HOST: 'localhost',
        DB_PORT: 5432,
        DB_NAME: 'ikayama_db_prod',
        DB_USER: 'ikayama_user',
        DB_PASSWORD: 'secure_password_here',
        JWT_SECRET: 'production_jwt_secret_very_secure',
        JWT_EXPIRES_IN: '24h',
        EMAIL_SERVICE: 'gmail',
        EMAIL_USER: 'noreply@ikayama.com',
        EMAIL_PASS: 'production_email_password',
        EMAIL_FROM: 'noreply@ikayama.com',
        BASE_URL: 'https://ebook.ikayama.com'
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true
    },
    {
      name: 'ikayama-payment-gateway',
      script: './pvs_pg/index.js',
      cwd: '/var/www/ikayama_katalog',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'development',
        PORT: 3002
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      error_file: './logs/payment-error.log',
      out_file: './logs/payment-out.log',
      log_file: './logs/payment-combined.log',
      time: true
    }
  ],

  deploy: {
    production: {
      user: 'root',
      host: '212.85.26.230',
      ref: 'origin/main',
      repo: 'git@github.com:username/ikayama_katalog.git',
      path: '/var/www/ikayama_katalog',
      'pre-deploy-local': '',
      'post-deploy': 'npm install --prefix backend && npm install --prefix pvs_pg && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'mkdir -p /var/www/ikayama_katalog/logs'
    }
  }
};