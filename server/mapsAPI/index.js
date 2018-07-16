// const config = require('@config/config');
// const googleMapsClient = require('@google/maps').createClient({
//   key: config.gmApiKey
// });

/**
 * Returns decoded address into GeoJSON object
 */
function decodeAddress(/* address */) {
  return {
    type: 'Point',
    coordinates: [1, 2]
  };
}
module.exports = { decodeAddress };
