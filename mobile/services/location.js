import * as Location from 'expo-location';

export const PRESET_LOCATIONS = [
  {
    name: 'No. 42, Crosscut Road, Gandhipuram, Coimbatore, Coimbatore District, Tamil Nadu - 641012',
    shortName: 'Coimbatore',
    latitude: 11.0168,
    longitude: 76.9558,
  },
  {
    name: 'Door No. 18, Palakkad Main Road, Uzhavar Sandhai Complex, Pollachi, Coimbatore District, Tamil Nadu - 642001',
    shortName: 'Pollachi',
    latitude: 10.6609,
    longitude: 77.0048,
  },
  {
    name: 'Plot No. 7, Ooty Main Road, Produce Yard, Mettupalayam, Coimbatore District, Tamil Nadu - 641301',
    shortName: 'Mettupalayam',
    latitude: 11.2996,
    longitude: 76.9400,
  },
  {
    name: 'No. 105, Kamaraj Road, Commodity Market Area, Tiruppur, Tiruppur District, Tamil Nadu - 641604',
    shortName: 'Tiruppur',
    latitude: 11.1085,
    longitude: 77.3411,
  },
  {
    name: 'Door No. 88, Brough Road, Grain Market Yard, Erode, Erode District, Tamil Nadu - 638001',
    shortName: 'Erode',
    latitude: 11.3410,
    longitude: 77.7172,
  },
  {
    name: 'No. 23, Junction Main Road, Fairlands, Salem, Salem District, Tamil Nadu - 636016',
    shortName: 'Salem',
    latitude: 11.6643,
    longitude: 78.1460,
  },
  {
    name: 'Door No. 54, Mattuthavani Market Road, K.K. Nagar, Madurai, Madurai District, Tamil Nadu - 625020',
    shortName: 'Madurai',
    latitude: 9.9252,
    longitude: 78.1198,
  },
  {
    name: 'No. 12, GT Road, Vegetable Yard, Dindigul, Dindigul District, Tamil Nadu - 624001',
    shortName: 'Dindigul',
    latitude: 10.3673,
    longitude: 77.9803,
  },
];

/**
 * Formats Expo reverse geocode object into a full detailed street address.
 */
const formatExpoGeocode = (place) => {
  if (!place) return null;
  const parts = [];

  const streetNo = place.streetNumber || place.name;
  if (streetNo && /^\d+/.test(streetNo)) {
    parts.push(`No. ${streetNo}`);
  }

  if (place.street && place.street !== streetNo) {
    parts.push(place.street);
  } else if (place.name && place.name !== streetNo && !/^\d+/.test(place.name)) {
    parts.push(place.name);
  }

  if (place.subregion || place.district) {
    const sub = place.subregion || place.district;
    if (!parts.includes(sub)) parts.push(sub);
  }

  if (place.city) {
    if (!parts.includes(place.city)) parts.push(place.city);
  }

  if (place.region) {
    parts.push(place.region);
  }

  let result = parts.join(', ');
  if (place.postalCode) {
    result += ` - ${place.postalCode}`;
  }

  return parts.length >= 2 ? result : null;
};

/**
 * Formats OpenStreetMap Nominatim reverse geocode JSON into a full detailed street address.
 */
/**
 * Formats OpenStreetMap Nominatim reverse geocode JSON into a full detailed street address.
 */
const formatNominatimGeocode = (data) => {
  if (!data || data.error) return null;

  if (data.address) {
    const addr = data.address;
    const parts = [];

    if (addr.house_number || addr.building) {
      parts.push(`No. ${addr.house_number || addr.building}`);
    }

    if (addr.road || addr.pedestrian || addr.street) {
      parts.push(addr.road || addr.pedestrian || addr.street);
    }

    if (addr.suburb || addr.neighbourhood || addr.quarter) {
      parts.push(addr.suburb || addr.neighbourhood || addr.quarter);
    }

    if (addr.city || addr.town || addr.village) {
      parts.push(addr.city || addr.town || addr.village);
    }

    if (addr.county || addr.state_district) {
      const distName = (addr.county || addr.state_district).replace(/ District$/i, '');
      parts.push(`${distName} District`);
    }

    if (addr.state) {
      parts.push(addr.state);
    }

    let result = parts.join(', ');
    if (addr.postcode) {
      result += ` - ${addr.postcode}`;
    }

    if (parts.length >= 1) return result;

    if (addr.natural || addr.water || addr.ocean || addr.sea || addr.bay) {
      const waterFeature = addr.natural || addr.water || addr.ocean || addr.sea || addr.bay;
      return addr.state ? `${waterFeature}, ${addr.state}` : waterFeature;
    }
  }

  if (data.display_name && !data.display_name.toLowerCase().includes('unable to geocode')) {
    return data.display_name;
  }

  return null;
};

/**
 * Fallback nearest location with full street address formatting.
 */
