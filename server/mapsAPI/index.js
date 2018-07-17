const config = require('@config/config');
const googleMapsClient = require('@google/maps').createClient({
  key: config.gmApiKey
});

/**
 * Returns decoded address into GeoJSON object
 */
function decodeAddress(address) {
  return new Promise((resolve, reject) => {
    googleMapsClient.geocode({ address, language: 'en', region: 'sg' }, (err, result) => {
      if (err) return reject(err);
      return resolve(result.json.results[0]);
    });
  });
}

module.exports = { decodeAddress };
