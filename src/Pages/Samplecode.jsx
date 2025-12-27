import { useEffect, useRef } from "react";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import GeoJSONLayer from "@arcgis/core/layers/GeoJSONLayer";
import style from "../Pages/Samplecode.module.css"
function Samplecode(){
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
        color: "orange",
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
      basemap: "gray-vector", // ⚠️ may require key in future
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
    

    return (
        <div className={style.main}>

            {/* side bar */}
            <div className={style.sidebar}>
                <p></p>
            </div>

            {/* main */}
            <div className={style.maincontainor}>
                <div>
                    <h1>GeoJSONLayer</h1>
                </div>
                {/* map */}
                <div id={style.main} >
                    <div className={style.mapcontainer}>
                        <div style={{ height: "600px", width: "100%" }} ref={mapDiv}></div>
                    </div>

                    <div className={style.btncontainer}>
                        <button id={style.btn}>Explore in the sandbox</button>
                        <button>open in CodePen</button>
                        <button>View Live</button>
                    </div>

                    <div className={style.para}>
                        <p>The  <span><>GeoJSONLayer</> </span> allows you to add features from a GeoJSON file .geojson. The file is referenced as a hosted file on the web. Because of this, the file must be publicly accessible.</p>
                        <p>This sample shows how to add an instance of <span>GeoJSONLayer</span> to a <span>Map</span>in a <span>MapView</span>. The resulting point features can be queried via the API and then subsequently used as input for other operations.</p>
                    </div>

                    <div className={style.para}>
                        <p>If GeoJSON files are not on the same domain as your website, a CORS-enabled server or a <span>proxy</span> is required.</p>
                    </div>

                    <div>
                        <h2>How it works</h2>
                        <p>This sample accesses real-time data from the USGS.</p>
                        <p>Create a new GeoJSONLayer and set the properties within its constructor. In this specific example, the url to the USGS earthquakes live feed is added in addition to the copyright and popupTemplate properties.</p>
                         <div></div>
                    </div>
                   
                </div>
            </div>

        </div>
    )
}


export default Samplecode