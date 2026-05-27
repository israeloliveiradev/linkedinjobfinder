import { describe, it, expect } from 'vitest';
import { UrlBuilderService } from './urlBuilder.service.js';

describe('UrlBuilderService', () => {
  const urlBuilder = new UrlBuilderService();

  describe('Basic LinkedIn Search', () => {
    it('deve construir URL básica do LinkedIn com palavras-chave e localização padrão', () => {
      const params = {
        keywords: 'Frontend Developer',
        location: 'brasil',
        period: '24h',
      };
      const result = urlBuilder.build(params);

      expect(result.main).toContain('https://www.linkedin.com/jobs/search/');
      expect(result.main).toContain('keywords=Frontend+Developer');
      expect(result.main).toContain('geoId=106057199'); // Brasil GeoID
    });

    it('deve normalizar acentos e localizar geoId correto no dicionário', () => {
      const params = {
        keywords: 'React',
        location: 'São Paulo',
      };
      const result = urlBuilder.build(params);
      expect(result.main).toContain('geoId=105871508'); // São Paulo GeoID
    });

    it('deve usar o geoId padrão do Brasil se a localização não constar no dicionário', () => {
      const params = {
        keywords: 'React',
        location: 'CidadeInexistente123',
      };
      const result = urlBuilder.build(params);
      expect(result.main).toContain('geoId=106057199');
    });
  });

  describe('Smart Remote Override', () => {
    it('deve ativar Smart Remote se workMode contiver remoto', () => {
      const params = {
        keywords: 'Node.js',
        location: 'São Paulo',
        workMode: ['remoto'],
      };
      const result = urlBuilder.build(params);

      // Indeed deve ir para "remoto"
      expect(result.indeed).toContain('l=remoto');

      // Gupy deve conter workplaceTypes[]=remote e NÃO conter state
      expect(result.gupy).toContain('workplaceTypes[]=remote');
      expect(result.gupy).not.toContain('state=');

      // Glassdoor deve conter loc=remoto e remoteWorkType=1
      expect(result.glassdoor).toContain('loc=remoto');
      expect(result.glassdoor).toContain('remoteWorkType=1');
    });

    it('deve ativar Smart Remote se workMode contiver o código "2" (remoto do LinkedIn)', () => {
      const params = {
        keywords: 'Python',
        location: 'Rio de Janeiro',
        workMode: ['2'],
      };
      const result = urlBuilder.build(params);

      expect(result.indeed).toContain('l=remoto');
      expect(result.gupy).toContain('workplaceTypes[]=remote');
      expect(result.glassdoor).toContain('loc=remoto');
      expect(result.glassdoor).toContain('remoteWorkType=1');
    });
  });

  describe('Indeed URL Construction', () => {
    it('deve mapear localizações conhecidas corretamente', () => {
      const params = {
        keywords: 'Java',
        location: 'campinas',
      };
      const result = urlBuilder.build(params);
      expect(result.indeed).toContain('l=Campinas%2C+SP'); // Campinas -> Campinas, SP
    });

    it('deve aplicar filtros de tipo de vaga (CLT / PJ)', () => {
      const params = {
        keywords: 'Java',
        jobType: ['clt', 'pj'],
      };
      const result = urlBuilder.build(params);
      expect(result.indeed).toContain('jt=fulltime');
      expect(result.indeed).toContain('jt=contract');
    });

    it('deve aplicar nível de experiência', () => {
      const params = {
        keywords: 'Ruby',
        experienceLevel: ['junior', 'senior'],
      };
      const result = urlBuilder.build(params);
      expect(result.indeed).toContain('explvl=entry_level');
      expect(result.indeed).toContain('explvl=senior_level');
    });

    it('deve aplicar exclusões com exclusão de spam (BairesDev)', () => {
      const params = {
        keywords: 'React',
        exclusions: ['BairesDev', 'EmpresaRuim'],
      };
      const result = urlBuilder.build(params);
      // BairesDev deve ser omitido (anti-spam corporativo já é tratado em outro ponto ou retirado no mapper)
      expect(result.indeed).toContain('EmpresaRuim');
      expect(result.indeed).not.toContain('BairesDev');
    });
  });

  describe('Gupy URL Construction', () => {
    it('deve mapear estados do Brasil corretamente', () => {
      const params = {
        keywords: 'Vue',
        location: 'belo horizonte',
      };
      const result = urlBuilder.build(params);
      expect(result.gupy).toContain('state=Minas%20Gerais');
    });

    it('deve mapear modo de trabalho híbrido', () => {
      const params = {
        keywords: 'Vue',
        workMode: ['hibrido'],
      };
      const result = urlBuilder.build(params);
      expect(result.gupy).toContain('workplaceTypes[]=hybrid');
    });

    it('deve mapear modo de trabalho presencial', () => {
      const params = {
        keywords: 'Vue',
        workMode: ['presencial'],
      };
      const result = urlBuilder.build(params);
      expect(result.gupy).toContain('workplaceTypes[]=on-site');
    });
  });

  describe('Glassdoor URL Construction', () => {
    it('deve respeitar minRating padrão de 4.0 se omitido', () => {
      const params = {
        keywords: 'SRE',
      };
      const result = urlBuilder.build(params);
      expect(result.glassdoor).toContain('minRating=4.0');
    });

    it('deve aplicar minRating customizado', () => {
      const params = {
        keywords: 'SRE',
        minRating: '4.5',
      };
      const result = urlBuilder.build(params);
      expect(result.glassdoor).toContain('minRating=4.5');
    });

    it('deve aplicar applicationType=1 se easyApply for true', () => {
      const params = {
        keywords: 'SRE',
        easyApply: true,
      };
      const result = urlBuilder.build(params);
      expect(result.glassdoor).toContain('applicationType=1');
    });

    it('deve configurar fromage padrão baseado no período', () => {
      const params = {
        keywords: 'SRE',
        period: '7d',
      };
      const result = urlBuilder.build(params);
      expect(result.glassdoor).toContain('fromAge=7');
    });
  });
});
