import fetch from 'node-fetch';

const MAPBOX_API_KEY = 'pk.eyJ1IjoiZXRoYW4yODUiLCJhIjoiY204ODlqYWZoMGhocDJscTFpYjUxdTBocSJ9.4u8TUl68gG9hX6ANJKaOdw';

// Route to fetch POIs from Mapbox
const fetchPois = async (req, res) => {

  // Get coordinates from the query
  const {lat, lon} = req.query

  if (!lat || !lon) {
    return res.status(400).json({ success: false, message: "Latitude and longitude are required" });
  }

  // Calculate the bounding box (search radius of 1km)
  const radiusKm = 1;
  const latNum = parseFloat(lat);
  const lonNum = parseFloat(lon);
  const latDelta = radiusKm / 110.57;
  const lonDelta = radiusKm / (111.32 * Math.cos(latNum * (Math.PI / 180)));
  const bbox = `${lonNum - lonDelta},${latNum - latDelta},${lonNum + lonDelta},${latNum + latDelta}`;

  console.log(`Bounding Box: ${lonNum - lonDelta},${latNum - latDelta},${lonNum + lonDelta},${latNum + latDelta}`);

  // Create URL for MapBox API
  // Uses the category search from the Search Box API: https://docs.mapbox.com/api/search/search-box/
  const categories = "coffee,restaurant" // TODO: Implement filter
  // const apiUrl = `https://api.mapbox.com/search/searchbox/v1/category/${categories}?proximity=${lon},${lat}&access_token=${MAPBOX_API_KEY}`;
  const apiUrl = `https://api.mapbox.com/search/searchbox/v1/category/${categories}?bbox=${bbox}&limit=25&access_token=${MAPBOX_API_KEY}`;

  try {
    console.log("Fetching POIs from Mapbox...");
    const response = await fetch(apiUrl);

    if (!response.ok) {
      console.log("Error fetching POIs");
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    // Store POIs as a JSON file and return to client
    const data = await response.json();

    res.json({
      success: true,
      message: `${data.features.length} POIs successfully retrieved`,
      pois: data.features
    });
  } catch (error) {
    console.log("Error: " + error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { fetchPois };
