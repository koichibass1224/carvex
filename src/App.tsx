import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3, TrendingUp, Percent, Globe2, Info, AlertTriangle, LineChart, Radar as RadarIcon } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Radar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, RadialLinearScale, Filler, Tooltip, Legend);

type TabId = 'eurostat' | 'worldbank' | 'trends';

type CountryConfig = {
  name: string;
  wbCode: string;
  eurostatCode: string;
};

type IndicatorData = {
  value: number | null;
  date: string | null;
};

type IndicatorSeries = {
  value: number | null;
  date: string;
};

type CountryMetrics = {
  name: string;
  gdp: IndicatorData;
  growth: IndicatorData;
  inflation: IndicatorData;
  population?: IndicatorData;
  eurostatInflation: IndicatorData;
};

type WorldBankMetrics = {
  name: string;
  code: string;
  gdp: IndicatorData;
  growth: IndicatorData;
  inflation: IndicatorData;
  unemployment: IndicatorData;
  population: IndicatorData;
  exchangeRate: IndicatorData;
};

type TabButtonProps = {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: (id: TabId) => void;
};

type MetricTrend = 'positive' | 'negative' | 'neutral';

type MetricCardProps = {
  title: string;
  value: string;
  change?: string;
  icon: React.ReactNode;
  trend?: MetricTrend;
};

type RankingItem = {
  name: string;
  value: string;
};

type RankingCardProps = {
  title: string;
  items?: RankingItem[];
  type?: 'default' | 'gdp' | 'growth' | 'inflation';
};

type CountrySectionProps = {
  country: CountryMetrics;
};

type SummaryMetrics = {
  averageGdp: number | null;
  averageGrowth: number | null;
  averageInflation: number | null;
  lastUpdated?: string;
};

type LanguageOption = 'ja' | 'en';

