import { useEffect, useRef, useState } from "react";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import SceneView from "@arcgis/core/views/SceneView";
import Graphic from "@arcgis/core/Graphic";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Point from "@arcgis/core/geometry/Point";
import GeoJSONLayer from "@arcgis/core/layers/GeoJSONLayer";

import Home from "@arcgis/core/widgets/Home";
import AreaMeasurement2D from "@arcgis/core/widgets/AreaMeasurement2D";
import DistanceMeasurement2D from "@arcgis/core/widgets/DistanceMeasurement2D";
import Expand from "@arcgis/core/widgets/Expand";
import BasemapGallery from "@arcgis/core/widgets/BasemapGallery";
import Bookmarks from "@arcgis/core/widgets/Bookmarks";
import Bookmark from "@arcgis/core/webmap/Bookmark";

import esriConfig from "@arcgis/core/config.js"; 
esriConfig.apiKey = 'AAPTxy8BH1VEsoebNVZXo8HurAU2wRtTCz35rS0IvyV5k0_FmOjKifjQ4MXaetOWAPxQ99ta0HCHYBSsLmJ-RxrEVoyLsT6hCItuii1Wq0Ctiu8ofOMIIcBYiR8_N3HQmOSC4MrerZZW_MiUovETiVP-I6qSZhn0k8qO1SF990cDX26ydD9ug32faqQlUjvebO0WHRrwPN3h0mdKEKlKMAZE8hjWCQHcEG7BM34DXJKiL7A.AT1_B2uSZ31B';

import "@arcgis/core/assets/esri/themes/light/main.css";