const getNearestDetailedAddress = (lat, lon) => {
  let minDistance = Infinity;
  let nearestLoc = PRESET_LOCATIONS[0];

  PRESET_LOCATIONS.forEach((loc) => {
    const dLat = loc.latitude - lat;
    const dLon = loc.longitude - lon;
    const dist = Math.sqrt(dLat * dLat + dLon * dLon);
    if (dist < minDistance) {
      minDistance = dist;
      nearestLoc = loc;
    }
  });

  return nearestLoc.name;
};

export const getGPSLocation = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return {
        success: false,
        permissionDenied: true,
        error: 'Location permission is required to find nearby markets. You can also select your location manually.',
      };
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const latitude = location.coords.latitude;
    const longitude = location.coords.longitude;
    let locationName = null;

    // 1. Try Expo Reverse Geocoding
    try {
      const geocodeList = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (geocodeList && geocodeList.length > 0) {
        locationName = formatExpoGeocode(geocodeList[0]);
      }
    } catch (gErr) {
      // Ignore Expo geocode error
    }

    // 2. Try OpenStreetMap Nominatim API if Expo reverse geocode didn't return street level details
    if (!locationName) {
      try {
        const nomUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`;
        const response = await fetch(nomUrl, {
          headers: { 'User-Agent': 'FarmPulseApp/1.0' },
        });
        if (response.ok) {
          const data = await response.json();
          locationName = formatNominatimGeocode(data);
        }
      } catch (nomErr) {
        // Ignore Nominatim fetch error
      }
    }

    // 3. Fallback for coordinates if reverse geocoding returns no location name
    if (!locationName) {
      const latFormatted = `${Math.abs(latitude).toFixed(4)}° ${latitude >= 0 ? 'N' : 'S'}`;
      const lonFormatted = `${Math.abs(longitude).toFixed(4)}° ${longitude >= 0 ? 'E' : 'W'}`;
      locationName = `GPS Location (${latFormatted}, ${lonFormatted})`;
    }

    return {
      success: true,
      data: {
        latitude,
        longitude,
        locationName,
      },
    };
  } catch (err) {
    return {
      success: false,
      permissionDenied: false,
      error: err.message || 'Failed to retrieve GPS location.',
    };
  }
};

/**
 * Searches locations by typing place name via Nominatim search API with preset fallbacks.
 */
export const searchLocationByName = async (query) => {
  if (!query || query.trim().length < 2) return [];
  const qStr = query.trim();

  // Check preset matches first
  const presetMatches = PRESET_LOCATIONS.filter(p => 
    p.name.toLowerCase().includes(qStr.toLowerCase()) || 
    p.shortName.toLowerCase().includes(qStr.toLowerCase())
  );

  try {
    const qEncoded = encodeURIComponent(`${qStr}, Tamil Nadu, India`);
    const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${qEncoded}&addressdetails=1&limit=5`;
    const response = await fetch(nomUrl, {
      headers: { 'User-Agent': 'FarmPulseApp/1.0' },
    });
    if (response.ok) {
      const data = await response.json();
      const apiResults = data.map((item) => {
        const formatted = formatNominatimGeocode(item) || item.display_name;
        return {
          name: formatted,
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
        };
      });

      // Combine preset matches + api results deduplicated
      const combined = [...presetMatches, ...apiResults];
      const seen = new Set();
      return combined.filter(item => {
        const key = `${item.latitude.toFixed(3)}_${item.longitude.toFixed(3)}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }
  } catch (err) {
    console.log('Location search warning:', err);
  }

  return presetMatches;
};

// LRU In-Memory Geocoding Cache (Max 50 items)
const GEOCODE_CACHE = new Map();
const MAX_CACHE_SIZE = 50;

/**
 * Reverse geocodes latitude/longitude coordinates with LRU caching and AbortController signal support.
 */
export const reverseGeocodeCoords = async (lat, lon, signal = null) => {
  const cacheKey = `${parseFloat(lat).toFixed(4)}_${parseFloat(lon).toFixed(4)}`;

  // 1. Check LRU Cache
  if (GEOCODE_CACHE.has(cacheKey)) {
    return GEOCODE_CACHE.get(cacheKey);
  }

  try {
    const nomUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;
    const response = await fetch(nomUrl, {
      headers: { 'User-Agent': 'FarmPulseApp/1.0' },
      signal: signal || undefined,
    });

    if (response.ok) {
      const data = await response.json();
      if (data && !data.error) {
        const formatted = formatNominatimGeocode(data);

        if (formatted) {
          // Maintain LRU Cache size
          if (GEOCODE_CACHE.size >= MAX_CACHE_SIZE) {
            const firstKey = GEOCODE_CACHE.keys().next().value;
            GEOCODE_CACHE.delete(firstKey);
          }
          GEOCODE_CACHE.set(cacheKey, formatted);
          return formatted;
        }
      }
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      return null; // Aborted request
    }
  }

  // Fallback for pinned ocean / unmapped coordinates
  const latFormatted = `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? 'N' : 'S'}`;
  const lonFormatted = `${Math.abs(lon).toFixed(4)}° ${lon >= 0 ? 'E' : 'W'}`;
  const fallback = `Offshore / Pinned Location (${latFormatted}, ${lonFormatted})`;

  GEOCODE_CACHE.set(cacheKey, fallback);
  return fallback;
};


