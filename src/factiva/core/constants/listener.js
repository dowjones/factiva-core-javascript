//TIMESTAMP
const TIMESTAMP_FIELDS = [
  'ingestion_datetime',
  'modification_date',
  'modification_datetime',
  'publication_date',
  'publication_datetime',
];

//Multivalue
const MULTIVALUE_FIELDS_COMMA = [
  'company_codes',
  'subject_codes',
  'region_codes',
  'industry_codes',
  'person_codes',
  'currency_codes',
  'market_index_codes',
  'company_codes_about',
  'company_codes_association',
  'company_codes_lineage',
  'company_codes_occur',
  'company_codes_relevance',
  'company_codes_about_cusip',
  'company_codes_association_cusip',
  'company_codes_lineage_cusip',
  'company_codes_occur_cusip',
  'company_codes_relevance_cusip',
  'company_codes_cusip',
  'company_codes_about_isin',
  'company_codes_association_isin',
  'company_codes_lineage_isin',
  'company_codes_occur_isin',
  'company_codes_relevance_isin',
  'company_codes_isin',
  'company_codes_about_ticker_exchange',
  'company_codes_association_ticker_exchange',
  'company_codes_lineage_ticker_exchange',
  'company_codes_occur_ticker_exchange',
  'company_codes_relevance_ticker_exchange',
  'company_codes_ticker_exchange',
  'company_codes_about_sedol',
  'company_codes_association_sedol',
  'company_codes_lineage_sedol',
  'company_codes_occur_sedol',
  'company_codes_relevance_sedol',
  'company_codes_sedol',
];

const MULTIVALUE_FIELDS_SPACE = ['region_of_origin'];

const ADD_ACTION = 'add';
const REP_ACTION = 'rep';
const DEL_ACTION = 'del';
const ERR_ACTION = 'error';
const ALLOWED_ACTIONS = [ADD_ACTION, REP_ACTION, DEL_ACTION];
const ACTION_CONSOLE_INDICATOR = {};
ACTION_CONSOLE_INDICATOR[ADD_ACTION] = '.';
ACTION_CONSOLE_INDICATOR[REP_ACTION] = ':';
ACTION_CONSOLE_INDICATOR[DEL_ACTION] = '&';
ACTION_CONSOLE_INDICATOR[ERR_ACTION] = '!';

module.exports = {
  TIMESTAMP_FIELDS,
  MULTIVALUE_FIELDS_COMMA,
  MULTIVALUE_FIELDS_SPACE,
  ALLOWED_ACTIONS,
  ACTION_CONSOLE_INDICATOR,
  ERR_ACTION,
};
