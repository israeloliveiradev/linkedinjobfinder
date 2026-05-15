import { GEO_IDS } from '../constants/geoIds.js';
import { JOB_TYPES, EXPERIENCE_LEVELS, WORK_MODES, SORT_OPTIONS } from '../constants/filters.js';
import { TIME_PERIODS } from '../constants/timePeriods.js';

export class UrlBuilderService {
  build(params) {
    const {
      keywords,
      location,
      geoId,
      period,
      jobType,
      experienceLevel,
      workMode,
      sortBy,
      distance,
      easyApply,
      lowApplicants,
      company
    } = params;

    const baseUrl = 'https://www.linkedin.com/jobs/search/';
    const searchParams = new URLSearchParams();

    searchParams.append('keywords', keywords);

    const finalGeoId = geoId || GEO_IDS[(location || 'brasil').toLowerCase()] || GEO_IDS['brasil'];
    console.log(`[UrlBuilder] 🌍 Location: ${location} -> GeoID: ${finalGeoId}`);
    searchParams.append('geoId', finalGeoId);

    const periodSeconds = TIME_PERIODS[period] || 86400;
    searchParams.append('f_TPR', `r${periodSeconds}`);

    if (jobType && Array.isArray(jobType) && jobType.length) {
      const codes = jobType.map(t => t && JOB_TYPES[t.toLowerCase()]).filter(Boolean);
      if (codes.length) searchParams.append('f_JT', codes.join(','));
    }

    if (experienceLevel && Array.isArray(experienceLevel) && experienceLevel.length) {
      const codes = experienceLevel.map(l => l && EXPERIENCE_LEVELS[l.toLowerCase()]).filter(Boolean);
      if (codes.length) searchParams.append('f_E', codes.join(','));
    }

    if (workMode && Array.isArray(workMode) && workMode.length) {
      const codes = workMode.map(m => m && WORK_MODES[m.toLowerCase()]).filter(Boolean);
      if (codes.length) searchParams.append('f_WT', codes.join(','));
    }

    const sortCode = SORT_OPTIONS[(sortBy || 'recente').toLowerCase()] || 'DD';
    searchParams.append('sortBy', sortCode);

    if (distance) searchParams.append('distance', distance);
    if (easyApply) searchParams.append('f_AL', 'true');
    if (lowApplicants) searchParams.append('f_JIYN', 'true');
    if (company) searchParams.append('f_C', company);

    return {
      main: `${baseUrl}?${searchParams.toString()}`,
      express: `${baseUrl}?${searchParams.toString()}&f_EA=true`
    };
  }
}
