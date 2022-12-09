var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/streets-v11",
  accessToken: mapKey
});

var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "dark-v10",
  accessToken: mapKey
});

var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "satellite-v9",
  accessToken: mapKey
});

let map = L.map("map", {
  center: [
    0, 10
  ],
  zoom: 3,
  layers:[streetmap]
});

let earthquake = new L.LayerGroup();
let tectonicplates = new L.LayerGroup();

let overlays = {tectonicplates,"Major Earthquakes":earthquake};
let baseMaps = {streetmap,darkmap,satellite};

L.control.layers(baseMaps,overlays).addTo(map);
streetmap.addTo(map);


d3.json('https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json').then(data => {
  x = data;

  L.geoJson(data, {
    color: 'red',
    weight: 2
  }).addTo(tectonicplates);

  tectonicplates.addTo(map);
});

d3.json('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson').then(data =>{
  console.log(data.features[100])

  function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(feature.geometry.coordinates[2]),
      color: "#000000",
      radius: getRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  };

  function getColor(depth) {
    switch (true) {
      case depth > 90:
        return "#ea2c2c";
      case depth > 70:
        return "#ea822c";
      case depth > 50:
        return "#ee9c00";
      case depth > 30:
        return "#eecc00";
      case depth > 10:
        return "#d4ee00";
      default:
        return "#98ee00";
    } 
  }

  function getRadius(mag) {
    if(mag === 0) {
      return 1;
    };

    return mag * 3;
  };

  L.geoJson(data,{
    pointToLayer: function(feature, latlng){
      return L.circleMarker(latlng)
    },
    style: styleInfo,
    onEachFeature: function (feature, layer) {
      layer.bindPopup(
        "Magnitude: "
        + feature.properties.mag
        + "<br>Depth: "
        + feature.geometry.coordinates[2]
        + "<br>Location: "
        + feature.properties.place
      );
    } 
  }).addTo(earthquake);

  earthquake.addTo(map);
})

let legend = L.control({ position: "bottomright" });

// Then add all the details for the legend
legend.onAdd = function() {
  let div = L.DomUtil.create("div", "info legend");

  div.innerHTML += '<h2>Depth</h2>';

  const magnitudes = ['90+','70','50','30','10<'];
  const colors = [
    "#ea2c2c",
    "#ea822c",
    "#ee9c00",
    "#eecc00",
    "#d4ee00",
    "#98ee00",
  ];

  for (var i = 0; i < magnitudes.length; i++) {
    console.log(colors[i]);
    div.innerHTML +=
      "<h4 style='background: " + colors[i] + "'>"
      + magnitudes[i] + "<br>" 
      + "</h4>"
    }
    return div;
  };

  legend.addTo(map);