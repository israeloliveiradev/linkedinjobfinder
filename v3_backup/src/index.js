/**
 * index.js — Entry point / CLI principal do LinkedIn Job Finder v3
 * Loop interativo com suporte a busca com IA, presets, batch e exportação.
 */

import 'dotenv/config';
import readline from 'readline';
import chalk from 'chalk';

import logger from './logger.js';
import { ensureDataDirs } from './historyManager.js';
import { loadConfig, saveConfig } from './configManager.js';
import { parseJobSearchIntent } from './llmParser.js';
import { expandKeywords, promptUserForExpansion } from './keywordExpander.js';
import { buildLinkedInUrl } from './linkedinUrlBuilder.js';
import { saveToHistory, getHistory, searchHistory, clearHistory } from './historyManager.js';
import { savePreset, getPreset, listPresets, deletePreset } from './presetManager.js';
import { processBatch } from './batchProcessor.js';
import { exportToTxt, exportToMarkdown, exportHistory } from './exporter.js';
import { openInBrowser, truncate, formatDate } from './utils.js';

// ─── Verificação de API key ───────────────────────────────────────────────────
if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'sua_chave_aqui') {
  console.log('');
  console.log(chalk.red('╔══════════════════════════════════════════════════════╗'));
  console.log(chalk.red('║  ❌  GROQ_API_KEY não configurada!                   ║'));
  console.log(chalk.red('╠══════════════════════════════════════════════════════╣'));
  console.log(chalk.red('║                                                      ║'));
  console.log(chalk.yellow('║  1. Acesse: https://console.groq.com                 ║'));
  console.log(chalk.yellow('║  2. Crie uma conta gratuita                          ║'));
  console.log(chalk.yellow('║  3. Gere uma API key                                 ║'));
  console.log(chalk.yellow('║  4. Edite o arquivo .env na raiz do projeto          ║'));
  console.log(chalk.yellow('║  5. Substitua "sua_chave_aqui" pela sua chave        ║'));
  console.log(chalk.red('║                                                      ║'));
  console.log(chalk.red('╚══════════════════════════════════════════════════════╝'));
  console.log('');
  process.exit(1);
}

// ─── Estado da sessão ─────────────────────────────────────────────────────────
let sessionResults = [];   // Resultados da sessão atual
let sessionSearches = 0;   // Contador de buscas
let sessionPresets = 0;    // Presets salvos nesta sessão
let lastSearch = null;     // Última busca (params + result)
let userConfig = {};

// ─── Interface de readline ────────────────────────────────────────────────────
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * Lê uma linha do terminal com prompt colorido.
 * @param {string} prompt
 * @returns {Promise<string>}
 */
function askQuestion(prompt) {
  return new Promise((resolve) => {
    rl.question(chalk.white(prompt), (answer) => {
      resolve(answer || '');
    });
  });
}

/**
 * Lê uma linha simples (sem prompt colorido especial).
 * @param {string} prompt
 * @returns {Promise<string>}
 */
async function ask(prompt) {
  return askQuestion(prompt);
}

// ─── Banner ───────────────────────────────────────────────────────────────────
function printBanner() {
  console.log('');
  console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(chalk.bold.white('  🔗  LinkedIn Job Finder  ') + chalk.bold.cyan('v3.0') + chalk.gray('   |   Powered by Groq LLM'));
  console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(chalk.yellow('  💡 Digite "ajuda" para ver todos os comandos disponíveis'));
  console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log('');
}

