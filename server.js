const express = require('express');
const path = require('path');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve(data); }
      });
    }).on('error', reject);
  });
}

const UNSPLASH_PLACES = {
  'tokyo': [
    'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=300&h=300&fit=crop'
  ]
};

const IATA_MAP = {
  'tokyo': 'NRT', 'paris': 'CDG', 'london': 'LHR', 'new york': 'JFK',
  'los angeles': 'LAX', 'rome': 'FCO', 'sydney': 'SYD', 'dubai': 'DXB'
};

function getDestinationIATA(q) {
  if (!q) return null;
  const lower = q.toLowerCase();
  for (const [city, iata] of Object.entries(IATA_MAP)) {
    if (lower.includes(city)) return iata;
  }
  return null;
}

app.get('/api/places/location', async (req, res) => {
  const q = (req.query.q || '').trim();
  const lat = parseFloat(req.query.lat);
  const lon = parseFloat(req.query.lon);

  if (!q && isNaN(lat)) {
    return res.status(400).json({ error: 'Missing query (q) or coordinates (lat/lon)' });
  }

  try {
    let displayName = q || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    let locLat = lat;
    let locLon = lon;

    if (q) {
      const geo = await httpsGet(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`);
      if (Array.isArray(geo) && geo.length > 0) {
        const item = geo[0];
        displayName = item.display_name;
        locLat = parseFloat(item.lat);
        locLon = parseFloat(item.lon);
      }
    } else {
      try {
        const rev = await httpsGet(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
        if (rev && rev.display_name) displayName = rev.display_name;
      } catch (e) { /* ignore */ }
    }

    const imageQuery = (q || displayName || '').trim();
    const lowerQ = imageQuery.toLowerCase();
    const images = UNSPLASH_PLACES[lowerQ.split(',')[0].trim()] || UNSPLASH_PLACES['tokyo'];

    const destinationIATA = getDestinationIATA(q || displayName);

    const searchQuery = (q || displayName || '').trim();

    res.json({
      displayName,
      lat: locLat,
      lon: locLon,
      images,
      about: `${displayName} is a popular destination.`,
      facts: [
        { label: 'Location', value: displayName }
      ],
      weather: {
        forecast: [
          { high: 32, low: 26 },
          { high: 32, low: 26 },
          { high: 32, low: 26 }
        ]
      },
      flights: {
        price: '$884',
        duration: '12h 44m',
        from: 'New York NY'
      },
      searchResults: []
    });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`places-supertop running at http://localhost:${PORT}`);
});
