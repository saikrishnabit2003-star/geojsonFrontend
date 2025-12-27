import { useEffect, useRef, useState } from "react";

import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import GeoJSONLayer from "@arcgis/core/layers/GeoJSONLayer";

const StationMap = () => {
  const mapDiv = useRef(null);
  const viewRef = useRef(null);
  const [date, setDate] = useState("");
  const [geojsonLayer, setGeojsonLayer] = useState(null);
  const rendering={
        type: "simple",
        symbol: {
          type: "simple-marker",
          color: "orange",
          size: 8,
          outline: { color: "white", width: 1 },
        },
      }
    const templete={
        title: "{station}",
        content: "Height: {height} m",
      }

  useEffect(() => {
    if (!mapDiv.current) return;

    const map = new Map({
      basemap: "gray-vector",
    });

    const view = new MapView({
      container: mapDiv.current,
      map: map,
      center: [78.0, 22.0],
      zoom: 4,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, []);

  const loadStations = () => {
    if (!date) {
      alert("Please select a date");
      return;
    }

    // Remove previous GeoJSONLayer from the map if exists
    if (geojsonLayer && viewRef.current?.map) {
      viewRef.current.map.remove(geojsonLayer);
    }

    const url = `http://127.0.0.1:8000/api/stacov/?date=${date}`;

    const newLayer = new GeoJSONLayer({
      url,
      title: "Stations",
      renderer: rendering,
      popupTemplate:templete ,
    });

    viewRef.current.map.add(newLayer);
    setGeojsonLayer(newLayer);
  };

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <div style={{ padding: "10px", background: "#fff", zIndex: 10 }}>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button onClick={loadStations} style={{ marginLeft: "10px" }}>
          Load
        </button>
      </div>

      <div ref={mapDiv} style={{ height: "90vh", width: "100%" }} />
    </div>
  );
};

export default StationMap;
