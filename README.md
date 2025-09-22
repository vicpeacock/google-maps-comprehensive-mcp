# Google Maps MCP Server

MCP Server per le API moderne di Google Maps (Places API, Routes API, Geocoding API, Elevation API).  
Supporta geocoding, ricerca luoghi, dettagli di posti, calcolo di distanze, elevazioni e percorsi.

## Tools Disponibili

### 🗺️ **8 Tools Implementati**

1. **`maps_ping`** *(Health Check)*
   - Verifica se il server MCP è attivo
   - Input: nessuno
   - Output: `"Google Maps MCP server is alive ✅"`

2. **`maps_geocode`**
   - Converte un indirizzo in coordinate geografiche
   - Input: `address` (string)
   - Output: `location`, `formatted_address`, `place_id`, `address_components`

3. **`maps_reverse_geocode`**
   - Converte coordinate in un indirizzo leggibile
   - Input:  
     - `latitude` (number)  
     - `longitude` (number)  
   - Output: `formatted_address`, `place_id`, `address_components`

4. **`maps_search_places`**
   - Ricerca luoghi tramite query testuale usando Places API (New)
   - Input: `query` (string)
   - Output: array di luoghi con `displayName`, `formattedAddress`, `location`, `types`

5. **`maps_place_details`**
   - Ottieni informazioni dettagliate su un luogo
   - Input: `place_id` (string)
   - Output: `name`, `address`, `contact info`, `ratings`, `reviews`, `opening hours`, `photos`

6. **`maps_distance_matrix`**
   - Calcola distanze e tempi tra multiple origini e destinazioni
   - Input:  
     - `origins` (string[])  
     - `destinations` (string[])
     - `mode` (optional): `"driving" | "walking" | "bicycling" | "transit"`
   - Output: matrice di `distances` e `durations`

7. **`maps_elevation`**
   - Recupera dati di elevazione per punti geografici
   - Input: `locations` (array di `{ latitude, longitude }`)
   - Output: `elevation` e `resolution` per ogni punto

8. **`maps_directions`**
   - Ottieni indicazioni stradali tra due punti usando Routes API (New)
   - Input:  
     - `origin` (string)
     - `destination` (string)
     - `travelMode` (optional): `"DRIVE" | "WALK" | "BICYCLE" | "TRANSIT"`
   - Output: `route steps`, `distance`, `duration`, `polyline`

---

## 🚀 Setup e Installazione

### 1. Ottenere una API Key
Crea una API key Google Maps abilitando:  
- **Places API (New)**
- **Routes API (New)**
- **Geocoding API**
- **Elevation API**

Segui la guida ufficiale: [Get an API Key](https://developers.google.com/maps/documentation/javascript/get-api-key#create-api-keys)

### 2. Installazione Dipendenze
```bash
npm install
```

### 3. Build del Progetto
```bash
npm run build
```

### 4. Variabile d'Ambiente
```bash
export GOOGLE_MAPS_API_KEY="your_api_key_here"
```

---

## 🔧 Uso

### Esecuzione Locale
```bash
# Con variabile d'ambiente
GOOGLE_MAPS_API_KEY="your_key" node dist/index.js

# O con export
export GOOGLE_MAPS_API_KEY="your_key"
node dist/index.js
```

### Docker
```bash
# Build dell'immagine
docker build -t google-maps-mcp .

# Esecuzione con docker-compose
GOOGLE_MAPS_API_KEY="your_key" docker-compose up

# Esecuzione diretta
docker run --rm -it -e GOOGLE_MAPS_API_KEY="your_key" google-maps-mcp
```

---

## 🎯 Configurazione MCP Client

### Claude Desktop
```json
{
  "mcpServers": {
    "google-maps": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "/path/to/google-maps-mcp",
      "env": {
        "GOOGLE_MAPS_API_KEY": "your_api_key"
      }
    }
  }
}
```

### LM Studio
```json
{
  "mcpServers": {
    "google-maps": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "/Users/pallotta/mcp-servers/google-maps",
      "env": {
        "GOOGLE_MAPS_API_KEY": "your_api_key"
      }
    }
  }
}
```

### Docker (Claude Desktop)
```json
{
  "mcpServers": {
    "google-maps": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "-e", "GOOGLE_MAPS_API_KEY=your_api_key",
        "google-maps-mcp"
      ]
    }
  }
}
```

---

## 🧪 Test

Il server è stato testato con successo e tutti i tool funzionano correttamente:

- ✅ **maps_ping** - Health check
- ✅ **maps_geocode** - Address → Coordinates
- ✅ **maps_reverse_geocode** - Coordinates → Address  
- ✅ **maps_search_places** - Place search
- ✅ **maps_place_details** - Detailed place info
- ✅ **maps_distance_matrix** - Distance/time matrix
- ✅ **maps_elevation** - Elevation data
- ✅ **maps_directions** - Route directions

---

## 📋 API Utilizzate

- **Google Places API (New)** - Per ricerca luoghi e dettagli
- **Google Routes API (New)** - Per indicazioni stradali
- **Google Geocoding API** - Per conversione indirizzi ↔ coordinate
- **Google Elevation API** - Per dati di elevazione

---

## 🔒 Sicurezza

⚠️ **Importante**: Non committare mai la tua API key nel repository. Usa sempre variabili d'ambiente.

---

## 📝 Note

- Il server utilizza **stdio transport** per la comunicazione MCP
- Supporta **CommonJS** per compatibilità
- Tutti i tool restituiscono dati in formato JSON
- Gestione errori completa per tutte le API calls

---

## 🆘 Troubleshooting

### Errore: "GOOGLE_MAPS_API_KEY environment variable is required"
- Assicurati di aver impostato la variabile d'ambiente
- Verifica che l'API key sia valida e abilitata

### Errore: "Tool not found"
- Verifica che il server sia stato buildato correttamente: `npm run build`
- Controlla che tutti i tool siano implementati nel codice

### Problemi Docker
- Se il container non ha i tool aggiornati, esegui: `docker build --no-cache -t google-maps-mcp .`
- Verifica che la variabile d'ambiente sia passata correttamente al container
