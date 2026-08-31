/**
 * MockMapsProvider
 * Distance calculation, travel time, and route simulation for facility discovery
 */
class MockMapsProvider {
  constructor() {
    this.name = 'MockMapsProvider';
  }

  // Haversine formula distance calculation in kilometers
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }

  calculateTravelTime(distanceKm, mode = 'DRIVING') {
    const speedKmH = mode === 'WALKING' ? 4 : mode === 'AMBULANCE' ? 60 : 35;
    const hours = distanceKm / speedKmH;
    const minutes = Math.round(hours * 60);
    return `${minutes} mins`;
  }

  async getNearbyFacilities(userLat, userLng, facilities = []) {
    return facilities.map((facility) => {
      const dist = this.calculateDistance(
        userLat,
        userLng,
        facility.location.lat,
        facility.location.lng
      );
      return {
        ...facility._doc || facility,
        distanceKm: dist,
        estimatedDriveTime: this.calculateTravelTime(dist, 'DRIVING'),
        ambulanceTime: this.calculateTravelTime(dist, 'AMBULANCE'),
      };
    }).sort((a, b) => a.distanceKm - b.distanceKm);
  }

  async getSimulatedRoute(originLat, originLng, destLat, destLng) {
    const distanceKm = this.calculateDistance(originLat, originLng, destLat, destLng);
    return {
      origin: { lat: originLat, lng: originLng },
      destination: { lat: destLat, lng: destLng },
      distanceKm,
      travelTime: this.calculateTravelTime(distanceKm, 'DRIVING'),
      steps: [
        `Head north on State Highway toward facility (${Math.round(distanceKm * 0.4 * 10) / 10} km)`,
        `Turn right at PHC Junction (${Math.round(distanceKm * 0.4 * 10) / 10} km)`,
        `Arrive at healthcare facility (${Math.round(distanceKm * 0.2 * 10) / 10} km)`
      ]
    };
  }
}

module.exports = MockMapsProvider;