// ─── Help ─────────────────────────────────────────────────────────────────────
function printHelp() {
  const sep = chalk.cyan('═══════════════════════════════════════════════════════════');
  const title = chalk.bold.white;
  const cmd = chalk.bold.yellow;
  const desc = chalk.gray;
  const ex = chalk.green;

  console.log('');
  console.log(sep);
  console.log(chalk.bold.white('                    COMANDOS DISPONÍVEIS                  '));
  console.log(sep);
  console.log('');
  console.log(title('🔍 BUSCA'));
  console.log(`  ${cmd('[texto livre]')}               ${desc('Executa busca com IA')}`);
  console.log('');
  console.log(title('⚡ EXEMPLOS DE BUSCA:'));
  console.log(`  ${ex('vagas de dev React júnior remoto nas últimas 6h')}`);
  console.log(`  ${ex('engenheiro dados sênior CLT São Paulo easy apply hoje')}`);
  console.log(`  ${ex('product manager híbrido pleno Nubank 3 dias')}`);
  console.log(`  ${ex('analista financeiro PJ Curitiba pouco concorrido essa semana')}`);
  console.log(`  ${ex('UX designer freelance últimas 2h easy apply menos candidatos')}`);
  console.log(`  ${ex('"React OR Vue OR Angular" developer remoto 24h')}`);
  console.log('');
  console.log(title('📦 BATCH (múltiplas buscas)'));
  console.log(`  ${cmd('batch')}                       ${desc('Modo batch — várias buscas de uma vez')}`);
  console.log('');
  console.log(title('💾 PRESETS (buscas favoritas)'));
  console.log(`  ${cmd('preset salvar / ps')}          ${desc('Salva última busca como preset')}`);
  console.log(`  ${cmd('preset listar / pl')}          ${desc('Lista presets salvos')}`);
  console.log(`  ${cmd('preset usar [n] / pu [n]')}    ${desc('Executa preset por nome ou número')}`);
  console.log(`  ${cmd('preset deletar [n] / pd [n]')} ${desc('Remove preset')}`);
  console.log('');
  console.log(title('📋 HISTÓRICO'));
  console.log(`  ${cmd('historico / h')}               ${desc('Últimas 10 buscas')}`);
  console.log(`  ${cmd('historico buscar [t] / hb')}   ${desc('Busca no histórico')}`);
  console.log(`  ${cmd('historico exportar / he')}     ${desc('Exporta histórico (.md)')}`);
  console.log(`  ${cmd('limpar historico')}            ${desc('Apaga todo o histórico')}`);
  console.log('');
  console.log(title('📤 EXPORTAÇÃO (resultados da sessão atual)'));
  console.log(`  ${cmd('exportar txt / et')}           ${desc('Exporta para .txt')}`);
  console.log(`  ${cmd('exportar md / em')}            ${desc('Exporta para .markdown')}`);
  console.log('');
  console.log(title('⚙️  CONFIGURAÇÃO'));
  console.log(`  ${cmd('config')}                      ${desc('Ver configuração atual')}`);
  console.log(`  ${cmd('config [chave] [valor]')}      ${desc('Alterar configuração')}`);
  console.log('');
  console.log(chalk.gray('  Chaves disponíveis:'));
  console.log(`  ${chalk.bold.white('defaultLocation')}     ${desc('(padrão: brasil)')}`);
  console.log(`  ${chalk.bold.white('defaultPeriod')}       ${desc('(padrão: 24h)')}`);
  console.log(`  ${chalk.bold.white('autoOpenBrowser')}     ${desc('(padrão: false)')}`);
  console.log(`  ${chalk.bold.white('expandKeywords')}      ${desc('(padrão: true)')}`);
  console.log('');
  console.log(title('❓ OUTROS'));
  console.log(`  ${cmd('ajuda / ?')}                   ${desc('Este menu')}`);
  console.log(`  ${cmd('sair / exit / q')}             ${desc('Encerrar')}`);
  console.log('');
  console.log(sep);
  console.log('');
}

