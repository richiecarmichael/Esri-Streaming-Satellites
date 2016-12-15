/* -----------------------------------------------------------------------------------
   Developed by the Applications Prototype Lab
   (c) 2015 Esri | https://www.esri.com/legal/software-license  
----------------------------------------------------------------------------------- */

require([
    'esri/Map',
    'esri/Camera',
    'esri/layers/StreamLayer',
    'esri/views/SceneView',
    'esri/renderers/SimpleRenderer',
    'esri/symbols/PointSymbol3D',
    'esri/symbols/IconSymbol3DLayer',
    'dojo/domReady!'
],
function (
    Map,
    Camera,
    StreamLayer,
    SceneView,
    SimpleRenderer,
    PointSymbol3D,
    IconSymbol3DLayer
    ) {
    $(document).ready(function () {
        // Enforce strict mode
        'use strict';

        // Url to the streaming satellite feed
        var SATELLITE_FEED = 'https://ec2-75-101-155-202.compute-1.amazonaws.com:6080/arcgis/rest/services/WorldSatellites/StreamServer';

        // Update link
        $('#feed > a').attr('href', SATELLITE_FEED);

        // Create map and view
        var stream = new StreamLayer(SATELLITE_FEED, {
            purgeOptions: {
                displayCount: 10000
            }
        });
        stream.set({
            renderer: new SimpleRenderer({
                symbol: new PointSymbol3D({
                    symbolLayers: [new IconSymbol3DLayer({
                        size: 5,
                        material: {
                            color: 'white'
                        },
                        resource: {
                            primitive: 'circle'
                        }
                    })]
                })
            })
        });
        stream.on('graphics-controller-create', function (e) {
            e.graphicsController.on('message', function (m) {
                $('#panel').prepend(
                    $(document.createElement('div')).append(
                        $(document.createElement('div')).html(m.attributes.SatelliteName),
                        $(document.createElement('div')).html(ConvertToDMS(m.attributes.Longitude, true)),
                        $(document.createElement('div')).html(ConvertToDMS(m.attributes.Latitude, false)),
                        $(document.createElement('div')).html(format.format(',d')(m.attributes.AltitudeMeters / 1000) + 'km')
                    )
                );
                while ($('#panel').children().length > 11) {
                    $('#panel').children(':last-child').remove();
                }
            });
        });
        
        var _map = new Map({
            basemap: 'satellite',
            layers: [stream]
        });
        var _view = new SceneView({
            container: 'map',
            map: _map,
            constraints: {
                altitude: {
                    max: 500000000
                }
            }
        });
        _view.then(function () {
            // Set initial camera position
            _view.set('camera', Camera.fromJSON({
                'position': {
                    'x': -1308000,
                    'y': 2670000,
                    'spatialReference': {
                        'wkid': 102100
                    },
                    'z': 100000000
                },
                'heading': 0,
                'tilt': 0,
                'fov': 55
            }));

            // Increase far clipping plane
            _view.constraints.clipDistance.far *= 2;
        });

        function ConvertToDMS(d, lng) {
            var dir = d < 0 ? lng ? 'W' : 'S' : lng ? 'E' : 'N';
            var deg = 0 | (d < 0 ? d = -d : d);
            var min = 0 | d % 1 * 60;
            var sec = (0 | d * 60 % 1 * 60);
            return format.format('03d')(deg) + '° ' + format.format('02d')(min) + '\' ' + format.format('02d')(sec) + '" ' + dir;
        }
    });
});
