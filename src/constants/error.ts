export const MISSING_DATA = 'MISSING_DATA';
export const NOT_FOUND = 'NOT_FOUND';
export const VALIDATION_ERROR = 'VALIDATION_ERROR';

// These will be used for simple translations
export const errorCodesMap = {
  MISSING_DATA: {
    message: 'Input data is missing',
    code: 400,
  },
  NOT_FOUND: {
    message: 'Resource not found',
    code: 404,
  },
  VALIDATION_ERROR: {
    message: 'Data validation failed',
    code: 400,
  },
};