const GlobalEconomyDashboard = () => {
  const [activeTab, setActiveTab] = useState<TabId>('eurostat');
  const [eurostatMetrics, setEurostatMetrics] = useState<CountryMetrics[]>([]);
  const [worldBankMetrics, setWorldBankMetrics] = useState<WorldBankMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [yearOptions, setYearOptions] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [language, setLanguage] = useState<LanguageOption>('ja');
  const [expandedRankings, setExpandedRankings] = useState<Record<string, boolean>>({});
  const [selectedWorldBankCodes, setSelectedWorldBankCodes] = useState<string[]>(['DE', 'FR', 'IT']);
  const [trendCountryCodes, setTrendCountryCodes] = useState<string[]>(['DE', 'FR']);
  const [radarIndicators, setRadarIndicators] = useState<string[]>([
    'gdp',
    'growth',
    'inflation',
    'unemployment',
    'population',
  ]);
  const [trendStartYear, setTrendStartYear] = useState<string>('2000');
  const [trendEndYear, setTrendEndYear] = useState<string>('');
  const [trendIndicators, setTrendIndicators] = useState<string[]>([
    'gdp',
    'inflation',
    'growth',
    'unemployment',
    'exchange',
  ]);
  const [trendSeries, setTrendSeries] = useState<Record<string, Record<string, IndicatorSeries[]>>>({});
  const [eurostatSearch, setEurostatSearch] = useState<string>('');
  const [selectedEurostatCountries, setSelectedEurostatCountries] = useState<string[]>(['DE', 'FR', 'IT', 'ES']);

  const labels = {
    ja: {
      title: '経済コンディション・ダッシュボード',
      subtitle: 'World Bank Open Data と Eurostat に基づく最新の経済指標。',
      dataYear: 'データ年',
      language: '言語',
      eurostatTab: 'Eurostat',
      worldbankTab: 'World Bank',
      trendsTab: '年別推移',
      loading: '国別データを読み込み中...',
      error: '最新データの取得に失敗しました。時間を置いて再試行してください。',
      viewMore: '続きを見る',
      viewLess: '閉じる',
      overviewTitle: 'グローバル経済サマリー',
      overviewDescription: '主要EU経済圏のGDP・成長率・物価指標を横断的に可視化します。',
      averageGdp: '平均GDP（現行米ドル）',
      averageGrowth: '平均GDP成長率',
      averageInflation: '平均インフレ（CPI）',
      yoy: '前年比',
      lastUpdate: '最終更新',
      gdpLeaders: 'GDP上位',
      fastestGrowth: '成長率上位',
      countryOverview: '国別の概要',
      growthTitle: '成長・生産',
      growthDescription: 'World Bank の年次GDP成長率とGDP規模を確認できます。',
      topGdp: 'GDP最大',
      bestGrowth: '成長率トップ',
      momentum: '成長モメンタム',
      gdpRanking: 'GDPランキング',
      growthRanking: 'GDP成長率ランキング',
      countryGrowth: '国別の成長詳細',
      inflationTitle: 'インフレ・物価安定性',
      inflationDescription: 'CPI（World Bank）とHICP（月次・Eurostat）を併せて表示します。',
      highestCpi: 'CPI最高',
      medianCpi: 'CPI中央値',
      mostStable: '最も安定',
      inflationRanking: 'CPIインフレランキング',
      countryInflation: '国別のインフレ詳細',
      worldBankIndicators: 'World Bank 指標',
      eurostatIndicators: 'Eurostat HICP（月次）',
      latestHicp: '最新HICP変化率',
      referenceMonth: '対象月',
      metricsNote: '指標は World Bank（年次）と Eurostat（月次）を統合しています。',
      dataSources: 'データソース',
      reportInfo: 'レポート情報',
      lastRefreshed: '最終更新',
      coverage: '対象指標: GDP, GDP成長率, CPI, HICP(月次)',
      noData: 'データがありません',
      worldBankTitle: 'World Bank 指標の国別比較',
      worldBankDescription: '指標を選択して国別の違いをレーダーチャートで比較できます。',
      selectCountries: '比較する国',
      selectIndicators: '表示する指標',
      radarTitle: '指標レーダー比較',
      trendsTitle: '年別推移',
      trendsDescription: '選択した国の指標を年別の折れ線グラフで確認できます。',
      selectCountry: '国を選択',
      selectCountriesMulti: '表示する国',
      searchCountry: '国名で検索',
      rangeStart: '開始年',
      rangeEnd: '終了年',
      indicatorGdp: 'GDP（現行US$）',
      indicatorGdpPerCapita: 'GDP（一人当たり）',
      indicatorGrowth: 'GDP成長率',
      indicatorInflation: 'CPIインフレ率',
      indicatorUnemployment: '失業率',
      indicatorPopulation: '人口',
      indicatorExchange: '為替（LCU/USD）',
    },
    en: {
      title: 'Economic Conditions Dashboard',
      subtitle: 'Live economic indicators sourced from World Bank Open Data and Eurostat.',
      dataYear: 'Data year',
      language: 'Language',
      eurostatTab: 'Eurostat',
      worldbankTab: 'World Bank',
      trendsTab: 'Trends',
      loading: 'Loading country data...',
      error: 'Failed to load live data. Please retry later.',
      viewMore: 'View more',
      viewLess: 'View less',
      overviewTitle: 'Global Economic Pulse',
      overviewDescription: 'A harmonized snapshot of GDP, growth, and inflation metrics across major EU economies.',
      averageGdp: 'Average GDP (current US$)',
      averageGrowth: 'Average GDP Growth',
      averageInflation: 'Average Inflation (CPI)',
      yoy: 'YoY',
      lastUpdate: 'Last update',
      gdpLeaders: 'GDP Leaders',
      fastestGrowth: 'Fastest Growth',
      countryOverview: 'Country-by-Country Overview',
      growthTitle: 'Growth & Output',
      growthDescription: 'Annual GDP growth and current GDP size from the World Bank database.',
      topGdp: 'Top GDP',
      bestGrowth: 'Best Growth',
      momentum: 'Momentum Watch',
      gdpRanking: 'GDP Ranking',
      growthRanking: 'GDP Growth Ranking',
      countryGrowth: 'Country-by-Country Growth Detail',
      inflationTitle: 'Inflation & Price Stability',
      inflationDescription: 'Combined view of CPI inflation (World Bank) and monthly HICP (Eurostat).',
      highestCpi: 'Highest CPI',
      medianCpi: 'Median CPI',
      mostStable: 'Most Stable',
      inflationRanking: 'CPI Inflation Ranking',
      countryInflation: 'Country-by-Country Inflation Detail',
      worldBankIndicators: 'World Bank Indicators',
      eurostatIndicators: 'Eurostat HICP (monthly %)',
      latestHicp: 'Latest HICP change',
      referenceMonth: 'Reference month',
      metricsNote: 'Metrics are compiled from World Bank (annual) and Eurostat (monthly) datasets.',
      dataSources: 'Data Sources',
      reportInfo: 'Report Information',
      lastRefreshed: 'Last Refreshed',
      coverage: 'Coverage: GDP, GDP Growth, CPI Inflation, HICP Monthly Rate',
      noData: 'No data available',
      worldBankTitle: 'World Bank Country Comparison',
      worldBankDescription: 'Select indicators to compare countries in a radar chart.',
      selectCountries: 'Select countries',
      selectIndicators: 'Select indicators',
      radarTitle: 'Indicator Radar Comparison',
      trendsTitle: 'Time Series Trends',
      trendsDescription: 'View selected indicators by year for a single country.',
      selectCountry: 'Select country',
      selectCountriesMulti: 'Countries to show',
      searchCountry: 'Search countries',
      rangeStart: 'Start year',
      rangeEnd: 'End year',
      indicatorGdp: 'GDP (current US$)',
      indicatorGdpPerCapita: 'GDP per capita',
      indicatorGrowth: 'GDP growth rate',
      indicatorInflation: 'CPI inflation',
      indicatorUnemployment: 'Unemployment rate',
      indicatorPopulation: 'Population',
      indicatorExchange: 'FX rate (LCU/USD)',
    }
  } as const;

  const t = labels[language];

  const eurostatCountries: CountryConfig[] = [
    { name: 'Austria', wbCode: 'AT', eurostatCode: 'AT' },
    { name: 'Belgium', wbCode: 'BE', eurostatCode: 'BE' },
    { name: 'Bulgaria', wbCode: 'BG', eurostatCode: 'BG' },
    { name: 'Croatia', wbCode: 'HR', eurostatCode: 'HR' },
    { name: 'Cyprus', wbCode: 'CY', eurostatCode: 'CY' },
    { name: 'Czechia', wbCode: 'CZ', eurostatCode: 'CZ' },
    { name: 'Denmark', wbCode: 'DK', eurostatCode: 'DK' },
    { name: 'Estonia', wbCode: 'EE', eurostatCode: 'EE' },
    { name: 'Finland', wbCode: 'FI', eurostatCode: 'FI' },
    { name: 'France', wbCode: 'FR', eurostatCode: 'FR' },
    { name: 'Germany', wbCode: 'DE', eurostatCode: 'DE' },
    { name: 'Greece', wbCode: 'GR', eurostatCode: 'EL' },
    { name: 'Hungary', wbCode: 'HU', eurostatCode: 'HU' },
    { name: 'Ireland', wbCode: 'IE', eurostatCode: 'IE' },
    { name: 'Italy', wbCode: 'IT', eurostatCode: 'IT' },
    { name: 'Latvia', wbCode: 'LV', eurostatCode: 'LV' },
    { name: 'Lithuania', wbCode: 'LT', eurostatCode: 'LT' },
    { name: 'Luxembourg', wbCode: 'LU', eurostatCode: 'LU' },
    { name: 'Malta', wbCode: 'MT', eurostatCode: 'MT' },
    { name: 'Netherlands', wbCode: 'NL', eurostatCode: 'NL' },
    { name: 'Poland', wbCode: 'PL', eurostatCode: 'PL' },
    { name: 'Portugal', wbCode: 'PT', eurostatCode: 'PT' },
    { name: 'Romania', wbCode: 'RO', eurostatCode: 'RO' },
    { name: 'Slovakia', wbCode: 'SK', eurostatCode: 'SK' },
    { name: 'Slovenia', wbCode: 'SI', eurostatCode: 'SI' },
    { name: 'Spain', wbCode: 'ES', eurostatCode: 'ES' },
    { name: 'Sweden', wbCode: 'SE', eurostatCode: 'SE' },
    { name: 'United Kingdom', wbCode: 'GB', eurostatCode: 'UK' },
    { name: 'Norway', wbCode: 'NO', eurostatCode: 'NO' },
    { name: 'Iceland', wbCode: 'IS', eurostatCode: 'IS' },
    { name: 'Switzerland', wbCode: 'CH', eurostatCode: 'CH' },
  ];

  const worldBankCountries: CountryConfig[] = [
    { name: 'Albania', wbCode: 'AL', eurostatCode: 'AL' },
    { name: 'Austria', wbCode: 'AT', eurostatCode: 'AT' },
    { name: 'Belgium', wbCode: 'BE', eurostatCode: 'BE' },
    { name: 'Bosnia and Herzegovina', wbCode: 'BA', eurostatCode: 'BA' },
    { name: 'Bulgaria', wbCode: 'BG', eurostatCode: 'BG' },
    { name: 'Croatia', wbCode: 'HR', eurostatCode: 'HR' },
    { name: 'Cyprus', wbCode: 'CY', eurostatCode: 'CY' },
    { name: 'Czechia', wbCode: 'CZ', eurostatCode: 'CZ' },
    { name: 'Denmark', wbCode: 'DK', eurostatCode: 'DK' },
    { name: 'Estonia', wbCode: 'EE', eurostatCode: 'EE' },
    { name: 'Finland', wbCode: 'FI', eurostatCode: 'FI' },
    { name: 'France', wbCode: 'FR', eurostatCode: 'FR' },
    { name: 'Germany', wbCode: 'DE', eurostatCode: 'DE' },
    { name: 'Greece', wbCode: 'GR', eurostatCode: 'EL' },
    { name: 'Hungary', wbCode: 'HU', eurostatCode: 'HU' },
    { name: 'Iceland', wbCode: 'IS', eurostatCode: 'IS' },
    { name: 'Ireland', wbCode: 'IE', eurostatCode: 'IE' },
    { name: 'Italy', wbCode: 'IT', eurostatCode: 'IT' },
    { name: 'Latvia', wbCode: 'LV', eurostatCode: 'LV' },
    { name: 'Liechtenstein', wbCode: 'LI', eurostatCode: 'LI' },
    { name: 'Lithuania', wbCode: 'LT', eurostatCode: 'LT' },
    { name: 'Luxembourg', wbCode: 'LU', eurostatCode: 'LU' },
    { name: 'Malta', wbCode: 'MT', eurostatCode: 'MT' },
    { name: 'Moldova', wbCode: 'MD', eurostatCode: 'MD' },
    { name: 'Montenegro', wbCode: 'ME', eurostatCode: 'ME' },
    { name: 'Netherlands', wbCode: 'NL', eurostatCode: 'NL' },
    { name: 'North Macedonia', wbCode: 'MK', eurostatCode: 'MK' },
    { name: 'Norway', wbCode: 'NO', eurostatCode: 'NO' },
    { name: 'Poland', wbCode: 'PL', eurostatCode: 'PL' },
    { name: 'Portugal', wbCode: 'PT', eurostatCode: 'PT' },
    { name: 'Romania', wbCode: 'RO', eurostatCode: 'RO' },
    { name: 'Serbia', wbCode: 'RS', eurostatCode: 'RS' },
    { name: 'Slovakia', wbCode: 'SK', eurostatCode: 'SK' },
    { name: 'Slovenia', wbCode: 'SI', eurostatCode: 'SI' },
    { name: 'Spain', wbCode: 'ES', eurostatCode: 'ES' },
    { name: 'Sweden', wbCode: 'SE', eurostatCode: 'SE' },
    { name: 'Switzerland', wbCode: 'CH', eurostatCode: 'CH' },
    { name: 'United Kingdom', wbCode: 'GB', eurostatCode: 'UK' },
    { name: 'Ukraine', wbCode: 'UA', eurostatCode: 'UA' },
  ];

  // Design System Configuration (Apple HIG aligned)
  const colors = {
    primary: {
      50: 'bg-blue-50',
      100: 'bg-blue-100',
      500: 'bg-blue-500',
      600: 'bg-blue-600',
      700: 'bg-blue-700',
    },
    secondary: {
      50: 'bg-slate-50',
      100: 'bg-slate-100',
      200: 'bg-slate-200',
      800: 'bg-slate-800',
      900: 'bg-slate-900',
    },
    success: {
      50: 'bg-emerald-50',
      100: 'bg-emerald-100',
      600: 'bg-emerald-600',
    },
    warning: {
      50: 'bg-amber-50',
      100: 'bg-amber-100',
      600: 'bg-amber-600',
    },
    danger: {
      50: 'bg-rose-50',
      100: 'bg-rose-100',
      600: 'bg-rose-600',
    }
  };

  const typography = {
    display: 'text-3xl md:text-4xl font-semibold tracking-tight',
    h1: 'text-2xl md:text-3xl font-semibold tracking-tight',
    h2: 'text-xl md:text-2xl font-semibold tracking-tight',
    h3: 'text-lg md:text-xl font-semibold',
    h4: 'text-base md:text-lg font-medium',
    body: 'text-sm md:text-base leading-6',
    caption: 'text-xs md:text-sm text-slate-600',
    small: 'text-[11px] md:text-xs text-slate-500',
  };

  const spacing = {
    xs: 'p-2',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-12',
  };

  const borderRadius = {
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    full: 'rounded-full',
  };

  const shadows = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };

  const worldBankIndicators = {
    gdp: 'NY.GDP.MKTP.CD',
    growth: 'NY.GDP.MKTP.KD.ZG',
    inflation: 'FP.CPI.TOTL.ZG',
    unemployment: 'SL.UEM.TOTL.ZS',
    population: 'SP.POP.TOTL',
    exchange: 'PA.NUS.FCRF',
  };

  const formatNumber = (value: number | null | undefined, options: Intl.NumberFormatOptions = {}) => {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return 'N/A';
    }
    return new Intl.NumberFormat('en-US', options).format(value);
  };

  const getCacheKey = (prefix: string, countryCode: string, indicator: string, year?: string) =>
    `${prefix}:${countryCode}:${indicator}:${year || 'latest'}`;

  const getCached = <T,>(key: string): T | null => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        return null;
      }
      return JSON.parse(raw) as T;
    } catch (error) {
      return null;
    }
  };

  const setCached = <T,>(key: string, data: T) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      // ignore cache write errors
    }
  };

  const fetchWorldBankSeries = async (countryCode: string, indicator: string): Promise<IndicatorSeries[]> => {
    const cacheKey = getCacheKey('wb-series', countryCode, indicator);
    const cached = getCached<IndicatorSeries[]>(cacheKey);
    if (cached) {
      return cached;
    }
    const response = await fetch(
      `https://api.worldbank.org/v2/country/${countryCode}/indicator/${indicator}?format=json`
    );
    const payload = await response.json();
    const rows = (payload?.[1] ?? []) as IndicatorSeries[];
    const filtered = rows.filter((entry) => entry?.date);
    setCached(cacheKey, filtered);
    return filtered;
  };

  const fetchEurostatInflation = async (geoCode: string, year?: string): Promise<IndicatorData> => {
    const cacheKey = getCacheKey('eurostat-hicp', geoCode, 'prc_hicp_manr', year);
    const cached = getCached<IndicatorData>(cacheKey);
    if (cached) {
      return cached;
    }
    const response = await fetch(
      `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/prc_hicp_manr?geo=${geoCode}&coicop=CP00&unit=RCH_M`
    );
    const payload = await response.json();
    const timeIndex = (payload?.dimension?.time?.category?.index ?? {}) as Record<string, number>;
    const valueIndex = (payload?.value ?? {}) as Record<number, number>;
    const timeKeys = Object.keys(timeIndex);
    const filteredKeys = year ? timeKeys.filter((key) => key.startsWith(year)) : timeKeys;
    const latestTime = filteredKeys.sort().at(-1);
    const latestPosition = latestTime ? timeIndex[latestTime] : null;
    const value = latestPosition !== null ? valueIndex[latestPosition] ?? null : null;
    const result = { value, date: latestTime };
    setCached(cacheKey, result);
    return result;
  };

  const pickIndicatorForYear = (series: IndicatorSeries[], year?: string): IndicatorData => {
    if (!series.length) {
      return { value: null, date: null };
    }
    const sorted = [...series].sort((a, b) => Number(b.date) - Number(a.date));
    if (year) {
      const match = sorted.find((entry) => entry.date === year);
      return match ? { value: match.value ?? null, date: match.date } : { value: null, date: year };
    }
    const latest = sorted.find((entry) => entry.value !== null);
    return latest ? { value: latest.value ?? null, date: latest.date } : { value: null, date: null };
  };

  useEffect(() => {
    const loadEurostatMetrics = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');
        const results = await Promise.all(
          eurostatCountries.map(async (country) => {
            const [gdpSeries, growthSeries, inflationSeries, populationSeries] = await Promise.all([
              fetchWorldBankSeries(country.wbCode, worldBankIndicators.gdp),
              fetchWorldBankSeries(country.wbCode, worldBankIndicators.growth),
              fetchWorldBankSeries(country.wbCode, worldBankIndicators.inflation),
              fetchWorldBankSeries(country.wbCode, worldBankIndicators.population),
            ]);
            const year = selectedYear || undefined;
            const gdp = pickIndicatorForYear(gdpSeries, year);
            const growth = pickIndicatorForYear(growthSeries, year);
            const inflation = pickIndicatorForYear(inflationSeries, year);
            const population = pickIndicatorForYear(populationSeries, year);
            const eurostatInflation = await fetchEurostatInflation(country.eurostatCode, year);

            return {
              name: country.name,
              gdp,
              growth,
              inflation,
              population,
              eurostatInflation,
            };
          })
        );

        if (!yearOptions.length && results.length) {
          const available = await fetchWorldBankSeries(worldBankCountries[0].wbCode, worldBankIndicators.gdp);
          const uniqueYears = Array.from(new Set(available.map((entry) => entry.date))).sort((a, b) => Number(b) - Number(a));
          setYearOptions(uniqueYears.slice(0, 12));
          if (!selectedYear && uniqueYears.length) {
            setSelectedYear(uniqueYears[0]);
          }
        }
        setEurostatMetrics(results);
      } catch (error) {
        setErrorMessage(t.error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEurostatMetrics();
  }, [selectedYear, language]);

  useEffect(() => {
    const loadWorldBankMetrics = async () => {
      try {
        const results = await Promise.all(
          selectedWorldBankCodes.map(async (code) => {
            const country = worldBankCountries.find((item) => item.wbCode === code);
            if (!country) {
              return null;
            }
            const [gdpSeries, growthSeries, inflationSeries, unemploymentSeries, populationSeries, exchangeSeries] = await Promise.all([
              fetchWorldBankSeries(country.wbCode, worldBankIndicators.gdp),
              fetchWorldBankSeries(country.wbCode, worldBankIndicators.growth),
              fetchWorldBankSeries(country.wbCode, worldBankIndicators.inflation),
              fetchWorldBankSeries(country.wbCode, worldBankIndicators.unemployment),
              fetchWorldBankSeries(country.wbCode, worldBankIndicators.population),
              fetchWorldBankSeries(country.wbCode, worldBankIndicators.exchange),
            ]);
            const year = selectedYear || undefined;
            return {
              name: country.name,
              code: country.wbCode,
              gdp: pickIndicatorForYear(gdpSeries, year),
              growth: pickIndicatorForYear(growthSeries, year),
              inflation: pickIndicatorForYear(inflationSeries, year),
              unemployment: pickIndicatorForYear(unemploymentSeries, year),
              population: pickIndicatorForYear(populationSeries, year),
              exchangeRate: pickIndicatorForYear(exchangeSeries, year),
            };
          })
        );
        setWorldBankMetrics(results.filter((item): item is WorldBankMetrics => Boolean(item)));
      } catch (error) {
        setErrorMessage(t.error);
      }
    };

    if (selectedWorldBankCodes.length) {
      loadWorldBankMetrics();
    } else {
      setWorldBankMetrics([]);
    }
  }, [selectedWorldBankCodes, selectedYear, language]);

  useEffect(() => {
    const loadTrendSeries = async () => {
      try {
        const countryEntries = await Promise.all(
          trendCountryCodes.map(async (code) => {
            const seriesEntries = await Promise.all(
              trendIndicators.map(async (key) => {
                const indicator = worldBankIndicators[key as keyof typeof worldBankIndicators];
                const data = await fetchWorldBankSeries(code, indicator);
                return [key, data] as const;
              })
            );
            const indicatorMap = seriesEntries.reduce<Record<string, IndicatorSeries[]>>((acc, [key, data]) => {
              acc[key] = data;
              return acc;
            }, {});
            return [code, indicatorMap] as const;
          })
        );
        const mapped = countryEntries.reduce<Record<string, Record<string, IndicatorSeries[]>>>((acc, [code, map]) => {
          acc[code] = map;
          return acc;
        }, {});
        setTrendSeries(mapped);
      } catch (error) {
        setErrorMessage(t.error);
      }
    };

    if (trendCountryCodes.length && trendIndicators.length) {
      loadTrendSeries();
    } else {
      setTrendSeries({});
    }
  }, [trendCountryCodes, trendIndicators, language]);

  const summary = useMemo<SummaryMetrics | null>(() => {
    if (!eurostatMetrics.length) {
      return null;
    }
    const isNumber = (value: number | null): value is number => value !== null;
    const gdpValues = eurostatMetrics.map((country) => country.gdp.value).filter(isNumber);
    const growthValues = eurostatMetrics.map((country) => country.growth.value).filter(isNumber);
    const inflationValues = eurostatMetrics.map((country) => country.inflation.value).filter(isNumber);
    const average = (values: number[]) => (values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null);

    return {
      averageGdp: average(gdpValues),
      averageGrowth: average(growthValues),
      averageInflation: average(inflationValues),
      lastUpdated: eurostatMetrics.map((country) => country.gdp.date).filter(Boolean).sort().at(-1),
    };
  }, [eurostatMetrics]);

  const TabButton = ({ id, label, icon, isActive, onClick }: TabButtonProps) => (
    <button
      onClick={() => onClick(id)}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-xl font-medium text-xs md:text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
        ${isActive 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
        }
      `}
      role="tab"
      aria-selected={isActive}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  const MetricCard = ({ title, value, change, icon, trend = 'neutral' }: MetricCardProps) => {
    const trendColors = {
      positive: 'text-emerald-600 bg-emerald-50',
      negative: 'text-rose-600 bg-rose-50',
      neutral: 'text-slate-600 bg-slate-50'
    };

    return (
      <div className={`${colors.secondary[50]} ${borderRadius.md} ${spacing.md} ${shadows.sm} border border-slate-100`}>
        <div className="flex items-center justify-between mb-3">
          <div className={`${colors.primary[100]} ${borderRadius.sm} p-2`}>
            {icon}
          </div>
          {change && (
            <span className={`px-2 py-1 rounded-full text-sm font-medium ${trendColors[trend]}`}>
              {change}
            </span>
          )}
        </div>
        <h3 className={`${typography.caption} mb-1`}>{title}</h3>
        <p className={`${typography.h2} text-slate-900`}>{value}</p>
      </div>
    );
  };

  const RankingCard = ({ title, items = [], type = 'default' }: RankingCardProps) => (
    <div className={`${colors.secondary[50]} ${borderRadius.md} ${spacing.md} ${shadows.sm} border border-slate-100`}>
      <h3 className={`${typography.h4} text-slate-900 mb-4`}>{title}</h3>
      <div className="space-y-3">
        {items && items.length > 0 ? items.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 ${colors.primary[500]} ${borderRadius.full} flex items-center justify-center text-white text-sm font-medium`}>
                {index + 1}
              </div>
              <span className={`${typography.body} text-slate-900`}>{item.name}</span>
            </div>
            <div className="text-right">
              {type === 'gdp' && (
                <p className={`${typography.body} font-medium text-slate-900`}>{item.value}</p>
              )}
              {type === 'growth' && (
                <p className={`${typography.body} font-medium ${item.value.startsWith('-') ? 'text-rose-600' : 'text-emerald-600'}`}>{item.value}</p>
              )}
              {type === 'inflation' && (
                <p className={`${typography.body} font-medium text-amber-600`}>{item.value}</p>
              )}
            </div>
          </div>
        )) : (
          <div className="text-center text-slate-500 py-4">
            <p className={typography.caption}>{t.noData}</p>
          </div>
        )}
      </div>
    </div>
  );

  const CountrySection = ({ country }: CountrySectionProps) => (
    <div className="mb-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className={`${typography.h3} text-slate-900`}>{country.name}</h3>
        <div className="flex items-center gap-4">
          <span className={`${typography.body} text-slate-600`}>
            GDP: {formatNumber(country.gdp.value, { notation: 'compact' })}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            country.growth.value !== null && country.growth.value < 0 ? 'text-rose-600 bg-rose-50' : 'text-emerald-600 bg-emerald-50'
          }`}>
            {formatNumber(country.growth.value, { maximumFractionDigits: 1 })}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${colors.secondary[50]} ${borderRadius.md} ${spacing.md} ${shadows.sm} border border-slate-100`}>
          <h4 className={`${typography.h4} text-slate-900 mb-3`}>{t.worldBankIndicators}</h4>
          <div className="space-y-2">
            <p className={`${typography.body} text-slate-700`}>
              GDP (current US$): <span className="font-medium text-slate-900">{formatNumber(country.gdp.value, { notation: 'compact' })}</span>
            </p>
            <p className={`${typography.body} text-slate-700`}>
              {t.indicatorGdpPerCapita}: <span className="font-medium text-slate-900">
                {country.gdp.value && country.population?.value
                  ? formatNumber(country.gdp.value / country.population.value, { notation: 'compact' })
                  : 'N/A'}
              </span>
            </p>
            <p className={`${typography.body} text-slate-700`}>
              GDP Growth (annual %): <span className="font-medium text-slate-900">{formatNumber(country.growth.value, { maximumFractionDigits: 1 })}%</span>
            </p>
            <p className={`${typography.body} text-slate-700`}>
              CPI Inflation (annual %): <span className="font-medium text-slate-900">{formatNumber(country.inflation.value, { maximumFractionDigits: 1 })}%</span>
            </p>
          </div>
        </div>
        <div className={`${colors.secondary[50]} ${borderRadius.md} ${spacing.md} ${shadows.sm} border border-slate-100`}>
          <h4 className={`${typography.h4} text-slate-900 mb-3`}>{t.eurostatIndicators}</h4>
          <div className="space-y-2">
            <p className={`${typography.body} text-slate-700`}>
              {t.latestHicp}: <span className="font-medium text-slate-900">
                {country.eurostatInflation.value === null
                  ? 'N/A'
                  : `${formatNumber(country.eurostatInflation.value, { maximumFractionDigits: 1 })}%`}
              </span>
            </p>
            <p className={`${typography.caption} text-slate-500`}>
              {t.referenceMonth}: {country.eurostatInflation.date || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      <div className={`mt-4 ${colors.warning[50]} border border-amber-200 ${borderRadius.sm} ${spacing.sm}`}>
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-600" />
          <span className={`${typography.caption} text-amber-800`}>
            {t.metricsNote}
          </span>
        </div>
      </div>
    </div>
  );

  const rankingData = useMemo<{ gdp: RankingItem[]; growth: RankingItem[]; inflation: RankingItem[] }>(() => {
    if (!eurostatMetrics.length) {
      return { gdp: [], growth: [], inflation: [] };
    }

    const gdp = [...eurostatMetrics]
      .filter((country) => country.gdp.value !== null)
      .sort((a, b) => b.gdp.value - a.gdp.value)
      .map((country) => ({
        name: country.name,
        value: `${formatNumber(country.gdp.value, { notation: 'compact' })}`,
      }));

    const growth = [...eurostatMetrics]
      .filter((country) => country.growth.value !== null)
      .sort((a, b) => b.growth.value - a.growth.value)
      .map((country) => ({
        name: country.name,
        value: `${formatNumber(country.growth.value, { maximumFractionDigits: 1 })}%`,
      }));

    const inflation = [...eurostatMetrics]
      .filter((country) => country.inflation.value !== null)
      .sort((a, b) => b.inflation.value - a.inflation.value)
      .map((country) => ({
        name: country.name,
        value: `${formatNumber(country.inflation.value, { maximumFractionDigits: 1 })}%`,
      }));

    return { gdp, growth, inflation };
  }, [eurostatMetrics]);

  const indicatorLabelMap: Record<string, string> = {
    gdp: t.indicatorGdp,
    growth: t.indicatorGrowth,
    inflation: t.indicatorInflation,
    unemployment: t.indicatorUnemployment,
    population: t.indicatorPopulation,
    exchange: t.indicatorExchange,
  };

  const toggleWorldBankCountry = (code: string) => {
    setSelectedWorldBankCodes((prev) =>
      prev.includes(code) ? prev.filter((item) => item !== code) : [...prev, code]
    );
  };

  const toggleEurostatCountry = (code: string) => {
    setSelectedEurostatCountries((prev) =>
      prev.includes(code) ? prev.filter((item) => item !== code) : [...prev, code]
    );
  };

  const toggleRadarIndicator = (key: string) => {
    setRadarIndicators((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };

  const toggleTrendIndicator = (key: string) => {
    setTrendIndicators((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };

  const radarData = useMemo(() => {
    if (!worldBankMetrics.length || !radarIndicators.length) {
      return null;
    }
    const maxByIndicator = radarIndicators.reduce<Record<string, number>>((acc, key) => {
      const maxValue = Math.max(
        ...worldBankMetrics.map((country) => country[key as keyof WorldBankMetrics]?.value ?? 0)
      );
      acc[key] = maxValue || 1;
      return acc;
    }, {});

    const palette = ['#2563EB', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#0EA5E9'];
    const labels = radarIndicators.map((key) => indicatorLabelMap[key] || key);

    return {
      labels,
      datasets: worldBankMetrics.map((country, index) => ({
        label: country.name,
        data: radarIndicators.map((key) => {
          const value = country[key as keyof WorldBankMetrics]?.value ?? 0;
          return Math.round((value / maxByIndicator[key]) * 100);
        }),
        backgroundColor: `${palette[index % palette.length]}33`,
        borderColor: palette[index % palette.length],
        borderWidth: 2,
        pointRadius: 2,
        pointHoverRadius: 4,
      })),
    };
  }, [worldBankMetrics, radarIndicators, indicatorLabelMap]);

  const worldBankRankings = useMemo(() => {
    if (!worldBankMetrics.length) {
      return [];
    }
    const keys = ['gdp', 'growth', 'inflation', 'unemployment', 'population', 'exchange'] as const;
    return keys.map((key) => {
      const sorted = [...worldBankMetrics]
        .filter((country) => country[key]?.value !== null)
        .sort((a, b) => (b[key]?.value ?? 0) - (a[key]?.value ?? 0))
        .slice(0, 5)
        .map((country) => ({
          name: country.name,
          value: formatNumber(country[key]?.value ?? null, {
            maximumFractionDigits: 1,
            notation: key === 'gdp' || key === 'population' ? 'compact' : 'standard',
          }),
        }));
      return { key, label: indicatorLabelMap[key], items: sorted };
    });
  }, [worldBankMetrics, indicatorLabelMap]);

  const trendChartData = useMemo(() => {
    if (!trendIndicators.length || !Object.keys(trendSeries).length) {
      return { labels: [], datasets: [], years: [] };
    }
    const yearSet = new Set<string>();
    Object.values(trendSeries).forEach((indicatorMap) => {
      trendIndicators.forEach((key) => {
        (indicatorMap[key] || []).forEach((entry) => yearSet.add(entry.date));
      });
    });
    const years = Array.from(yearSet).sort();
    const endYear = trendEndYear || years.at(-1) || '';
    const startYear = trendStartYear || years[0] || '';
    const labels = years.filter((year) => year >= startYear && year <= endYear);

    const axisMap: Record<string, string> = {
      gdp: 'value',
      population: 'value',
      exchange: 'fx',
      growth: 'rate',
      inflation: 'rate',
      unemployment: 'rate',
    };

    const colorMap: Record<string, string> = {
      gdp: '#2563EB',
      population: '#10B981',
      exchange: '#F97316',
      growth: '#8B5CF6',
      inflation: '#EC4899',
      unemployment: '#0EA5E9',
    };

    const datasets = trendCountryCodes.flatMap((code, countryIndex) => {
      const countryName = worldBankCountries.find((country) => country.wbCode === code)?.name || code;
      const indicatorMap = trendSeries[code] || {};
      return trendIndicators.map((key) => ({
        label: `${countryName} · ${indicatorLabelMap[key] || key}`,
        data: labels.map((year) => {
          const match = (indicatorMap[key] || []).find((entry) => entry.date === year);
          return match?.value ?? null;
        }),
        borderColor: colorMap[key] || '#64748B',
        backgroundColor: `${colorMap[key] || '#64748B'}33`,
        yAxisID: axisMap[key],
        tension: 0.35,
        borderWidth: 2,
        pointRadius: 2,
        pointHoverRadius: 4,
        spanGaps: true,
        borderDash: countryIndex % 2 ? [6, 4] : [],
      }));
    });

    return { labels, datasets, years };
  }, [trendIndicators, trendSeries, indicatorLabelMap, trendStartYear, trendEndYear, trendCountryCodes, worldBankCountries]);

  const renderTabContent = () => {
    if (isLoading) {
      return (
        <div className="text-center text-slate-500 py-8">
          <p className={typography.body}>{t.loading}</p>
        </div>
      );
    }

    if (errorMessage) {
      return (
        <div className={`${colors.danger[50]} border border-rose-200 ${borderRadius.md} ${spacing.md} text-rose-700`}>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <p className={typography.body}>{errorMessage || t.error}</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'eurostat': {
        const eurostatRankings = [
          { key: 'gdp', title: t.gdpLeaders, items: rankingData.gdp },
          { key: 'growth', title: t.fastestGrowth, items: rankingData.growth },
          { key: 'inflation', title: t.inflationRanking, items: rankingData.inflation },
        ];
        const filteredEurostatCountries = eurostatCountries.filter((country) =>
          country.name.toLowerCase().includes(eurostatSearch.toLowerCase())
        );
        const selectedNames = new Set(
          eurostatCountries
            .filter((country) => selectedEurostatCountries.includes(country.wbCode))
            .map((country) => country.name)
        );
        return (
          <div>
            <div className="mb-8">
              <h2 className={`${typography.h1} text-slate-900 mb-2`}>{t.overviewTitle}</h2>
              <p className={`${typography.body} text-slate-600 mb-6`}>
                {t.overviewDescription}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <MetricCard
                  title={t.averageGdp}
                  value={summary ? formatNumber(summary.averageGdp, { notation: 'compact' }) : 'N/A'}
                  icon={<Globe2 className="w-5 h-5 text-blue-600" />}
                />
                <MetricCard
                  title={t.averageGrowth}
                  value={summary ? `${formatNumber(summary.averageGrowth, { maximumFractionDigits: 1 })}%` : 'N/A'}
                  change={t.yoy}
                  trend="positive"
                  icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
                />
                <MetricCard
                  title={t.averageInflation}
                  value={summary ? `${formatNumber(summary.averageInflation, { maximumFractionDigits: 1 })}%` : 'N/A'}
                  change={summary?.lastUpdated ? `${t.lastUpdate} ${summary.lastUpdated}` : ''}
                  trend="neutral"
                  icon={<Percent className="w-5 h-5 text-blue-600" />}
                />
              </div>

              <div className="space-y-4 mb-8">
                {eurostatRankings.map((ranking) => (
                  <details key={ranking.key} className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3">
                    <summary className="cursor-pointer text-sm font-semibold text-slate-800">
                      {ranking.title}
                    </summary>
                    <div className="mt-3">
                      <RankingCard
                        title={ranking.title}
                        items={expandedRankings[ranking.key] ? ranking.items : ranking.items.slice(0, 5)}
                        type={ranking.key as RankingCardProps['type']}
                      />
                      {ranking.items.length > 5 && (
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedRankings((prev) => ({
                              ...prev,
                              [ranking.key]: !prev[ranking.key],
                            }))
                          }
                          className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                          {expandedRankings[ranking.key] ? t.viewLess : t.viewMore}
                        </button>
                      )}
                    </div>
                  </details>
                ))}
              </div>
            </div>

            <div>
              <h3 className={`${typography.h2} text-slate-900 mb-6`}>{t.countryOverview}</h3>
              <div className={`${colors.secondary[50]} ${borderRadius.md} ${spacing.md} ${shadows.sm} border border-slate-100 mb-6`}>
                <label htmlFor="eurostat-search" className={`${typography.caption} block mb-2 text-slate-600`}>
                  {t.searchCountry}
                </label>
                <input
                  id="eurostat-search"
                  type="search"
                  value={eurostatSearch}
                  onChange={(event) => setEurostatSearch(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  placeholder={t.searchCountry}
                />
                <div className="mt-4">
                  <h4 className={`${typography.h4} text-slate-900 mb-2`}>{t.selectCountriesMulti}</h4>
                  <div className="max-h-56 overflow-y-auto space-y-2 pr-2">
                    {filteredEurostatCountries.map((country) => (
                      <label key={country.wbCode} className="flex items-center gap-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          checked={selectedEurostatCountries.includes(country.wbCode)}
                          onChange={() => toggleEurostatCountry(country.wbCode)}
                        />
                        {country.name}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              {eurostatMetrics
                .filter((country) => selectedNames.has(country.name))
                .map((country, index) => (
                  <CountrySection key={`${country.name}-${index}`} country={country} />
                ))}
            </div>
          </div>
        );
      }

      case 'worldbank':
        return (
          <div>
            <div className="mb-8">
              <h2 className={`${typography.h1} text-slate-900 mb-2`}>{t.worldBankTitle}</h2>
              <p className={`${typography.body} text-slate-600 mb-6`}>
                {t.worldBankDescription}
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className={`${colors.secondary[50]} ${borderRadius.md} ${spacing.md} ${shadows.sm} border border-slate-100`}>
                  <h3 className={`${typography.h4} text-slate-900 mb-3`}>{t.selectCountries}</h3>
                  <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                    {worldBankCountries.map((country) => (
                      <label key={country.wbCode} className="flex items-center gap-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          checked={selectedWorldBankCodes.includes(country.wbCode)}
                          onChange={() => toggleWorldBankCountry(country.wbCode)}
                        />
                        {country.name}
                      </label>
                    ))}
                  </div>
                </div>
                <div className={`${colors.secondary[50]} ${borderRadius.md} ${spacing.md} ${shadows.sm} border border-slate-100 lg:col-span-2`}>
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <h3 className={`${typography.h4} text-slate-900`}>{t.radarTitle}</h3>
                    <div className="flex flex-wrap gap-2">
                      {['gdp', 'growth', 'inflation', 'unemployment', 'population'].map((key) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => toggleRadarIndicator(key)}
                          className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                            radarIndicators.includes(key)
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-slate-200 text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {indicatorLabelMap[key]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className={`${typography.caption} text-slate-500 mb-3`}>
                    {t.indicatorGdp} / {t.indicatorInflation} / {t.indicatorGrowth} / {t.indicatorUnemployment} / {t.indicatorPopulation}
                  </p>
                  <div className="h-80">
                    {radarData ? (
                      <Radar
                        data={radarData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            r: {
                              ticks: {
                                display: false,
                              },
                              grid: {
                                color: '#E2E8F0',
                              },
                              angleLines: {
                                color: '#CBD5F5',
                              },
                              pointLabels: {
                                color: '#0F172A',
                                font: {
                                  size: 11,
                                  weight: '600',
                                },
                              },
                            },
                          },
                          plugins: {
                            legend: {
                              position: 'bottom',
                              labels: {
                                usePointStyle: true,
                                boxWidth: 8,
                                color: '#475569',
                                padding: 16,
                              },
                            },
                            tooltip: {
                              backgroundColor: '#0F172A',
                              titleColor: '#F8FAFC',
                              bodyColor: '#E2E8F0',
                              padding: 10,
                            },
                          },
                        }}
                      />
                    ) : (
                      <p className={`${typography.caption} text-slate-500`}>{t.noData}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className={`${colors.secondary[50]} ${borderRadius.md} ${spacing.md} ${shadows.sm} border border-slate-100`}>
              <h3 className={`${typography.h4} text-slate-900 mb-4`}>{t.gdpRanking}</h3>
              <div className="space-y-3">
                {worldBankRankings.map((ranking) => (
                  <details key={ranking.key} className="rounded-lg border border-slate-200 bg-white/70 px-4 py-3">
                    <summary className="cursor-pointer text-sm font-semibold text-slate-800">
                      {ranking.label}
                      <span className="ml-2 text-xs font-normal text-slate-500">
                        {ranking.key === 'gdp' ? 'US$' : ranking.key === 'population' ? 'people' : ranking.key === 'exchange' ? 'LCU/USD' : '%'}
                      </span>
                    </summary>
                    <div className="mt-3 space-y-2 text-sm text-slate-700">
                      {ranking.items.length ? (
                        ranking.items.map((item, index) => (
                          <div key={`${ranking.key}-${item.name}`} className="flex items-center justify-between">
                            <span>{index + 1}. {item.name}</span>
                            <span className="font-medium text-slate-900">{item.value}</span>
                          </div>
                        ))
                      ) : (
                        <p className={typography.caption}>{t.noData}</p>
                      )}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        );

      case 'trends':
        return (
          <div>
            <div className="mb-8">
              <h2 className={`${typography.h1} text-slate-900 mb-2`}>{t.trendsTitle}</h2>
              <p className={`${typography.body} text-slate-600 mb-6`}>
                {t.trendsDescription}
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className={`${colors.secondary[50]} ${borderRadius.md} ${spacing.md} ${shadows.sm} border border-slate-100`}>
                  <h4 className={`${typography.h4} text-slate-900 mb-2`}>{t.selectCountriesMulti}</h4>
                  <div className="max-h-56 overflow-y-auto space-y-2 pr-2">
                    {worldBankCountries.map((country) => (
                      <label key={country.wbCode} className="flex items-center gap-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          checked={trendCountryCodes.includes(country.wbCode)}
                          onChange={() =>
                            setTrendCountryCodes((prev) =>
                              prev.includes(country.wbCode)
                                ? prev.filter((item) => item !== country.wbCode)
                                : [...prev, country.wbCode]
                            )
                          }
                        />
                        {country.name}
                      </label>
                    ))}
                  </div>
                  <div className="mt-4">
                    <h4 className={`${typography.h4} text-slate-900 mb-2`}>{t.selectIndicators}</h4>
                    <div className="space-y-2">
                      {['gdp', 'growth', 'inflation', 'unemployment', 'population', 'exchange'].map((key) => (
                        <label key={key} className="flex items-center gap-2 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            checked={trendIndicators.includes(key)}
                            onChange={() => toggleTrendIndicator(key)}
                          />
                          {indicatorLabelMap[key]}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="trend-start" className={`${typography.caption} block mb-1 text-slate-600`}>
                        {t.rangeStart}
                      </label>
                      <select
                        id="trend-start"
                        value={trendStartYear}
                        onChange={(event) => setTrendStartYear(event.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      >
                        {(trendChartData?.years || []).map((year) => (
                          <option key={`start-${year}`} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="trend-end" className={`${typography.caption} block mb-1 text-slate-600`}>
                        {t.rangeEnd}
                      </label>
                      <select
                        id="trend-end"
                        value={trendEndYear || trendChartData?.years?.at(-1) || ''}
                        onChange={(event) => setTrendEndYear(event.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      >
                        {(trendChartData?.years || []).map((year) => (
                          <option key={`end-${year}`} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className={`${colors.secondary[50]} ${borderRadius.md} ${spacing.md} ${shadows.sm} border border-slate-100 lg:col-span-2`}>
                  {trendChartData?.labels?.length ? (
                    <Line
                      data={trendChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          value: {
                            type: 'linear',
                            position: 'left',
                            ticks: {
                              color: '#475569',
                              font: { size: 11 },
                            },
                            grid: {
                              color: '#E2E8F0',
                            },
                          },
                          rate: {
                            type: 'linear',
                            position: 'right',
                            grid: {
                              drawOnChartArea: false,
                            },
                            ticks: {
                              color: '#64748B',
                              font: { size: 11 },
                            },
                          },
                          fx: {
                            type: 'linear',
                            position: 'right',
                            grid: {
                              drawOnChartArea: false,
                            },
                            ticks: {
                              color: '#64748B',
                              font: { size: 11 },
                            },
                          },
                        },
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: {
                              usePointStyle: true,
                              boxWidth: 8,
                              color: '#475569',
                              padding: 16,
                            },
                          },
                          tooltip: {
                            backgroundColor: '#0F172A',
                            titleColor: '#F8FAFC',
                            bodyColor: '#E2E8F0',
                            padding: 10,
                          },
                        },
                      }}
                      height={320}
                    />
                  ) : (
                    <p className={`${typography.caption} text-slate-500`}>{t.noData}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className={`${colors.secondary[900]} text-white ${spacing.lg}`}>
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className={`${typography.display} mb-4`}>{t.title}</h1>
              <p className={`${typography.body} opacity-90`}>
                {t.subtitle}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label htmlFor="year-select" className="text-sm font-medium text-white/80">
                {t.dataYear}
              </label>
              <select
                id="year-select"
                value={selectedYear}
                onChange={(event) => setSelectedYear(event.target.value)}
                className="rounded-lg bg-slate-800/70 border border-slate-600 text-white px-3 py-2 text-xs md:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {yearOptions.length ? (
                  yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))
                ) : (
                  <option value="">Loading...</option>
                )}
              </select>
              <label htmlFor="language-select" className="text-sm font-medium text-white/80">
                {t.language}
              </label>
              <select
                id="language-select"
                value={language}
                onChange={(event) => setLanguage(event.target.value as LanguageOption)}
                className="rounded-lg bg-slate-800/70 border border-slate-600 text-white px-3 py-2 text-xs md:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <option value="ja">日本語</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className={`${colors.secondary[50]} border-b border-slate-200 ${spacing.md}`} role="tablist">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-2">
            <TabButton
              id="eurostat"
              label={t.eurostatTab}
              icon={<BarChart3 className="w-5 h-5" />}
              isActive={activeTab === 'eurostat'}
              onClick={setActiveTab}
            />
            <TabButton
              id="worldbank"
              label={t.worldbankTab}
              icon={<RadarIcon className="w-5 h-5" />}
              isActive={activeTab === 'worldbank'}
              onClick={setActiveTab}
            />
            <TabButton
              id="trends"
              label={t.trendsTab}
              icon={<LineChart className="w-5 h-5" />}
              isActive={activeTab === 'trends'}
              onClick={setActiveTab}
            />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className={`max-w-7xl mx-auto ${spacing.lg}`} role="tabpanel">
        {renderTabContent()}

      </main>

      {/* Footer */}
      <footer className={`${colors.secondary[100]} border-t border-slate-200 ${spacing.lg} mt-16`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className={`${typography.h4} text-slate-900 mb-4`}>{t.dataSources}</h3>
              <ul className={`${typography.caption} space-y-2`}>
                <li>• World Bank Open Data API</li>
                <li>• Eurostat Dissemination API</li>
              </ul>
            </div>
            <div>
              <h3 className={`${typography.h4} text-slate-900 mb-4`}>{t.reportInfo}</h3>
              <p className={`${typography.caption} mb-2`}>
                {t.lastRefreshed}: {summary?.lastUpdated || 'N/A'}
              </p>
              <p className={`${typography.caption}`}>
                {t.coverage}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default GlobalEconomyDashboard;