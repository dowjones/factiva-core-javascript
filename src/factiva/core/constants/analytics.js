// ANALYTICS
const API_AVRO_FORMAT = 'avro';
const API_CSV_FORMAT = 'csv';
const API_JSON_FORMAT = 'json';
const API_EXTRACTION_FILE_FORMATS = [
  API_AVRO_FORMAT,
  API_JSON_FORMAT,
  API_CSV_FORMAT,
];

const API_DAY_PERIOD = 'DAY';
const API_MONTH_PERIOD = 'MONTH';
const API_YEAR_PERIOD = 'YEAR';
const API_DATETIME_PERIODS = [
  API_DAY_PERIOD,
  API_MONTH_PERIOD,
  API_YEAR_PERIOD,
];

const API_PUBLICATION_DATETIME_FIELD = 'publication_datetime';
const API_MODIFICATION_DATETIME_FIELD = 'modification_datetime';
const API_INGESTION_DATETIME_FIELD = 'ingestion_datetime';
const API_DATETIME_FIELDS = [
  API_PUBLICATION_DATETIME_FIELD,
  API_MODIFICATION_DATETIME_FIELD,
  API_INGESTION_DATETIME_FIELD,
];

const API_GROUP_DIMENSIONS_FIELDS = [
  'source_code',
  'subject_codes',
  'region_codes',
  'industry_codes',
  'company_codes',
  'person_codes',
  'company_codes_about',
  'company_codes_relevance',
  'company_codes_cusip',
  'company_codes_isin',
  'company_codes_sedol',
  'company_codes_ticker',
  'company_codes_about_cusip',
  'company_codes_about_isin',
  'company_codes_about_sedol',
  'company_codes_about_ticker',
  'company_codes_relevance_cusip',
  'company_codes_relevance_isin',
  'company_codes_relevance_sedol',
  'company_codes_relevance_ticker',
];

module.exports = {
  API_AVRO_FORMAT,
  API_CSV_FORMAT,
  API_JSON_FORMAT,
  API_DAY_PERIOD,
  API_MONTH_PERIOD,
  API_YEAR_PERIOD,
  API_PUBLICATION_DATETIME_FIELD,
  API_MODIFICATION_DATETIME_FIELD,
  API_INGESTION_DATETIME_FIELD,
  API_EXTRACTION_FILE_FORMATS,
  API_DATETIME_PERIODS,
  API_DATETIME_FIELDS,
  API_GROUP_DIMENSIONS_FIELDS
};