export default function Search() {
  
  const mapDiv = useRef(null);
  const viewRef = useRef(null);
  const mapRef = useRef(null);

  const graphicsLayerRef = useRef(null);
  const geojsonLayerRef = useRef(null);

  const distanceRef = useRef(null);
  const areaRef = useRef(null);
  const distanceExpandRef = useRef(null);
  const areaExpandRef = useRef(null);

  const bookmarksRef = useRef(null);

  const [lon, setLon] = useState("");
  const [lat, setLat] = useState("");
  const [date, setDate] = useState("");
  const [currentCoords, setCurrentCoords] = useState([0, 0]);
  const [bookmarkName, setBookmarkName] = useState("");
  const [showBookmarkInput, setShowBookmarkInput] = useState(false);
  const [is3D, setIs3D] = useState(false);
  const [stations3D, setStations3D] = useState(false);
  const [currentLayer, setCurrentLayer] = useState("layer1");

  // ---------------- LAYER SWITCHING ----------------
  const handleLayerChange = (e) => {
    const selectedLayer = e.target.value;
    setCurrentLayer(selectedLayer);

    // Clear existing layers
    if (geojsonLayerRef.current) {
      mapRef.current.remove(geojsonLayerRef.current);
      geojsonLayerRef.current = null;
    }
    graphicsLayerRef.current.removeAll();

    if (selectedLayer === "layer2") {
      loadEarthquakeLayer();
      // Reset view to earthquake layer defaults
      viewRef.current.goTo({
        center: [-168, 46],
        zoom: 2
      });
    }
  };

  // ---------------- LOAD EARTHQUAKE LAYER (Layer 2) ----------------
  const loadEarthquakeLayer = () => {
    const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

    const template = {
      title: "Earthquake Info",
      content: "Magnitude {mag} {type} hit {place} on {time}",
      fieldInfos: [
        {
          fieldName: "time",
          format: {
            dateFormat: "short-date-short-time",
          },
        },
      ],
    };

    const renderer = {
      type: "simple",
      field: "mag",
      symbol: {
        type: "simple-marker",
        color: "red",
        outline: {
          color: "white",
        },
      },
      visualVariables: [
        {
          type: "size",
          field: "mag",
          stops: [
            { value: 2.5, size: "4px" },
            { value: 8, size: "40px" },
          ],
        },
      ],
    };

    const layer = new GeoJSONLayer({
      url,
      popupTemplate: template,
      renderer,
      copyright: "USGS Earthquakes",
    });

    geojsonLayerRef.current = layer;
    mapRef.current.add(layer);
  };

  // ---------------- SWITCH VIEW ----------------
  const switchView = (to3D) => {
    if (!viewRef.current) return;

    const oldView = viewRef.current;
    const center = oldView.center || oldView.camera.position;
    const zoom = oldView.zoom || 5;

    oldView.map = null;
    oldView.container = null;
    oldView.destroy();

    let newView;
    if (to3D) {
      newView = new SceneView({
        container: mapDiv.current,
        map: mapRef.current,
        camera: {
          position: {
            longitude: center.longitude || center.x,
            latitude: center.latitude || center.y,
            z: 10000000,
          },
          tilt: 0,
          heading: 0,
        },
      });
    } else {
      newView = new MapView({
        container: mapDiv.current,
        map: mapRef.current,
        center,
        zoom,
      });
    }

    viewRef.current = newView;

    // Home widget
    newView.ui.add(new Home({ view: newView }), "top-left");

    // Measurement tools (2D only)
    if (!to3D) {
      distanceRef.current = new DistanceMeasurement2D({ view: newView });
      areaRef.current = new AreaMeasurement2D({ view: newView });

      distanceExpandRef.current = new Expand({
        view: newView,
        content: distanceRef.current,
        expandIcon: "measure-line",
        group: "top-right",
      });

      areaExpandRef.current = new Expand({
        view: newView,
        content: areaRef.current,
        expandIcon: "measure-area",
        group: "top-right",
      });

      newView.ui.add(
        [distanceExpandRef.current, areaExpandRef.current],
        "top-right"
      );
    }

    // Clear button
    const clearBtn = document.createElement("div");
    clearBtn.className = "esri-widget esri-widget--button esri-icon-trash";
    clearBtn.title = "Clear map";
    clearBtn.onclick = () => {
      if (!to3D) {
        distanceRef.current?.viewModel?.clear();
        areaRef.current?.viewModel?.clear();
        distanceExpandRef.current.expanded = false;
        areaExpandRef.current.expanded = false;
      }

      graphicsLayerRef.current.removeAll();
      if (geojsonLayerRef.current) {
        mapRef.current.remove(geojsonLayerRef.current);
        geojsonLayerRef.current = null;
      }

      setLon("");
      setLat("");
      setDate("");
      setCurrentCoords([0, 0]);
      setShowBookmarkInput(false);
    };
    newView.ui.add(clearBtn, "top-right");

    // Toggle 2D/3D
    const toggleBtn = document.createElement("div");
    toggleBtn.className = "esri-widget esri-widget--button";
    toggleBtn.innerHTML = to3D ? "2D" : "3D";
    toggleBtn.title = `Switch to ${to3D ? "2D" : "3D"} view`;
    toggleBtn.style.fontWeight = "bold";
    toggleBtn.onclick = () => setIs3D(!to3D);
    newView.ui.add(toggleBtn, "top-left");

    // Basemap gallery
    const basemapGallery = new BasemapGallery({ view: newView });
    newView.ui.add(new Expand({ view: newView, content: basemapGallery }), "top-right");

    // Bookmarks - Load saved bookmarks and restore them
    const savedBookmarksJSON = localStorage.getItem("bookmarks");
    let savedBookmarks = [];
    
    if (savedBookmarksJSON) {
      try {
        savedBookmarks = JSON.parse(savedBookmarksJSON);
      } catch (e) {
        console.error("Error parsing bookmarks:", e);
        localStorage.removeItem("bookmarks");
      }
    }

    const bookmarks = new Bookmarks({
      view: newView,
      bookmarks: savedBookmarks.map((b) => {
        try {
          return Bookmark.fromJSON(b);
        } catch (e) {
          console.error("Error creating bookmark:", e);
          return null;
        }
      }).filter(b => b !== null),
      editingEnabled: true,
    });
    
    bookmarksRef.current = bookmarks;

    // Save bookmarks whenever they change
    bookmarks.on("bookmark-edit", () => {
      saveBookmarks();
    });

    const saveBookmarks = () => {
      try {
        const bookmarksData = bookmarks.bookmarks.map((b) => b.toJSON());
        localStorage.setItem("bookmarks", JSON.stringify(bookmarksData));
      } catch (e) {
        console.error("Error saving bookmarks:", e);
      }
    };

    newView.ui.add(new Expand({ view: newView, content: bookmarks, expanded: false }), "top-right");

    // Live pointer coords
    newView.on("pointer-move", (event) => {
      const p = newView.toMap(event);
      if (p) setCurrentCoords([p.longitude, p.latitude]);
    });
  };

  // ---------------- MAP INIT ----------------
  useEffect(() => {
    graphicsLayerRef.current = new GraphicsLayer();

    const map = new Map({
      basemap: "gray-vector",
      layers: [graphicsLayerRef.current],
      ground: "world-elevation",
    });

    mapRef.current = map;

    const view = new MapView({
      container: mapDiv.current,
      map,
      center: [78.9629, 20.5937],
      zoom: 5,
    });

    viewRef.current = view;

    switchView(false);

    return () => view.destroy();
  }, []);

  useEffect(() => {
    if (viewRef.current) switchView(is3D);
  }, [is3D]);

  // ---------------- LOAD STATIONS (Layer 1) ----------------
  const getStationRenderer = (is3D) => {
    if (!is3D) {
      return {
        type: "simple",
        symbol: {
          type: "simple-marker",
          color: "black",
          size:4,
          outline: { color: "red", width: 1 },
        },
      };
    }

    return {
      type: "simple",
      symbol: {
        type: "point-3d",
        symbolLayers: [
          {
            type: "object",
            resource: { primitive: "cylinder" },
            material: { color: "orange" },
            height: 30000,
            width: 8000,
            anchor: "bottom",
          },
        ],
      },
    };
  };

  const loadStations = () => {
    if (!date) return alert("Select date");

    if (geojsonLayerRef.current) {
      mapRef.current.remove(geojsonLayerRef.current);
      geojsonLayerRef.current = null;
    }

    const layer = new GeoJSONLayer({
      url: `https://geodetic-backend.vercel.app/api/stacov/?date=${date}`,
      outFields: ["*"],

      elevationInfo: {
        mode: is3D && stations3D ? "relative-to-ground" : "on-the-ground",
      },

      renderer: getStationRenderer(is3D && stations3D),

      popupTemplate: {
        title: "Station {station}",
        content: "Height: {height} m",
      },
    });

    geojsonLayerRef.current = layer;
    mapRef.current.add(layer);
  };

  useEffect(() => {
    if (geojsonLayerRef.current && currentLayer === "layer1") {
      loadStations();
    }
  }, [stations3D, is3D]);

  // ---------------- SEARCH ----------------
  const handleSearch = () => {
    if (!lon || !lat) return;

    graphicsLayerRef.current.removeAll();

    const point = new Point({ longitude: Number(lon), latitude: Number(lat) });

    graphicsLayerRef.current.add(
      new Graphic({
        geometry: point,
        symbol: {
          type: "simple-marker",
          color: "#7900c9",
          size: 14,
          outline: { color: "white", width: 2 },
        },
      })
    );

    viewRef.current.goTo({ target: point, zoom: 12 });
  };

  // ---------------- BOOKMARK ----------------
  const addBookmark = () => {
    if (!bookmarkName.trim()) return alert("Enter bookmark name");

    const newBookmark = new Bookmark({
      name: bookmarkName,
      viewpoint: viewRef.current.viewpoint.clone(),
    });

    bookmarksRef.current.bookmarks.add(newBookmark);

    // Save to localStorage
    try {
      const bookmarksData = bookmarksRef.current.bookmarks.map((b) => b.toJSON());
      localStorage.setItem("bookmarks", JSON.stringify(bookmarksData));
    } catch (e) {
      console.error("Error saving bookmark:", e);
    }

    setBookmarkName("");
    setShowBookmarkInput(false);
  };

  const clearAllBookmarks = () => {
    if (confirm("Delete ALL bookmarks? This cannot be undone!")) {
      bookmarksRef.current.bookmarks.removeAll();
      localStorage.removeItem("bookmarks");
    }
  };

  // ---------------- UI ----------------
  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "sans-serif" }}>
      <div style={{ width: "300px", padding: "20px", background: "#f5f5f5", overflowY: "auto" }}>
        {/* Layer Selection */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Select Layer:
          </label>
          <select 
            onChange={handleLayerChange} 
            value={currentLayer}
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          >
            <option value="layer1">Layer 1 (Stations)</option>
            <option value="layer2">Layer 2 (Earthquakes)</option>
          </select>
        </div>

        {/* Layer 1 Controls */}
        {currentLayer === "layer1" && (
          <>
            <div style={{ marginBottom: "20px" }}>
              <input 
                type="number" 
                placeholder="Longitude" 
                value={lon} 
                onChange={(e) => setLon(e.target.value)} 
                style={{ width: "100%", marginBottom: "5px", padding: "8px" }}
              />
              <input 
                type="number" 
                placeholder="Latitude" 
                value={lat} 
                onChange={(e) => setLat(e.target.value)} 
                style={{ width: "100%", marginBottom: "5px", padding: "8px" }}
              />
              <button 
                onClick={handleSearch} 
                style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
              >
                Search
              </button>
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                style={{ width: "100%", padding: "8px", marginBottom: "5px" }}
              />
              <button 
                onClick={loadStations} 
                style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
              >
                Load Stations
              </button>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ fontSize: "13px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={stations3D}
                  onChange={(e) => setStations3D(e.target.checked)}
                  style={{ marginRight: "6px" }}
                />
                Show station in 3D (SceneView)
              </label>
            </div>
          </>
        )}

        {/* Layer 2 Info */}
        {currentLayer === "layer2" && (
          <div style={{ padding: "10px", background: "#fff", border: "1px solid #ccc", borderRadius: "4px", marginBottom: "20px" }}>
            <h3 style={{ marginTop: 0 }}>Earthquake Layer</h3>
            <p style={{ fontSize: "13px" }}>
              Displaying all earthquakes from the past year and months. 
              Circle size represents magnitude.
            </p>
          </div>
        )}

        {/* Common Controls */}
        <div style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "4px", marginBottom: "10px" }}>
          <div style={{ fontSize: "12px", marginBottom: "5px" }}>
            <strong>Lon:</strong> {currentCoords[0].toFixed(6)}
          </div>
          <div style={{ fontSize: "12px", marginBottom: "8px" }}>
            <strong>Lat:</strong> {currentCoords[1].toFixed(6)}
          </div>
          <button 
            onClick={() => setShowBookmarkInput(!showBookmarkInput)} 
            style={{ width: "100%", padding: "8px", background: "#0079c1", color: "white", border: "none", borderRadius: "4px", fontWeight: "bold" }}
          >
            {showBookmarkInput ? "❌ Cancel" : "Add Bookmark"}
          </button>
        </div>

        {showBookmarkInput && (
          <div style={{ marginBottom: "15px", padding: "10px", background: "#fff", border: "2px solid #0079c1", borderRadius: "4px" }}>
            <input 
              placeholder="Enter bookmark name..." 
              value={bookmarkName} 
              onChange={(e) => setBookmarkName(e.target.value)} 
              onKeyPress={(e) => e.key === "Enter" && addBookmark()} 
              autoFocus 
              style={{ width: "100%", padding: "8px", marginBottom: "5px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
            <button 
              onClick={addBookmark} 
              style={{ width: "100%", padding: "8px", background: "#28a745", color: "white", border: "none", borderRadius: "4px", fontWeight: "bold" }}
            >
              Save Bookmark
            </button>
          </div>
        )}

        <button 
          onClick={clearAllBookmarks} 
          style={{ width: "100%", padding: "8px", background: "#dc3545", color: "white", border: "none", borderRadius: "4px", fontWeight: "bold", marginBottom: "10px" }}
        >
          Clear All Bookmarks
        </button>
      </div>

      <div style={{ flex: 1 }}>
        <div ref={mapDiv} style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
} 