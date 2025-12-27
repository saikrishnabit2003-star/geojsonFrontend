import { useEffect, useRef } from "react";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import GeoJSONLayer from "@arcgis/core/layers/GeoJSONLayer";

function Fullmap(){

    const mapDiv = useRef(null);

  useEffect(() => {
    const url =
      "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

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

    const geojsonLayer = new GeoJSONLayer({
      url,
      popupTemplate: template,
      renderer,
      copyright: "USGS Earthquakes",
    });

    const map = new Map({
      basemap: "gray-vector", 
      layers: [geojsonLayer],
    });

    const view = new MapView({
      container: mapDiv.current,
      map,
      center: [-168, 46],
      zoom: 2,
    });

    return () => {
      view.destroy();
    };
  }, []);

    return(
        <div>
          
          <div><div style={{ height: "98vh", width: "100%" }} ref={mapDiv}></div></div>
            
        </div>
    )

}
export default Fullmap;