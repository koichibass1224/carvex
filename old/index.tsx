import React, { useState } from 'react';
import { Car, TrendingUp, Battery, BarChart3, Users, Award, ChevronRight, Info } from 'lucide-react';

const EuropeCarMarketDashboardEN = () => {
  const [activeTab, setActiveTab] = useState('new-cars');

  // Design System Configuration
  const colors = {
    primary: {
      50: 'bg-blue-50',
      100: 'bg-blue-100',
      500: 'bg-blue-500',
      600: 'bg-blue-600',
      700: 'bg-blue-700',
    },
    secondary: {
      50: 'bg-gray-50',
      100: 'bg-gray-100',
      200: 'bg-gray-200',
      800: 'bg-gray-800',
      900: 'bg-gray-900',
    },
    success: {
      50: 'bg-green-50',
      100: 'bg-green-100',
      500: 'bg-green-500',
      600: 'bg-green-600',
    },
    warning: {
      50: 'bg-yellow-50',
      100: 'bg-yellow-100',
      500: 'bg-yellow-500',
    },
    danger: {
      50: 'bg-red-50',
      100: 'bg-red-100',
      500: 'bg-red-500',
    }
  };

  const typography = {
    display: 'text-4xl font-bold tracking-tight',
    h1: 'text-3xl font-bold tracking-tight',
    h2: 'text-2xl font-semibold tracking-tight',
    h3: 'text-xl font-semibold',
    h4: 'text-lg font-medium',
    body: 'text-base leading-6',
    caption: 'text-sm text-gray-600',
    small: 'text-xs text-gray-500',
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

  // Data
  const newCarData = {
    overall: {
      totalSales: '12,909,741',
      growth: '+0.9%',
      topBrands: [
        { name: 'Volkswagen Group', share: '20%', change: '±0%' },
        { name: 'Stellantis', share: '15%', change: '-7%' },
        { name: 'Hyundai-Kia', share: '12%', change: '-1%' }
      ],
      topModels: [
        { name: 'Dacia Sandero', sales: '268,101', change: '+14%' },
        { name: 'Renault Clio', sales: '216,317', change: '+7%' },
        { name: 'Volkswagen Golf', sales: '215,715', change: '+17%' }
      ]
    },
    countries: [
      {
        name: 'Germany',
        sales: '2,800,000',
        growth: '-1%',
        topBrands: ['Volkswagen', 'Mercedes-Benz', 'BMW'],
        topModels: [
          { name: 'Volkswagen Golf', sales: '100,183' },
          { name: 'Volkswagen T-Roc', sales: '75,398' },
          { name: 'Volkswagen Tiguan', sales: '67,057' }
        ]
      },
      {
        name: 'United Kingdom',
        sales: '2,000,000',
        growth: '+2.6%',
        topBrands: ['Ford', 'Volkswagen', 'BMW'],
        topModels: [
          { name: 'Ford Puma', sales: '48,340' },
          { name: 'Volkswagen Golf', sales: '35,000' },
          { name: 'BMW X1', sales: '30,000' }
        ]
      },
      {
        name: 'France',
        sales: '1,780,000',
        growth: '-3.2%',
        topBrands: ['Renault', 'Peugeot', 'Citroën'],
        topModels: [
          { name: 'Renault Clio', sales: '91,435' },
          { name: 'Peugeot 208', sales: '88,918' },
          { name: 'Dacia Sandero', sales: '75,978' }
        ]
      },
      {
        name: 'Italy',
        sales: '1,560,000',
        growth: '-0.5%',
        topBrands: ['Fiat', 'Volkswagen', 'Dacia'],
        topModels: [
          { name: 'Fiat Panda', sales: '99,871' },
          { name: 'Dacia Sandero', sales: '60,380' },
          { name: 'Jeep Avenger', sales: '41,184' }
        ]
      },
      {
        name: 'Spain',
        sales: '1,050,000',
        growth: '+7%',
        topBrands: ['Dacia', 'Toyota', 'SEAT'],
        topModels: [
          { name: 'Dacia Sandero', sales: '32,994' },
          { name: 'Toyota Corolla', sales: '22,124' },
          { name: 'SEAT Ibiza', sales: '22,021' }
        ]
      }
    ]
  };

  const usedCarData = {
    overall: {
      growth: '+5.2%',
      topBrands: [
        { name: 'Peugeot', sales: '15,503', change: '-9.7%' },
        { name: 'Dacia', sales: '12,008', change: '+8.3%' },
        { name: 'Mercedes-Benz', sales: '11,741', change: '+5%' }
      ],
      fastestSelling: [
        { name: 'Dacia Sandero', days: '28-34' },
        { name: 'Volkswagen Polo', days: '32' },
        { name: 'Toyota Aygo', days: '23-40' }
      ]
    },
    countries: [
      {
        name: 'Germany',
        growth: '+4.6%',
        topBrands: ['Volkswagen', 'BMW', 'Mercedes-Benz'],
        fastestModels: [
          { name: 'Tesla Model 3', days: '30' },
          { name: 'Mercedes-Benz GLC', days: '41' },
          { name: 'Skoda Kodiaq', days: '44' }
        ]
      },
      {
        name: 'France',
        growth: '+2.8%',
        topBrands: ['Renault', 'Peugeot', 'Citroën'],
        fastestModels: [
          { name: 'Volkswagen Polo', days: '32' },
          { name: 'Dacia Duster', days: '34' },
          { name: 'Toyota Aygo', days: '40' }
        ]
      },
      {
        name: 'Italy',
        growth: '+9%',
        topBrands: ['Fiat', 'Dacia', 'Volkswagen'],
        fastestModels: [
          { name: 'Dacia Sandero', days: '34' },
          { name: 'Volvo XC40', days: '42' },
          { name: 'Toyota C-HR', days: '44' }
        ]
      },
      {
        name: 'Spain',
        growth: '+11.5%',
        topBrands: ['Dacia', 'Toyota', 'Peugeot'],
        fastestModels: [
          { name: 'Toyota C-HR', days: '22' },
          { name: 'Toyota Aygo', days: '23' },
          { name: 'Fiat Tipo', days: '30' }
        ]
      }
    ]
  };

  const evData = {
    overall: {
      totalSales: '1,993,102',
      growth: '-1.3%',
      marketShare: '15.4%',
      topBrands: [
        { name: 'Tesla', share: '25%', change: '+5%' },
        { name: 'Volkswagen', share: '18%', change: '-2%' },
        { name: 'Volvo', share: '12%', change: '+15%' }
      ],
      topModels: [
        { name: 'Tesla Model Y', sales: '200,000' },
        { name: 'Volkswagen ID.4/ID.5', sales: '120,000' },
        { name: 'Tesla Model 3', sales: '100,000' }
      ]
    },
    countries: [
      {
        name: 'Germany',
        sales: '400,000',
        growth: '-12%',
        note: 'Sharp decline due to subsidy cuts',
        topModels: [
          { name: 'Tesla Model Y', sales: '29,896' },
          { name: 'Skoda Enyaq', sales: '25,262' },
          { name: 'Volkswagen ID.4/ID.5', sales: '21,611' }
        ]
      },
      {
        name: 'United Kingdom',
        sales: '300,000',
        growth: '+8%',
        note: 'Strong growth due to emission regulations',
        topModels: [
          { name: 'Tesla Model Y', sales: '35,000' },
          { name: 'MG4', sales: '25,000' },
          { name: 'BMW iX1', sales: '20,000' }
        ]
      },
      {
        name: 'Norway',
        sales: '120,000',
        growth: '+1.4%',
        note: '89% EV market share',
        topModels: [
          { name: 'Tesla Model Y', sales: '16,858' },
          { name: 'Tesla Model 3', sales: '7,264' },
          { name: 'Volvo EX30', sales: '7,229' }
        ]
      }
    ]
  };

  const TabButton = ({ id, label, icon, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`
        flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-200
        ${isActive 
          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' 
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }
      `}
      role="tab"
      aria-selected={isActive}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  const MetricCard = ({ title, value, change, icon, trend = 'neutral' }) => {
    const trendColors = {
      positive: 'text-green-600 bg-green-50',
      negative: 'text-red-600 bg-red-50',
      neutral: 'text-gray-600 bg-gray-50'
    };

    return (
      <div className={`${colors.secondary[50]} ${borderRadius.md} ${spacing.md} ${shadows.sm} border border-gray-100`}>
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
        <p className={`${typography.h2} text-gray-900`}>{value}</p>
      </div>
    );
  };

  const RankingCard = ({ title, items = [], type = 'default' }) => (
    <div className={`${colors.secondary[50]} ${borderRadius.md} ${spacing.md} ${shadows.sm} border border-gray-100`}>
      <h3 className={`${typography.h4} text-gray-900 mb-4`}>{title}</h3>
      <div className="space-y-3">
        {items && items.length > 0 ? items.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 ${colors.primary[500]} ${borderRadius.full} flex items-center justify-center text-white text-sm font-medium`}>
                {index + 1}
              </div>
              <span className={`${typography.body} text-gray-900`}>{item.name}</span>
            </div>
            <div className="text-right">
              {type === 'sales' && (
                <>
                  <p className={`${typography.body} font-medium text-gray-900`}>{item.sales} units</p>
                  {item.change && (
                    <p className={`${typography.small} ${item.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {item.change}
                    </p>
                  )}
                </>
              )}
              {type === 'share' && (
                <>
                  <p className={`${typography.body} font-medium text-gray-900`}>{item.share || item.sales}</p>
                  {item.change && (
                    <p className={`${typography.small} ${item.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {item.change}
                    </p>
                  )}
                </>
              )}
              {type === 'days' && (
                <p className={`${typography.body} font-medium text-blue-600`}>{item.days} days</p>
              )}
            </div>
          </div>
        )) : (
          <div className="text-center text-gray-500 py-4">
            <p className={typography.caption}>No data available</p>
          </div>
        )}
      </div>
    </div>
  );

  const CountrySection = ({ country }) => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className={`${typography.h3} text-gray-900`}>{country.name}</h3>
        <div className="flex items-center gap-4">
          <span className={`${typography.body} text-gray-600`}>Sales: {country.sales} units</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            country.growth.startsWith('+') ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
          }`}>
            {country.growth}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RankingCard 
          title="Top 3 Brands" 
          items={country.topBrands ? country.topBrands.map((brand, i) => ({ name: brand, rank: i + 1 })) : []} 
          type="default"
        />
        <RankingCard 
          title="Top 3 Models" 
          items={country.topModels || country.fastestModels || []} 
          type={country.fastestModels ? 'days' : 'sales'}
        />
      </div>
      
      {country.note && (
        <div className={`mt-4 ${colors.warning[50]} border border-yellow-200 ${borderRadius.sm} ${spacing.sm}`}>
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-yellow-600" />
            <span className={`${typography.caption} text-yellow-800`}>{country.note}</span>
          </div>
        </div>
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'new-cars':
        return (
          <div>
            <div className="mb-8">
              <h2 className={`${typography.h1} text-gray-900 mb-2`}>New Car Market Analysis</h2>
              <p className={`${typography.body} text-gray-600 mb-6`}>
                2024 new car sales performance and top brand & model rankings across 28 European countries
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <MetricCard
                  title="Total Sales Volume"
                  value={newCarData.overall.totalSales}
                  change={newCarData.overall.growth}
                  trend="positive"
                  icon={<Car className="w-5 h-5 text-blue-600" />}
                />
                <MetricCard
                  title="Major Markets"
                  value="28 Countries"
                  icon={<Users className="w-5 h-5 text-blue-600" />}
                />
                <MetricCard
                  title="Fastest Growing Market"
                  value="Spain"
                  change="+7%"
                  trend="positive"
                  icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <RankingCard 
                  title="Europe-wide Top 3 Manufacturer Groups" 
                  items={newCarData.overall.topBrands} 
                  type="share"
                />
                <RankingCard 
                  title="Europe-wide Top 3 Popular Models" 
                  items={newCarData.overall.topModels} 
                  type="sales"
                />
              </div>
            </div>

            <div>
              <h3 className={`${typography.h2} text-gray-900 mb-6`}>Country-by-Country Detailed Analysis</h3>
              {newCarData.countries && newCarData.countries.length > 0 ? 
                newCarData.countries.map((country, index) => (
                  <CountrySection key={index} country={country} />
                )) : (
                  <div className="text-center text-gray-500 py-8">
                    <p className={typography.body}>Loading country data...</p>
                  </div>
                )
              }
            </div>
          </div>
        );

      case 'used-cars':
        return (
          <div>
            <div className="mb-8">
              <h2 className={`${typography.h1} text-gray-900 mb-2`}>Used Car Market Analysis</h2>
              <p className={`${typography.body} text-gray-600 mb-6`}>
                2024 used car sales trends and time-to-sell analysis across major European markets
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <MetricCard
                  title="Market Growth Rate"
                  value={usedCarData.overall.growth}
                  change="YoY"
                  trend="positive"
                  icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
                />
                <MetricCard
                  title="Fastest Selling Model"
                  value="Toyota C-HR"
                  change="22 days"
                  icon={<Award className="w-5 h-5 text-blue-600" />}
                />
                <MetricCard
                  title="Fastest Growing Market"
                  value="Spain"
                  change="+11.5%"
                  trend="positive"
                  icon={<Users className="w-5 h-5 text-blue-600" />}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <RankingCard 
                  title="Europe-wide Top 3 Popular Brands" 
                  items={usedCarData.overall.topBrands} 
                  type="share"
                />
                <RankingCard 
                  title="Fastest Selling Models Top 3" 
                  items={usedCarData.overall.fastestSelling} 
                  type="days"
                />
              </div>
            </div>

            <div>
              <h3 className={`${typography.h2} text-gray-900 mb-6`}>Country-by-Country Detailed Analysis</h3>
              {usedCarData.countries && usedCarData.countries.length > 0 ? 
                usedCarData.countries.map((country, index) => (
                  <CountrySection key={index} country={country} />
                )) : (
                  <div className="text-center text-gray-500 py-8">
                    <p className={typography.body}>Loading country data...</p>
                  </div>
                )
              }
            </div>
          </div>
        );

      case 'ev-market':
        return (
          <div>
            <div className="mb-8">
              <h2 className={`${typography.h1} text-gray-900 mb-2`}>Electric Vehicle Market Analysis</h2>
              <p className={`${typography.body} text-gray-600 mb-6`}>
                2024 electric vehicle sales performance and market share analysis across Europe
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <MetricCard
                  title="Total BEV Sales"
                  value={evData.overall.totalSales}
                  change={evData.overall.growth}
                  trend="negative"
                  icon={<Battery className="w-5 h-5 text-blue-600" />}
                />
                <MetricCard
                  title="Market Share"
                  value={evData.overall.marketShare}
                  icon={<BarChart3 className="w-5 h-5 text-blue-600" />}
                />
                <MetricCard
                  title="Leading Brand"
                  value="Tesla"
                  change="25%"
                  icon={<Award className="w-5 h-5 text-blue-600" />}
                />
                <MetricCard
                  title="EV-focused Market"
                  value="Norway"
                  change="89%"
                  trend="positive"
                  icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <RankingCard 
                  title="Europe-wide Top 3 EV Brands" 
                  items={evData.overall.topBrands} 
                  type="share"
                />
                <RankingCard 
                  title="Europe-wide Top 3 Popular EV Models" 
                  items={evData.overall.topModels} 
                  type="sales"
                />
              </div>
            </div>

            <div>
              <h3 className={`${typography.h2} text-gray-900 mb-6`}>Country-by-Country Detailed Analysis</h3>
              {evData.countries && evData.countries.length > 0 ? 
                evData.countries.map((country, index) => (
                  <CountrySection key={index} country={country} />
                )) : (
                  <div className="text-center text-gray-500 py-8">
                    <p className={typography.body}>Loading country data...</p>
                  </div>
                )
              }
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className={`${colors.secondary[900]} text-white ${spacing.lg}`}>
        <div className="max-w-7xl mx-auto">
          <h1 className={`${typography.display} mb-4`}>European Automotive Market Analysis Report</h1>
          <p className={`${typography.body} opacity-90`}>
            Comprehensive market trend analysis based on the latest 2023-2024 data
          </p>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className={`${colors.secondary[50]} border-b border-gray-200 ${spacing.md}`} role="tablist">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-2 overflow-x-auto">
            <TabButton
              id="new-cars"
              label="New Car Market"
              icon={<Car className="w-5 h-5" />}
              isActive={activeTab === 'new-cars'}
              onClick={setActiveTab}
            />
            <TabButton
              id="used-cars"
              label="Used Car Market"
              icon={<TrendingUp className="w-5 h-5" />}
              isActive={activeTab === 'used-cars'}
              onClick={setActiveTab}
            />
            <TabButton
              id="ev-market"
              label="EV Market"
              icon={<Battery className="w-5 h-5" />}
              isActive={activeTab === 'ev-market'}
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
      <footer className={`${colors.secondary[100]} border-t border-gray-200 ${spacing.lg} mt-16`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className={`${typography.h4} text-gray-900 mb-4`}>Data Sources</h3>
              <ul className={`${typography.caption} space-y-2`}>
                <li>• Car Sales Statistics (Best-selling-cars.com)</li>
                <li>• ACEA (European Automobile Manufacturers' Association)</li>
                <li>• JATO Dynamics</li>
                <li>• AutoVista24</li>
                <li>• eCarsTrade</li>
              </ul>
            </div>
            <div>
              <h3 className={`${typography.h4} text-gray-900 mb-4`}>Report Information</h3>
              <p className={`${typography.caption} mb-2`}>
                Last Updated: August 5, 2025
              </p>
              <p className={`${typography.caption}`}>
                Coverage Period: 2023-2024
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EuropeCarMarketDashboardEN;