// ─── Exibição de resultado ────────────────────────────────────────────────────
function printResult(result) {
  const meta = result.meta || {};
  const sep = chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Mapeamentos amigáveis para exibição
  const jobTypeLabels = { F: 'CLT', P: 'Part-time', C: 'PJ/Freelance', T: 'Temporário', V: 'Voluntário', I: 'Estágio', O: 'Outro' };
  const expLabels = { '1': 'Estágio', '2': 'Júnior', '3': 'Pleno', '4': 'Sênior', '5': 'Diretor', '6': 'Executivo' };
  const workModeLabels = { '1': 'Presencial', '2': 'Remoto', '3': 'Híbrido' };
  const sortLabel = meta.sortBy === 'DD' ? 'Mais recentes' : 'Relevância';

  console.log('');
  console.log(sep);
  console.log(chalk.bold.white('🎯 RESULTADO'));
  console.log(sep);

  // Keywords
  const boolTag = meta.hasBooleanSearch ? chalk.gray(' (boolean: sim)') : chalk.gray(' (boolean: não)');
  console.log(`📌 ${chalk.bold('Keywords')}       : ${chalk.bold.white(meta.keywords)}${boolTag}`);

  // Localização
  console.log(`📍 ${chalk.bold('Localização')}    : ${meta.location}${meta.geoId ? chalk.gray(` (geoId: ${meta.geoId})`) : ''}`);

  // Período
  console.log(`⏱️  ${chalk.bold('Período')}        : ${meta.period} ${chalk.gray(`(${meta.seconds}s)`)}`);

  // Ordenação
  console.log(`📊 ${chalk.bold('Ordenação')}      : ${sortLabel}`);

  // Filtros condicionais
  if (meta.jobType && meta.jobType.length > 0) {
    const types = meta.jobType.map((c) => jobTypeLabels[c] || c).join(' / ');
    console.log(`💼 ${chalk.bold('Tipo de vaga')}   : ${types}`);
  }
  if (meta.experienceLevel && meta.experienceLevel.length > 0) {
    const levels = meta.experienceLevel.map((c) => expLabels[c] || c).join(' / ');
    console.log(`🎓 ${chalk.bold('Nível')}          : ${levels}`);
  }
  if (meta.workMode && meta.workMode.length > 0) {
    const modes = meta.workMode.map((c) => workModeLabels[c] || c).join(' / ');
    console.log(`🏠 ${chalk.bold('Modalidade')}     : ${modes}`);
  }
  if (meta.easyApply) {
    console.log(`⚡ ${chalk.bold('Easy Apply')}     : ${chalk.green('Ativado')}`);
  }
  if (meta.lowApplicants) {
    console.log(`🎯 ${chalk.bold('Baixa concorr.')} : ${chalk.green('Ativado')} ${chalk.gray('(< 10 candidatos)')}`);
  }
  if (meta.company) {
    console.log(`🏢 ${chalk.bold('Empresa')}        : ${meta.company}`);
  }
  if (meta.hasBooleanSearch) {
    console.log(`🔍 ${chalk.bold('Boolean Search')} : ${chalk.green('Ativado')}`);
  }
  if (meta.filtersApplied > 0) {
    console.log(`📈 ${chalk.bold('Filtros extras')} : ${chalk.bold.cyan(meta.filtersApplied)} filtro(s) aplicado(s)`);
  }

  console.log(sep);
  console.log('');
  console.log(`🔗 ${chalk.bold('URL COMPLETA:')}`);
  console.log(`   ${chalk.bold.blueBright.underline(result.url)}`);
  console.log('');
  console.log(`⚡ ${chalk.bold('URL EXPRESS:')}`);
  console.log(`   ${chalk.gray(result.urlExpress)}`);

  if (result.warnings && result.warnings.length > 0) {
    console.log('');
    console.log(`⚠️  ${chalk.yellow('AVISOS:')} ${result.warnings.map((w) => chalk.yellow(w)).join(' | ')}`);
  }

  console.log(sep);
  console.log('');
}

// ─── Histórico formatado ──────────────────────────────────────────────────────
function printHistory(items) {
  if (!items || items.length === 0) {
    console.log(chalk.yellow('  Histórico vazio. Faça sua primeira busca!'));
    return;
  }

  console.log('');
  console.log(chalk.bold.white('📋 HISTÓRICO DE BUSCAS'));
  console.log(chalk.cyan('─────────────────────────────────────────────────────────'));

  items.forEach((item, i) => {
    const meta = item.meta || {};
    const date = formatDate(item.createdAt || new Date(item.timestamp).toISOString());
    const filters = meta.filtersApplied || 0;

    console.log(`${chalk.bold.white(i + 1 + '.')} ${chalk.bold(meta.keywords || '?')} — ${chalk.gray(date)}`);
    console.log(`   📍 ${meta.location || '?'} | ⏱️ ${meta.period || '?'} | 📈 ${filters} filtro(s)`);
    console.log(`   ${chalk.gray(truncate(item.url, 80))}`);
    console.log('');
  });
}

