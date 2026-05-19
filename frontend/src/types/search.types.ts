export interface ParsedParams {
  keywords: string;
  location: string;
  geoId?: string;
  period: string;
  jobType: string[];
  experienceLevel: string[];
  workMode: string[];
  sortBy: string;
  distance: number;
  easyApply: boolean;
  lowApplicants: boolean;
  company: string | null;
  recruiterAdvice?: string;
}

export interface SearchResult {
  id: string;
  createdAt: string;
  originalQuery: string;
  parsedParams: ParsedParams;
  expandedKeywords: string[];
  booleanQuery: string;
  urls: {
    main: string;
    express: string;
    fallback1h?: string;
    fallback24h?: string;
    fallback3d?: string;
    postsVaga?: string;
    postsHiring?: string;
    postsCurriculo?: string;
  };
  filtersApplied: number;
}

export interface Preset {
  id: string;
  name: string;
  params: ParsedParams;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    message: string;
    code: string;
    details?: any;
  };
}
