const axios = require('axios');

class GoogleMapsProvider {
  constructor(apiKey) {
    this.name = 'GoogleMapsProvider';
    this.apiKey = apiKey;
  }

  // Calculate distance between two coordinates in kilometers using Haversine formula
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }

  async getNearbyFacilities(userLat, userLng, facilities) {
    // If API key is present, try calling Google Maps Distance Matrix API
    try {
      if (this.apiKey && this.apiKey.startsWith('AIza')) {
        const origins = `${userLat},${userLng}`;
        const destinations = facilities
          .map((f) => `${f.location?.lat || userLat},${f.location?.lng || userLng}`)
          .join('|');

        const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${destinations}&key=${this.apiKey}`;
        const response = await axios.get(url, { timeout: 3000 });

        if (response.data && response.data.status === 'OK') {
          const elements = response.data.rows[0]?.elements || [];
          return facilities.map((facility, idx) => {
            const el = elements[idx];
            const distanceKm = el?.distance?.text
              ? parseFloat(el.distance.text.replace(' km', ''))
              : this.calculateDistance(
                  userLat,
                  userLng,
                  facility.location?.lat || userLat,
                  facility.location?.lng || userLng
                );
            const travelTime = el?.duration?.text || `${Math.round(distanceKm * 3 + 5)} mins`;

            return {
              ...facility.toObject(),
              distanceKm,
              estimatedDriveTime: travelTime,
            };
          });
        }
      }
    } catch (err) {
      console.warn('[GoogleMapsProvider] Distance Matrix API call warning, using calculated distance:', err.message);
    }

    // Fallback calculation using Google Maps Key + Haversine
    return facilities.map((facility) => {
      const dist = this.calculateDistance(
        userLat,
        userLng,
        facility.location?.lat || userLat,
        facility.location?.lng || userLng
      );
      return {
        ...facility.toObject(),
        distanceKm: dist,
        estimatedDriveTime: `${Math.round(dist * 3 + 5)} mins`,
      };
    });
  }

  async getSimulatedRoute(originLat, originLng, destLat, destLng) {
    try {
      if (this.apiKey && this.apiKey.startsWith('AIza')) {
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originLat},${originLng}&destination=${destLat},${destLng}&key=${this.apiKey}`;
        const response = await axios.get(url, { timeout: 3000 });

        if (response.data && response.data.status === 'OK') {
          const leg = response.data.routes[0]?.legs[0];
          return {
            provider: 'GoogleMapsProvider',
            apiKey: this.apiKey,
            distanceKm: parseFloat((leg.distance.value / 1000).toFixed(1)),
            travelTime: leg.duration.text,
            steps: leg.steps.map((s) => s.html_instructions.replace(/<[^>]*>?/gm, '')),
            embedUrl: `https://www.google.com/maps/embed/v1/directions?key=${this.apiKey}&origin=${originLat},${originLng}&destination=${destLat},${destLng}`,
          };
        }
      }
    } catch (err) {
      console.warn('[GoogleMapsProvider] Directions API call warning, using fallback route:', err.message);
    }

    const dist = this.calculateDistance(originLat, originLng, destLat, destLng);
    return {
      provider: 'GoogleMapsProvider',
      apiKey: this.apiKey,
      distanceKm: dist,
      travelTime: `${Math.round(dist * 3 + 5)} mins`,
      steps: [
        'Start at patient location',
        `Head north on Highway towards facility (${dist} km)`,
        'Turn right at Main Medical Circle',
        'Arrive at Emergency Entrance Gate',
      ],
      embedUrl: `https://www.google.com/maps/embed/v1/directions?key=${this.apiKey}&origin=${originLat},${originLng}&destination=${destLat},${destLng}`,
    };
  }
}

module.exports = GoogleMapsProvider;
