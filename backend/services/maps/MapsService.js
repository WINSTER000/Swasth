const LeafletMapsProvider = require('./LeafletMapsProvider');

class MapsService {
  constructor() {
    this.provider = new LeafletMapsProvider();
    console.log(`[MapsService] Initialized with open-source provider: ${this.provider.name}`);
  }

  async getNearbyFacilities(userLat, userLng, facilities) {
    try {
      return await this.provider.getNearbyFacilities(userLat, userLng, facilities);
    } catch (err) {
      console.warn('[MapsService] Error in nearby facilities:', err.message);
      return facilities.map((f) => ({ ...f.toObject(), distanceKm: 2.5, estimatedDriveTime: '12 mins' }));
    }
  }

  async getRoute(originLat, originLng, destLat, destLng) {
    try {
      return await this.provider.getSimulatedRoute(originLat, originLng, destLat, destLng);
    } catch (err) {
      console.warn('[MapsService] Error in route:', err.message);
      return {
        provider: 'LeafletMapsProvider',
        distanceKm: 2.5,
        travelTime: '12 mins',
        steps: ['Start route', 'Proceed to facility'],
      };
    }
  }

  getConfig() {
    return {
      provider: 'LeafletMapsProvider',
      tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap contributors',
      isLeaflet: true,
    };
  }
}

module.exports = new MapsService();
