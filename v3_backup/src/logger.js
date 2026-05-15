/**
 * logger.js — Logger estruturado com chalk
 * Fornece métodos de log com cores e timestamps para a CLI.
 */

import chalk from 'chalk';

// Formata timestamp no formato HH:MM:SS
function timestamp() {
  const now = new Date();
  return [
    now.getHours().toString().padStart(2, '0'),
    now.getMinutes().toString().padStart(2, '0'),
    now.getSeconds().toString().padStart(2, '0'),
  ].join(':');
}

// Lê DEBUG do ambiente (avalia após dotenv.config())
function isDebug() {
  return process.env.DEBUG === 'true';
}

const logger = {
  /** Mensagem informativa — ciano */
  info(msg) {
    console.log(chalk.cyan(`[INFO]  ${timestamp()} ${msg}`));
  },

  /** Aviso — amarelo */
  warn(msg) {
    console.log(chalk.yellow(`[WARN]  ${timestamp()} ${msg}`));
  },

  /** Erro — vermelho */
  error(msg) {
    console.log(chalk.red(`[ERROR] ${timestamp()} ${msg}`));
  },

  /** Debug — cinza (só imprime se DEBUG=true no .env) */
  debug(msg) {
    if (isDebug()) {
      console.log(chalk.gray(`[DEBUG] ${timestamp()} ${msg}`));
    }
  },

  /** Sucesso — verde */
  success(msg) {
    console.log(chalk.green(`[OK]    ${timestamp()} ${msg}`));
  },

  /**
   * Indicador de progresso em batch
   * @param {number} n     - Passo atual
   * @param {number} total - Total de passos
   * @param {string} msg   - Mensagem descritiva
   */
  step(n, total, msg) {
    console.log(chalk.blue(`[${n}/${total}] ${msg}`));
  },
};

export default logger;
