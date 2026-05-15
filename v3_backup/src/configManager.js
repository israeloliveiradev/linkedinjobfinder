/**
 * configManager.js — Gerenciamento do arquivo config.json do usuário
 * Persiste preferências e defaults personalizados entre sessões.
 */

import { readFile, writeFile } from 'fs/promises';
import { DEFAULT_CONFIG } from './constants.js';
import logger from './logger.js';

const CONFIG_FILE = 'config.json';

/**
 * Carrega a configuração do usuário, criando o arquivo se necessário.
 * Faz merge com DEFAULT_CONFIG para garantir novas chaves.
 * @returns {Promise<object>}
 */
export async function loadConfig() {
  try {
    const raw = await readFile(CONFIG_FILE, 'utf-8');
    const saved = JSON.parse(raw);
    // Merge: DEFAULT_CONFIG define base, valores salvos sobrescrevem
    return { ...DEFAULT_CONFIG, ...saved };
  } catch (err) {
    if (err.code === 'ENOENT') {
      // Primeira execução: cria config com defaults
      await saveConfig(DEFAULT_CONFIG);
      logger.debug('Arquivo config.json criado com configurações padrão.');
    }
    return { ...DEFAULT_CONFIG };
  }
}

/**
 * Salva a configuração completa no arquivo config.json.
 * @param {object} config
 * @returns {Promise<void>}
 */
export async function saveConfig(config) {
  try {
    await writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
  } catch (err) {
    logger.error(`Falha ao salvar config.json: ${err.message}`);
  }
}

/**
 * Retorna o valor de uma chave específica da configuração.
 * @param {string} key
 * @returns {Promise<any>}
 */
export async function getConfigValue(key) {
  const config = await loadConfig();
  return config[key];
}

/**
 * Atualiza uma chave específica da configuração e persiste.
 * @param {string} key
 * @param {any} value
 * @returns {Promise<void>}
 */
export async function setConfigValue(key, value) {
  const config = await loadConfig();
  config[key] = value;
  await saveConfig(config);
}
