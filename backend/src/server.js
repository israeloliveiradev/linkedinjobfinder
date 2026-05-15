import app from './app.js';
import { validateEnv, config } from './config/env.js';

const start = () => {
  try {
    // Validar configurações críticas antes do boot
    validateEnv();

    app.listen(config.port, () => {
      console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🚀 LinkedIn Job Finder API v4.0
  📡 Status: UP
  🔗 URL: http://localhost:${config.port}
  🌍 Mode: ${config.nodeEnv}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `);
    });
  } catch (error) {
    console.error(`❌ Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

start();
