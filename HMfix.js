var heatmapCfg = ({
    "radius": .005,
    "maxOpacity": .5, 
    "scaleRadius": true, 
    "useLocalExtrema": true,
    latField: 'FromLat',
    lngField: 'FromLng',
    valueField: 'Total',});
var heatmapLayer = new HeatmapOverlay(heatmapCfg);
heatmapLayer.setData(Heatmap);
var baseLayer = ''