// ─── Exibição de presets ──────────────────────────────────────────────────────
function printPresets(presets) {
  if (!presets || presets.length === 0) {
    console.log(chalk.yellow('  Nenhum preset salvo. Use "ps" após uma busca para salvar.'));
    return;
  }

  console.log('');
  console.log(chalk.bold.white('💾 PRESETS SALVOS'));
  console.log(chalk.cyan('─────────────────────────────────────────────────────────'));

  presets.forEach((p) => {
    const date = formatDate(p.createdAt);
    const meta = p.params || {};
    console.log(`${chalk.bold.cyan(p.index + '.')} ${chalk.bold.white(p.name)} ${chalk.gray(`(usado ${p.usageCount || 0}x — ${date})`)}`);
    console.log(`   📌 ${meta.keywords || '?'} | 📍 ${meta.location || '?'} | ⏱️ ${meta.period || '?'}`);
  });
  console.log('');
}

// ─── Fluxo de busca principal ─────────────────────────────────────────────────
async function executarBusca(input, config) {
  logger.info(`Interpretando: "${truncate(input, 60)}"`);

  // Interpreta com LLM
  let params = await parseJobSearchIntent(input);

  // Expansão de keywords (se habilitado e sem boolean search)
  if (config.expandKeywords && !params.keywords?.match(/\b(OR|AND|NOT)\b/)) {
    logger.info('Expandindo keywords com IA...');
    const expansionResult = await expandKeywords(params.keywords);

    if (expansionResult.variations && expansionResult.variations.length > 0) {
      params.keywords = await promptUserForExpansion(
        params.keywords,
        expansionResult,
        ask
      );
    }
  }

  // Constrói URL
  const result = buildLinkedInUrl(params, config);

  // Avisos
  if (result.warnings && result.warnings.length > 0) {
    result.warnings.forEach((w) => logger.warn(w));
  }

  // Exibe resultado
  printResult(result);

  // Salva no histórico (fire-and-forget)
  saveToHistory(params, result);

  // Armazena na sessão
  lastSearch = { params, result };
  sessionResults.push({ input, result });
  sessionSearches++;

  console.log(chalk.gray(`  [Sessão: ${sessionSearches} busca(s) realizadas]`));
  console.log('');

  // Abertura no browser
  if (config.autoOpenBrowser) {
    logger.success('Abrindo no browser automaticamente...');
    openInBrowser(result.url);
  } else {
    const openAns = await ask('Abrir no browser? (s/n) [Enter = não]: ');
    if (openAns.trim().toLowerCase() === 's') {
      logger.success('Abrindo no browser...');
      openInBrowser(result.url);
    }
  }

  return result;
}

// ─── Modo Batch ───────────────────────────────────────────────────────────────
async function executarBatch(config) {
  console.log('');
  console.log(chalk.bold.cyan('📦 Modo BATCH ativado.'));
  console.log(chalk.gray('  Digite uma busca por linha. Linha vazia para finalizar:'));

  const searches = [];
  let lineNum = 1;

  while (true) {
    const line = await ask(`  ${chalk.gray(lineNum + ':')} `);
    if (!line.trim()) break;
    searches.push(line.trim());
    lineNum++;
  }

  if (searches.length === 0) {
    logger.warn('Nenhuma busca fornecida no modo batch.');
    return;
  }

  console.log('');
  const batchResults = [];

  await processBatch(searches, config, (idx, total, entry) => {
    if (entry.success) {
      batchResults.push(entry);
      sessionResults.push(entry);
      sessionSearches++;
    } else {
      console.log(chalk.red(`  ✗ Erro em "${truncate(entry.input, 40)}": ${entry.error}`));
    }
  });

  logger.success(`Batch concluído: ${batchResults.length}/${searches.length} buscas processadas`);

  if (batchResults.length > 0) {
    const exportAns = await ask('Exportar resultados? (txt/md/não): ');
    const ans = exportAns.trim().toLowerCase();

    if (ans === 'txt') {
      await exportToTxt(batchResults);
    } else if (ans === 'md' || ans === 'markdown') {
      await exportToMarkdown(batchResults);
    }
  }
}

