module.exports = {
  apps: [
    {
      name: 'ikayama-ebook-backend',
      script: './backend/server.js',
      cwd: '/var/www/ikayama-ebook',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 5011
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5011
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true
    },
    {
      name: 'ikayama-ebook-payment-gateway',
      script: './pvs_pg/index.js',
      cwd: '/var/www/ikayama-ebook',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'development',
        PORT: 5012
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5012
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
      repo: 'git@github.com:username/ikayama-ebook.git',
      path: '/var/www/ikayama-ebook',
      'pre-deploy-local': '',
      'post-deploy': 'npm install --prefix backend && npm install --prefix pvs_pg && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'mkdir -p /var/www/ikayama_katalog/logs'
    }
  }
};