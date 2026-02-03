import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3, TrendingUp, Percent, Globe2, Info, AlertTriangle, LineChart } from 'lucide-react';

type TabId = 'overview' | 'growth' | 'inflation';

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
  eurostatInflation: IndicatorData;
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

const GlobalEconomyDashboard = () => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [countryMetrics, setCountryMetrics] = useState<CountryMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [yearOptions, setYearOptions] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('');

  const countries: CountryConfig[] = [
    { name: 'Germany', wbCode: 'DE', eurostatCode: 'DE' },
    { name: 'France', wbCode: 'FR', eurostatCode: 'FR' },
    { name: 'Italy', wbCode: 'IT', eurostatCode: 'IT' },
    { name: 'Spain', wbCode: 'ES', eurostatCode: 'ES' },
    { name: 'Netherlands', wbCode: 'NL', eurostatCode: 'NL' },
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
    display: 'text-4xl font-semibold tracking-tight',
    h1: 'text-3xl font-semibold tracking-tight',
    h2: 'text-2xl font-semibold tracking-tight',
    h3: 'text-xl font-semibold',
    h4: 'text-lg font-medium',
    body: 'text-base leading-6',
    caption: 'text-sm text-slate-600',
    small: 'text-xs text-slate-500',
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

  const formatNumber = (value: number | null | undefined, options: Intl.NumberFormatOptions = {}) => {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return 'N/A';
    }
    return new Intl.NumberFormat('en-US', options).format(value);
  };

  const fetchWorldBankSeries = async (countryCode: string, indicator: string): Promise<IndicatorSeries[]> => {
    const response = await fetch(
      `https://api.worldbank.org/v2/country/${countryCode}/indicator/${indicator}?format=json`
    );
    const payload = await response.json();
    const rows = (payload?.[1] ?? []) as IndicatorSeries[];
    return rows.filter((entry) => entry?.date);
  };

  const fetchEurostatInflation = async (geoCode: string, year?: string): Promise<IndicatorData> => {
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
    return { value, date: latestTime };
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
    const loadMetrics = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');
        const results = await Promise.all(
          countries.map(async (country) => {
            const [gdpSeries, growthSeries, inflationSeries] = await Promise.all([
              fetchWorldBankSeries(country.wbCode, 'NY.GDP.MKTP.CD'),
              fetchWorldBankSeries(country.wbCode, 'NY.GDP.MKTP.KD.ZG'),
              fetchWorldBankSeries(country.wbCode, 'FP.CPI.TOTL.ZG'),
            ]);
            const year = selectedYear || undefined;
            const gdp = pickIndicatorForYear(gdpSeries, year);
            const growth = pickIndicatorForYear(growthSeries, year);
            const inflation = pickIndicatorForYear(inflationSeries, year);
            const eurostatInflation = await fetchEurostatInflation(country.eurostatCode, year);

            return {
              name: country.name,
              gdp,
              growth,
              inflation,
              eurostatInflation,
            };
          })
        );
        if (!yearOptions.length && results.length) {
          const available = await fetchWorldBankSeries(countries[0].wbCode, 'NY.GDP.MKTP.CD');
          const uniqueYears = Array.from(new Set(available.map((entry) => entry.date))).sort((a, b) => Number(b) - Number(a));
          setYearOptions(uniqueYears.slice(0, 10));
          if (!selectedYear && uniqueYears.length) {
            setSelectedYear(uniqueYears[0]);
          }
        }
        setCountryMetrics(results);
      } catch (error) {
        setErrorMessage('Failed to load live data. Please retry later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadMetrics();
  }, [selectedYear]);

  const summary = useMemo<SummaryMetrics | null>(() => {
    if (!countryMetrics.length) {
      return null;
    }
    const isNumber = (value: number | null): value is number => value !== null;
    const gdpValues = countryMetrics.map((country) => country.gdp.value).filter(isNumber);
    const growthValues = countryMetrics.map((country) => country.growth.value).filter(isNumber);
    const inflationValues = countryMetrics.map((country) => country.inflation.value).filter(isNumber);
    const average = (values: number[]) => (values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null);

    return {
      averageGdp: average(gdpValues),
      averageGrowth: average(growthValues),
      averageInflation: average(inflationValues),
      lastUpdated: countryMetrics.map((country) => country.gdp.date).filter(Boolean).sort().at(-1),
    };
  }, [countryMetrics]);

  const TabButton = ({ id, label, icon, isActive, onClick }: TabButtonProps) => (
    <button
      onClick={() => onClick(id)}
      className={`
        flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
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
            <p className={typography.caption}>No data available</p>
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
          <h4 className={`${typography.h4} text-slate-900 mb-3`}>World Bank Indicators</h4>
          <div className="space-y-2">
            <p className={`${typography.body} text-slate-700`}>
              GDP (current US$): <span className="font-medium text-slate-900">{formatNumber(country.gdp.value, { notation: 'compact' })}</span>
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
          <h4 className={`${typography.h4} text-slate-900 mb-3`}>Eurostat HICP (monthly %)</h4>
          <div className="space-y-2">
            <p className={`${typography.body} text-slate-700`}>
              Latest HICP change: <span className="font-medium text-slate-900">{formatNumber(country.eurostatInflation.value, { maximumFractionDigits: 1 })}%</span>
            </p>
            <p className={`${typography.caption} text-slate-500`}>
              Reference month: {country.eurostatInflation.date || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      <div className={`mt-4 ${colors.warning[50]} border border-amber-200 ${borderRadius.sm} ${spacing.sm}`}>
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-600" />
          <span className={`${typography.caption} text-amber-800`}>
            Metrics are compiled from World Bank (annual) and Eurostat (monthly) datasets.
          </span>
        </div>
      </div>
    </div>
  );

  const rankingData = useMemo<{ gdp: RankingItem[]; growth: RankingItem[]; inflation: RankingItem[] }>(() => {
    if (!countryMetrics.length) {
      return { gdp: [], growth: [], inflation: [] };
    }

    const gdp = [...countryMetrics]
      .filter((country) => country.gdp.value !== null)
      .sort((a, b) => b.gdp.value - a.gdp.value)
      .map((country) => ({
        name: country.name,
        value: `${formatNumber(country.gdp.value, { notation: 'compact' })}`,
      }));

    const growth = [...countryMetrics]
      .filter((country) => country.growth.value !== null)
      .sort((a, b) => b.growth.value - a.growth.value)
      .map((country) => ({
        name: country.name,
        value: `${formatNumber(country.growth.value, { maximumFractionDigits: 1 })}%`,
      }));

    const inflation = [...countryMetrics]
      .filter((country) => country.inflation.value !== null)
      .sort((a, b) => b.inflation.value - a.inflation.value)
      .map((country) => ({
        name: country.name,
        value: `${formatNumber(country.inflation.value, { maximumFractionDigits: 1 })}%`,
      }));

    return { gdp, growth, inflation };
  }, [countryMetrics]);

  const renderTabContent = () => {
    if (isLoading) {
      return (
        <div className="text-center text-slate-500 py-8">
          <p className={typography.body}>Loading country data...</p>
        </div>
      );
    }

    if (errorMessage) {
      return (
        <div className={`${colors.danger[50]} border border-rose-200 ${borderRadius.md} ${spacing.md} text-rose-700`}>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <p className={typography.body}>{errorMessage}</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return (
          <div>
            <div className="mb-8">
              <h2 className={`${typography.h1} text-slate-900 mb-2`}>Global Economic Pulse</h2>
              <p className={`${typography.body} text-slate-600 mb-6`}>
                A harmonized snapshot of GDP, growth, and inflation metrics across major EU economies.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <MetricCard
                  title="Average GDP (current US$)"
                  value={summary ? formatNumber(summary.averageGdp, { notation: 'compact' }) : 'N/A'}
                  icon={<Globe2 className="w-5 h-5 text-blue-600" />}
                />
                <MetricCard
                  title="Average GDP Growth"
                  value={summary ? `${formatNumber(summary.averageGrowth, { maximumFractionDigits: 1 })}%` : 'N/A'}
                  change="YoY"
                  trend="positive"
                  icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
                />
                <MetricCard
                  title="Average Inflation (CPI)"
                  value={summary ? `${formatNumber(summary.averageInflation, { maximumFractionDigits: 1 })}%` : 'N/A'}
                  change={summary?.lastUpdated ? `Last update ${summary.lastUpdated}` : ''}
                  trend="neutral"
                  icon={<Percent className="w-5 h-5 text-blue-600" />}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <RankingCard
                  title="GDP Leaders"
                  items={rankingData.gdp.slice(0, 3)}
                  type="gdp"
                />
                <RankingCard
                  title="Fastest Growth"
                  items={rankingData.growth.slice(0, 3)}
                  type="growth"
                />
              </div>
            </div>

            <div>
              <h3 className={`${typography.h2} text-slate-900 mb-6`}>Country-by-Country Overview</h3>
              {countryMetrics.map((country, index) => (
                <CountrySection key={index} country={country} />
              ))}
            </div>
          </div>
        );

      case 'growth':
        return (
          <div>
            <div className="mb-8">
              <h2 className={`${typography.h1} text-slate-900 mb-2`}>Growth & Output</h2>
              <p className={`${typography.body} text-slate-600 mb-6`}>
                Annual GDP growth and current GDP size from the World Bank database.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <MetricCard
                  title="Top GDP"
                  value={rankingData.gdp[0]?.value || 'N/A'}
                  change={rankingData.gdp[0]?.name || 'N/A'}
                  trend="positive"
                  icon={<BarChart3 className="w-5 h-5 text-blue-600" />}
                />
                <MetricCard
                  title="Best Growth"
                  value={rankingData.growth[0]?.value || 'N/A'}
                  change={rankingData.growth[0]?.name || 'N/A'}
                  trend="positive"
                  icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
                />
                <MetricCard
                  title="Momentum Watch"
                  value={rankingData.growth[1]?.value || 'N/A'}
                  change={rankingData.growth[1]?.name || 'N/A'}
                  trend="neutral"
                  icon={<LineChart className="w-5 h-5 text-blue-600" />}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <RankingCard
                  title="GDP Ranking"
                  items={rankingData.gdp}
                  type="gdp"
                />
                <RankingCard
                  title="GDP Growth Ranking"
                  items={rankingData.growth}
                  type="growth"
                />
              </div>
            </div>

            <div>
              <h3 className={`${typography.h2} text-slate-900 mb-6`}>Country-by-Country Growth Detail</h3>
              {countryMetrics.map((country, index) => (
                <CountrySection key={index} country={country} />
              ))}
            </div>
          </div>
        );

      case 'inflation':
        return (
          <div>
            <div className="mb-8">
              <h2 className={`${typography.h1} text-slate-900 mb-2`}>Inflation & Price Stability</h2>
              <p className={`${typography.body} text-slate-600 mb-6`}>
                Combined view of CPI inflation (World Bank) and monthly HICP (Eurostat).
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <MetricCard
                  title="Highest CPI"
                  value={rankingData.inflation[0]?.value || 'N/A'}
                  change={rankingData.inflation[0]?.name || 'N/A'}
                  trend="negative"
                  icon={<Percent className="w-5 h-5 text-blue-600" />}
                />
                <MetricCard
                  title="Median CPI"
                  value={rankingData.inflation[2]?.value || 'N/A'}
                  change={rankingData.inflation[2]?.name || 'N/A'}
                  trend="neutral"
                  icon={<BarChart3 className="w-5 h-5 text-blue-600" />}
                />
                <MetricCard
                  title="Most Stable"
                  value={rankingData.inflation.at(-1)?.value || 'N/A'}
                  change={rankingData.inflation.at(-1)?.name || 'N/A'}
                  trend="positive"
                  icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <RankingCard
                  title="CPI Inflation Ranking"
                  items={rankingData.inflation}
                  type="inflation"
                />
                <div className={`${colors.secondary[50]} ${borderRadius.md} ${spacing.md} ${shadows.sm} border border-slate-100`}>
                  <h3 className={`${typography.h4} text-slate-900 mb-4`}>Eurostat HICP Snapshot</h3>
                  <div className="space-y-3">
                    {countryMetrics.map((country) => (
                      <div key={country.name} className="flex items-center justify-between">
                        <span className={`${typography.body} text-slate-900`}>{country.name}</span>
                        <span className={`${typography.body} font-medium text-amber-600`}>
                          {formatNumber(country.eurostatInflation.value, { maximumFractionDigits: 1 })}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className={`${typography.h2} text-slate-900 mb-6`}>Country-by-Country Inflation Detail</h3>
              {countryMetrics.map((country, index) => (
                <CountrySection key={index} country={country} />
              ))}
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
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className={`${typography.display} mb-4`}>Economic Conditions Dashboard</h1>
              <p className={`${typography.body} opacity-90`}>
                Live economic indicators sourced from World Bank Open Data and Eurostat.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <label htmlFor="year-select" className="text-sm font-medium text-white/80">
                Data year
              </label>
              <select
                id="year-select"
                value={selectedYear}
                onChange={(event) => setSelectedYear(event.target.value)}
                className="rounded-lg bg-slate-800/70 border border-slate-600 text-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
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
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className={`${colors.secondary[50]} border-b border-slate-200 ${spacing.md}`} role="tablist">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-2 overflow-x-auto">
            <TabButton
              id="overview"
              label="Overview"
              icon={<Globe2 className="w-5 h-5" />}
              isActive={activeTab === 'overview'}
              onClick={setActiveTab}
            />
            <TabButton
              id="growth"
              label="Growth & Output"
              icon={<TrendingUp className="w-5 h-5" />}
              isActive={activeTab === 'growth'}
              onClick={setActiveTab}
            />
            <TabButton
              id="inflation"
              label="Inflation"
              icon={<Percent className="w-5 h-5" />}
              isActive={activeTab === 'inflation'}
              onClick={setActiveTab}
            />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className={`max-w-7xl mx-auto ${spacing.lg}`} role="tabpanel">
        {renderTabContent()}

        <section className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className={`${typography.h2} text-slate-900`}>Apple HIG-aligned UI Design Rules</h2>
            <span className={`${typography.caption} text-slate-500`}>Mapped to Tailwind CSS tokens</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${colors.secondary[50]} ${borderRadius.md} ${spacing.md} ${shadows.sm} border border-slate-100`}>
              <h3 className={`${typography.h4} text-slate-900 mb-3`}>Color System</h3>
              <p className={`${typography.body} text-slate-700 mb-2`}>
                Intent: Use subdued neutrals with a single accent to keep focus on data.
              </p>
              <p className={`${typography.caption} text-slate-500`}>
                Tailwind: bg-slate-50, bg-slate-900, bg-blue-600, text-slate-900, text-white.
              </p>
            </div>
            <div className={`${colors.secondary[50]} ${borderRadius.md} ${spacing.md} ${shadows.sm} border border-slate-100`}>
              <h3 className={`${typography.h4} text-slate-900 mb-3`}>Typography</h3>
              <p className={`${typography.body} text-slate-700 mb-2`}>
                Intent: Clear hierarchy with comfortable line height for long-form data.
              </p>
              <p className={`${typography.caption} text-slate-500`}>
                Tailwind: text-4xl font-semibold tracking-tight, text-base leading-6, text-sm text-slate-600.
              </p>
            </div>
            <div className={`${colors.secondary[50]} ${borderRadius.md} ${spacing.md} ${shadows.sm} border border-slate-100`}>
              <h3 className={`${typography.h4} text-slate-900 mb-3`}>Spacing</h3>
              <p className={`${typography.body} text-slate-700 mb-2`}>
                Intent: Generous padding and consistent gaps to support scanning.
              </p>
              <p className={`${typography.caption} text-slate-500`}>
                Tailwind: p-6, p-8, gap-6, mt-16.
              </p>
            </div>
            <div className={`${colors.secondary[50]} ${borderRadius.md} ${spacing.md} ${shadows.sm} border border-slate-100`}>
              <h3 className={`${typography.h4} text-slate-900 mb-3`}>Border Radius</h3>
              <p className={`${typography.body} text-slate-700 mb-2`}>
                Intent: Soft rounding to mimic iOS card surfaces and improve approachability.
              </p>
              <p className={`${typography.caption} text-slate-500`}>
                Tailwind: rounded-xl for cards, rounded-full for badges.
              </p>
            </div>
            <div className={`${colors.secondary[50]} ${borderRadius.md} ${spacing.md} ${shadows.sm} border border-slate-100`}>
              <h3 className={`${typography.h4} text-slate-900 mb-3`}>Shadow</h3>
              <p className={`${typography.body} text-slate-700 mb-2`}>
                Intent: Subtle elevation cues without overwhelming data.
              </p>
              <p className={`${typography.caption} text-slate-500`}>
                Tailwind: shadow-sm, shadow-lg shadow-blue-500/30 for active tabs.
              </p>
            </div>
            <div className={`${colors.secondary[50]} ${borderRadius.md} ${spacing.md} ${shadows.sm} border border-slate-100`}>
              <h3 className={`${typography.h4} text-slate-900 mb-3`}>UI Components</h3>
              <p className={`${typography.body} text-slate-700 mb-2`}>
                Intent: Cards, tabs, and badges emphasize summary and details layers.
              </p>
              <p className={`${typography.caption} text-slate-500`}>
                Tailwind: rounded-xl border border-slate-100, px-6 py-3, text-sm font-medium.
              </p>
            </div>
            <div className={`${colors.secondary[50]} ${borderRadius.md} ${spacing.md} ${shadows.sm} border border-slate-100`}>
              <h3 className={`${typography.h4} text-slate-900 mb-3`}>Accessibility</h3>
              <p className={`${typography.body} text-slate-700 mb-2`}>
                Intent: Maintain contrast, readable sizes, and clear focus states.
              </p>
              <p className={`${typography.caption} text-slate-500`}>
                Tailwind: text-slate-900 on bg-slate-50, focus-visible:ring-2 ring-blue-500.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={`${colors.secondary[100]} border-t border-slate-200 ${spacing.lg} mt-16`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className={`${typography.h4} text-slate-900 mb-4`}>Data Sources</h3>
              <ul className={`${typography.caption} space-y-2`}>
                <li>• World Bank Open Data API</li>
                <li>• Eurostat Dissemination API</li>
              </ul>
            </div>
            <div>
              <h3 className={`${typography.h4} text-slate-900 mb-4`}>Report Information</h3>
              <p className={`${typography.caption} mb-2`}>
                Last Refreshed: {summary?.lastUpdated || 'N/A'}
              </p>
              <p className={`${typography.caption}`}>
                Coverage: GDP, GDP Growth, CPI Inflation, HICP Monthly Rate
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default GlobalEconomyDashboard;
