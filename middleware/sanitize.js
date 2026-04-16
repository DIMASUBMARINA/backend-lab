const mongoSanitize = require('express-mongo-sanitize');
// const xss = require('xss-clean');

// Removes $ and . operators from req.body, req.query, req.params
const sanitizeMongo = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`Sanitized NoSQL operator: ${key} from IP: ${req.ip}`);
  }
});

// Strips <script> tags from all inputs
// const sanitizeXSS = xss();

// Strict string type validator
const strictString = (value) => {
  if (typeof value !== 'string') {
    throw new Error('Expected string, received ' + typeof value);
  }
  return value.replace(/\u0000/g, '').trim();
};

module.exports = { sanitizeMongo, strictString };