/**
 * presetManager.js — Gerenciamento de buscas favoritas (presets)
 * Permite salvar, listar, executar e deletar buscas com nome.
 */

import { readFile, writeFile } from 'fs/promises';
import { generateId } from './utils.js';
import { loadConfig } from './configManager.js';
import logger from './logger.js';

const PRESETS_FILE = 'data/presets.json';

/**
 * Carrega os presets do disco.
 * Retorna array vazio em qualquer falha.
 * @returns {Promise<Array>}
 */
export async function loadPresets() {
  try {
    const raw = await readFile(PRESETS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (_) {
    return [];
  }
}

/**
 * Salva os presets no disco.
 * @param {Array} presets
 * @returns {Promise<void>}
 */
async function persistPresets(presets) {
  await writeFile(PRESETS_FILE, JSON.stringify(presets, null, 2), 'utf-8');
}

/**
 * Salva uma busca como preset nomeado.
 *
 * @param {string}   name   - Nome do preset (máx 50 chars)
 * @param {object}   params - Parâmetros da busca a salvar
 * @param {Function} askFn  - Função async de leitura de input
 * @returns {Promise<boolean>} true se salvo com sucesso
 */
export async function savePreset(name, params, askFn) {
  // Validação do nome
  if (!name || !name.trim()) {
    logger.error('O nome do preset não pode ser vazio.');
    return false;
  }
  name = name.trim().slice(0, 50);

  const config = await loadConfig();
  const presets = await loadPresets();

  // Verifica preset com mesmo nome
  const existingIdx = presets.findIndex(
    (p) => p.name.toLowerCase() === name.toLowerCase()
  );

  if (existingIdx >= 0) {
    const answer = await askFn(
      `Preset "${name}" já existe. Sobrescrever? (s/n): `
    );
    if (answer.trim().toLowerCase() !== 's') {
      logger.warn('Operação cancelada. Preset não foi salvo.');
      return false;
    }
    // Remove o existente para substituir
    presets.splice(existingIdx, 1);
  }

  const newPreset = {
    id: generateId(),
    name,
    params,
    createdAt: new Date().toISOString(),
    usageCount: 0,
  };

  presets.unshift(newPreset);

  // Limita ao máximo configurado
  const maxPresets = config.maxPresets || 50;
  if (presets.length > maxPresets) {
    presets.splice(maxPresets);
  }

  try {
    await persistPresets(presets);
    return true;
  } catch (err) {
    logger.error(`Falha ao salvar preset: ${err.message}`);
    return false;
  }
}

/**
 * Busca um preset por nome (case-insensitive) ou índice numérico.
 * Incrementa usageCount ao encontrar.
 *
 * @param {string|number} nameOrIndex
 * @returns {Promise<object|null>}
 */
export async function getPreset(nameOrIndex) {
  const presets = await loadPresets();
  if (!presets.length) return null;

  let preset = null;

  // Tenta por índice numérico (1-based)
  const idx = parseInt(nameOrIndex);
  if (!isNaN(idx) && idx >= 1 && idx <= presets.length) {
    preset = presets[idx - 1];
  } else {
    // Tenta por nome (case-insensitive)
    const name = String(nameOrIndex).toLowerCase().trim();
    preset = presets.find((p) => p.name.toLowerCase() === name) || null;
  }

  if (preset) {
    // Incrementa usageCount de forma assíncrona
    preset.usageCount = (preset.usageCount || 0) + 1;
    persistPresets(presets).catch(logger.error);
  }

  return preset;
}

/**
 * Retorna todos os presets com índice (1-based).
 * @returns {Promise<Array>}
 */
export async function listPresets() {
  const presets = await loadPresets();
  return presets.map((p, i) => ({ index: i + 1, ...p }));
}

/**
 * Remove um preset por nome ou índice.
 * @param {string|number} nameOrIndex
 * @returns {Promise<boolean>}
 */
export async function deletePreset(nameOrIndex) {
  const presets = await loadPresets();

  let targetIdx = -1;
  const numIdx = parseInt(nameOrIndex);

  if (!isNaN(numIdx) && numIdx >= 1 && numIdx <= presets.length) {
    targetIdx = numIdx - 1;
  } else {
    const name = String(nameOrIndex).toLowerCase().trim();
    targetIdx = presets.findIndex((p) => p.name.toLowerCase() === name);
  }

  if (targetIdx === -1) return false;

  presets.splice(targetIdx, 1);

  try {
    await persistPresets(presets);
    return true;
  } catch (err) {
    logger.error(`Falha ao deletar preset: ${err.message}`);
    return false;
  }
}