// ─── Loop Principal ───────────────────────────────────────────────────────────
async function main() {
  // Inicialização
  await ensureDataDirs();
  userConfig = await loadConfig();

  printBanner();

  while (true) {
    const prompt =
      chalk.cyan('🔍 ') +
      chalk.bold.white('>') +
      ' ';

    const input = await askQuestion(prompt);
    const trimmed = input.trim();

    if (!trimmed) continue;

    const lower = trimmed.toLowerCase();

    try {
      // ─── Sair ──────────────────────────────────────────────────────────────
      if (['sair', 'exit', 'q', 'quit'].includes(lower)) {
        console.log('');
        console.log(chalk.green(`👋 Sessão encerrada. ${sessionSearches} busca(s) realizadas, ${sessionPresets} preset(s) salvo(s). Até mais!`));
        rl.close();
        process.exit(0);
      }

      // ─── Ajuda ─────────────────────────────────────────────────────────────
      if (['ajuda', '?', 'help'].includes(lower)) {
        printHelp();
        continue;
      }

      // ─── Batch ─────────────────────────────────────────────────────────────
      if (lower === 'batch') {
        await executarBatch(userConfig);
        continue;
      }

      // ─── Preset: salvar ────────────────────────────────────────────────────
      if (lower === 'preset salvar' || lower === 'ps') {
        if (!lastSearch) {
          logger.warn('Nenhuma busca realizada ainda nesta sessão. Faça uma busca primeiro.');
          continue;
        }
        const presetName = await ask('Nome para o preset: ');
        const saved = await savePreset(presetName, lastSearch.params, ask);
        if (saved) {
          sessionPresets++;
          logger.success(`Preset "${presetName}" salvo!`);
        }
        continue;
      }

      // ─── Preset: listar ────────────────────────────────────────────────────
      if (lower === 'preset listar' || lower === 'pl') {
        const presets = await listPresets();
        printPresets(presets);
        continue;
      }

      // ─── Preset: usar ──────────────────────────────────────────────────────
      if (lower.startsWith('preset usar ') || lower.startsWith('pu ')) {
        const arg = trimmed.replace(/^(preset usar|pu)\s+/i, '').trim();
        if (!arg) { logger.warn('Informe o nome ou número do preset.'); continue; }
        const preset = await getPreset(arg);
        if (!preset) { logger.error(`Preset "${arg}" não encontrado.`); continue; }
        logger.info(`Executando preset: "${preset.name}"`);
        await executarBusca(
          preset.params.keywords || JSON.stringify(preset.params),
          userConfig
        );
        // Permite sobrescrever params diretamente (preset já tem params normalizados)
        const result = buildLinkedInUrl(preset.params, userConfig);
        printResult(result);
        sessionResults.push({ input: `[preset: ${preset.name}]`, result });
        sessionSearches++;
        continue;
      }

      // ─── Preset: deletar ───────────────────────────────────────────────────
      if (lower.startsWith('preset deletar ') || lower.startsWith('pd ')) {
        const arg = trimmed.replace(/^(preset deletar|pd)\s+/i, '').trim();
        if (!arg) { logger.warn('Informe o nome ou número do preset.'); continue; }
        const deleted = await deletePreset(arg);
        if (deleted) {
          logger.success(`Preset "${arg}" removido.`);
        } else {
          logger.error(`Preset "${arg}" não encontrado.`);
        }
        continue;
      }

      // ─── Histórico: buscar ─────────────────────────────────────────────────
      if (lower.startsWith('historico buscar ') || lower.startsWith('hb ')) {
        const query = trimmed.replace(/^(historico buscar|hb)\s+/i, '').trim();
        if (!query) { logger.warn('Informe o termo de busca.'); continue; }
        const found = await searchHistory(query);
        if (found.length === 0) {
          logger.warn(`Nenhuma busca no histórico com "${query}".`);
        } else {
          printHistory(found);
        }
        continue;
      }

      // ─── Histórico: exportar ───────────────────────────────────────────────
      if (lower === 'historico exportar' || lower === 'he') {
        const filepath = await exportHistory(50);
        logger.success(`Histórico exportado: ${filepath}`);
        continue;
      }

      // ─── Histórico ─────────────────────────────────────────────────────────
      if (lower === 'historico' || lower === 'h') {
        const items = await getHistory(10);
        printHistory(items);
        continue;
      }

      // ─── Limpar histórico ──────────────────────────────────────────────────
      if (lower === 'limpar historico') {
        const confirm = await ask('Tem certeza? Isso apagará todo o histórico. (s/n): ');
        if (confirm.trim().toLowerCase() === 's') {
          await clearHistory();
          logger.success('Histórico limpo.');
        } else {
          logger.info('Operação cancelada.');
        }
        continue;
      }

      // ─── Exportar TXT ──────────────────────────────────────────────────────
      if (lower === 'exportar txt' || lower === 'et') {
        if (sessionResults.length === 0) {
          logger.warn('Nenhum resultado nesta sessão para exportar.');
          continue;
        }
        const filepath = await exportToTxt(sessionResults);
        logger.success(`Exportado: ${filepath}`);
        continue;
      }

      // ─── Exportar Markdown ─────────────────────────────────────────────────
      if (lower === 'exportar md' || lower === 'em') {
        if (sessionResults.length === 0) {
          logger.warn('Nenhum resultado nesta sessão para exportar.');
          continue;
        }
        const filepath = await exportToMarkdown(sessionResults);
        logger.success(`Exportado: ${filepath}`);
        continue;
      }

      // ─── Config: ver ───────────────────────────────────────────────────────
      if (lower === 'config') {
        console.log('');
        console.log(chalk.bold.white('⚙️  CONFIGURAÇÃO ATUAL'));
        console.log(chalk.cyan('─────────────────────────────────────────────────────────'));
        Object.entries(userConfig).forEach(([k, v]) => {
          console.log(`  ${chalk.bold.white(k.padEnd(22))} ${chalk.cyan(String(v))}`);
        });
        console.log('');
        continue;
      }

      // ─── Config: alterar ───────────────────────────────────────────────────
      if (lower.startsWith('config ') && lower.split(' ').length >= 3) {
        const parts = trimmed.split(/\s+/);
        const key = parts[1];
        const value = parts.slice(2).join(' ');

        // Converte tipos básicos
        let parsedValue = value;
        if (value === 'true') parsedValue = true;
        else if (value === 'false') parsedValue = false;
        else if (!isNaN(Number(value)) && value !== '') parsedValue = Number(value);

        userConfig[key] = parsedValue;
        await saveConfig(userConfig);
        logger.success(`Configuração atualizada: ${key} = ${parsedValue}`);
        continue;
      }

      // ─── Busca normal ──────────────────────────────────────────────────────
      await executarBusca(trimmed, userConfig);
    } catch (err) {
      logger.error(`Erro inesperado: ${err.message}`);
      logger.debug(err.stack);
      // Não crashar — continua o loop
    }
  }
}

// ─── Tratamento gracioso de saída ─────────────────────────────────────────────
process.on('SIGINT', () => {
  console.log('');
  console.log(chalk.green(`\n👋 Sessão interrompida. ${sessionSearches} busca(s) realizadas. Até mais!`));
  rl.close();
  process.exit(0);
});

// ─── Inicia a aplicação ───────────────────────────────────────────────────────
main().catch((err) => {
  logger.error(`Falha crítica na inicialização: ${err.message}`);
  rl.close();
  process.exit(1);
});
