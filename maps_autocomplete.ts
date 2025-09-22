import { Tool } from "@modelcontextprotocol/sdk";
import fetch from "node-fetch";

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || "";

export const maps_autocomplete: Tool = {
  name: "maps_autocomplete",
  description: "Get autocomplete predictions for place queries using Google Places API (new).",
  inputSchema: {
    type: "object",
    properties: {
      input: {
        type: "string",
        description: "Partial text input to get autocomplete suggestions (e.g., 'Grandson ch')"
      }
    },
    required: ["input"]
  },
  async execute({ input }) {
    if (!GOOGLE_MAPS_API_KEY) {
      return [
        {
          type: "text",
          text: "Error: GOOGLE_MAPS_API_KEY not set in environment variables."
        }
      ];
    }

    try {
      const url = `https://places.googleapis.com/v1/places:autocomplete`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
          "X-Goog-FieldMask": "suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat"
        },
        body: JSON.stringify({
          input
        })
      });

      const data = await response.json();

      if (!data.suggestions || data.suggestions.length === 0) {
        return [
          {
            type: "text",
            text: `No autocomplete suggestions for input: ${input}`
          }
        ];
      }

      return [
        {
          type: "text",
          text: data.suggestions
            .map(
              (s: any) =>
                `🔎 ${s.placePrediction?.text?.text || "Unknown"} (Place ID: ${s.placePrediction?.placeId})`
            )
            .join("\n")
        }
      ];
    } catch (err: any) {
      return [
        {
          type: "text",
          text: `Error calling Autocomplete API: ${err.message}`
        }
      ];
    }
  }
};