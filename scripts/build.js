// Keep existing lint warnings visible without failing the portfolio deployment.
// This does not suppress compilation or module-resolution errors.
process.env.CI = 'false';
require('react-scripts/scripts/build');
