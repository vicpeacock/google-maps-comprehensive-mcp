import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { fetch } from "undici";

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
if (!GOOGLE_MAPS_API_KEY) {
  throw new Error("GOOGLE_MAPS_API_KEY environment variable is required");
}

const server = new McpServer({
  name: "google-maps",
  version: "1.0.0",
});

/**
 * ROUTES API (Directions)
 */
server.registerTool("maps_directions", {
  description: "Get directions between two locations using Google Routes API",
  inputSchema: {
    origin: z.string().describe("Origin address"),
    destination: z.string().describe("Destination address"),
    travelMode: z.enum(["DRIVE", "WALK", "BICYCLE", "TRANSIT"]).optional().default("DRIVE").describe("Travel mode"),
  },
}, async ({
  origin,
  destination,
  travelMode = "DRIVE",
}: {
  origin: string;
  destination: string;
  travelMode?: "DRIVE" | "WALK" | "BICYCLE" | "TRANSIT";
}) => {
  const url = "https://routes.googleapis.com/directions/v2:computeRoutes";

  const body = {
    origin: { address: origin },
    destination: { address: destination },
    travelMode: travelMode || "DRIVE",
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
      "X-Goog-FieldMask":
        "routes.duration,routes.distanceMeters,routes.polyline,routes.legs",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    return {
      content: [{ type: "text", text: `Directions request failed: ${response.statusText}` }]
    };
  }

  const data = await response.json();
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
  };
});

/**
 * PLACES API (Text Search)
 */
server.registerTool("maps_search_places", {
  description: "Search places using Google Places API (New)",
  inputSchema: {
    query: z.string().describe("Search query for places"),
  },
}, async ({ query }: { query: string }) => {
  const url = "https://places.googleapis.com/v1/places:searchText";
  const body = { textQuery: query };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
      "X-Goog-FieldMask":
        "places.displayName,places.formattedAddress,places.location,places.types",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    return {
      content: [{ type: "text", text: `Places search failed: ${response.statusText}` }]
    };
  }

  const data = await response.json();
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
  };
});

/**
 * REVERSE GEOCODING
 */
server.registerTool("maps_reverse_geocode", {
  description: "Get address from latitude/longitude using Google Places Nearby",
  inputSchema: {
    latitude: z.number().describe("Latitude coordinate"),
    longitude: z.number().describe("Longitude coordinate"),
  },
}, async ({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) => {
  const url = "https://places.googleapis.com/v1/places:searchNearby";

  const body = {
    locationRestriction: {
      circle: {
        center: { latitude, longitude },
        radius: 50,
      },
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
      "X-Goog-FieldMask":
        "places.displayName,places.formattedAddress,places.location",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    return {
      content: [{ type: "text", text: `Reverse geocoding failed: ${response.statusText}` }]
    };
  }

  const data = await response.json();
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
  };
});

/**
 * GEOCODING (Address to Coordinates)
 */
server.registerTool("maps_geocode", {
  description: "Convert address to coordinates using Google Geocoding API",
  inputSchema: {
    address: z.string().describe("Address to geocode"),
  },
}, async ({ address }: { address: string }) => {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;

  const response = await fetch(url);

  if (!response.ok) {
    return {
      content: [{ type: "text", text: `Geocoding request failed: ${response.statusText}` }]
    };
  }

  const data = await response.json();
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
  };
});

/**
 * PLACE DETAILS
 */
server.registerTool("maps_place_details", {
  description: "Get detailed information about a place using Google Places API",
  inputSchema: {
    place_id: z.string().describe("Google Place ID"),
  },
}, async ({ place_id }: { place_id: string }) => {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=name,formatted_address,geometry,rating,user_ratings_total,price_level,opening_hours,photos,reviews,website,formatted_phone_number,international_phone_number&key=${GOOGLE_MAPS_API_KEY}`;

  const response = await fetch(url);

  if (!response.ok) {
    return {
      content: [{ type: "text", text: `Place details request failed: ${response.statusText}` }]
    };
  }

  const data = await response.json();
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
  };
});

/**
 * DISTANCE MATRIX
 */
server.registerTool("maps_distance_matrix", {
  description: "Calculate distances and travel times between multiple origins and destinations",
  inputSchema: {
    origins: z.array(z.string()).describe("Array of origin addresses"),
    destinations: z.array(z.string()).describe("Array of destination addresses"),
    mode: z.enum(["driving", "walking", "bicycling", "transit"]).optional().default("driving").describe("Travel mode"),
  },
}, async ({
  origins,
  destinations,
  mode = "driving",
}: {
  origins: string[];
  destinations: string[];
  mode?: "driving" | "walking" | "bicycling" | "transit";
}) => {
  const originsParam = origins.map(addr => encodeURIComponent(addr)).join("|");
  const destinationsParam = destinations.map(addr => encodeURIComponent(addr)).join("|");
  
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originsParam}&destinations=${destinationsParam}&mode=${mode}&key=${GOOGLE_MAPS_API_KEY}`;

  const response = await fetch(url);

  if (!response.ok) {
    return {
      content: [{ type: "text", text: `Distance matrix request failed: ${response.statusText}` }]
    };
  }

  const data = await response.json();
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
  };
});

/**
 * ELEVATION
 */
server.registerTool("maps_elevation", {
  description: "Get elevation data for geographic points using Google Elevation API",
  inputSchema: {
    locations: z.array(z.object({
      latitude: z.number().describe("Latitude coordinate"),
      longitude: z.number().describe("Longitude coordinate"),
    })).describe("Array of locations to get elevation for"),
  },
}, async ({ locations }: { locations: Array<{ latitude: number; longitude: number }> }) => {
  const locationsParam = locations.map(loc => `${loc.latitude},${loc.longitude}`).join("|");
  const url = `https://maps.googleapis.com/maps/api/elevation/json?locations=${locationsParam}&key=${GOOGLE_MAPS_API_KEY}`;

  const response = await fetch(url);

  if (!response.ok) {
    return {
      content: [{ type: "text", text: `Elevation request failed: ${response.statusText}` }]
    };
  }

  const data = await response.json();
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
  };
});

/**
 * HEALTH CHECK
 */
server.registerTool("maps_ping", {
  description: "Check if the Google Maps MCP server is alive",
  inputSchema: {},
}, async () => {
  return {
    content: [{ type: "text", text: "Google Maps MCP server is alive ✅" }]
  };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // MCP servers should not output to stdout except for JSON-RPC messages
}

main().catch((error) => {
  // Use stderr for error logging to avoid interfering with MCP protocol
  process.stderr.write(`Server error: ${error.message}\n`);
  process.exit(1);
});
