import { type DataSource, type MetricType } from './thesis-scoring';

export interface DataSourceIndicator {
  label: string;
  source: DataSource;
  identifier: string;
  description: string;
  metric_type: MetricType;
}

/**
 * Curated list of data source indicators from FRED and Yahoo Finance.
 * Used to pre-populate data source selections in the admin create form.
 */
export const DATA_SOURCE_INDICATORS: DataSourceIndicator[] = [
  // FRED Economic Data
  {
    label: 'Federal Funds Rate',
    source: 'fred',
    identifier: 'FEDFUNDS',
    description: 'Effective federal funds rate set by the Federal Reserve',
    metric_type: 'rate',
  },
  {
    label: 'CPI / Inflation',
    source: 'fred',
    identifier: 'CPIAUCSL',
    description: 'Consumer Price Index for All Urban Consumers (seasonally adjusted)',
    metric_type: 'rate',
  },
  {
    label: 'Unemployment Rate',
    source: 'fred',
    identifier: 'UNRATE',
    description: 'U.S. civilian unemployment rate',
    metric_type: 'percentage',
  },
  {
    label: '10-Year Treasury Yield',
    source: 'fred',
    identifier: 'DGS10',
    description: '10-year U.S. Treasury constant maturity yield',
    metric_type: 'rate',
  },
  {
    label: '2-Year Treasury Yield',
    source: 'fred',
    identifier: 'DGS2',
    description: '2-year U.S. Treasury constant maturity yield',
    metric_type: 'rate',
  },
  {
    label: 'Real GDP Growth',
    source: 'fred',
    identifier: 'A191RL1Q225SBEA',
    description: 'Real GDP percent change (seasonally adjusted annual rate)',
    metric_type: 'percentage',
  },
  {
    label: 'Core PCE Inflation',
    source: 'fred',
    identifier: 'PCEPILFE',
    description: "Personal Consumption Expenditures excluding food and energy (Fed's preferred inflation gauge)",
    metric_type: 'rate',
  },
  // Yahoo Finance Market Data
  {
    label: 'S&P 500',
    source: 'yahoo_finance',
    identifier: '^GSPC',
    description: 'S&P 500 index price',
    metric_type: 'price',
  },
  {
    label: 'Nasdaq 100',
    source: 'yahoo_finance',
    identifier: '^NDX',
    description: 'Nasdaq 100 index price',
    metric_type: 'price',
  },
  {
    label: 'Dow Jones',
    source: 'yahoo_finance',
    identifier: '^DJI',
    description: 'Dow Jones Industrial Average index price',
    metric_type: 'price',
  },
  {
    label: 'VIX (Volatility Index)',
    source: 'yahoo_finance',
    identifier: '^VIX',
    description: 'CBOE Volatility Index — market fear gauge',
    metric_type: 'custom',
  },
  {
    label: 'Gold Futures',
    source: 'yahoo_finance',
    identifier: 'GC=F',
    description: 'Gold futures price (front month)',
    metric_type: 'price',
  },
  {
    label: 'Crude Oil WTI',
    source: 'yahoo_finance',
    identifier: 'CL=F',
    description: 'West Texas Intermediate crude oil futures price',
    metric_type: 'price',
  },
  {
    label: 'USD/EUR Exchange Rate',
    source: 'yahoo_finance',
    identifier: 'EURUSD=X',
    description: 'Euro to US Dollar exchange rate',
    metric_type: 'price',
  },
];

/**
 * Look up a curated indicator by its source identifier string.
 * Returns undefined if no match is found (e.g., for custom indicators).
 */
export function getIndicatorByIdentifier(identifier: string): DataSourceIndicator | undefined {
  return DATA_SOURCE_INDICATORS.find((ind) => ind.identifier === identifier);
}
