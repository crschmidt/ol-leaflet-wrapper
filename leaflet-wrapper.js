// Override the default OpenLayers style with the default Leaflet style.
OpenLayers.Feature.Vector.style['default'] = OpenLayers.Util.applyDefaults({
    'fillColor': '#0033ff',
    'strokeWidth': 5,
    'strokeColor': '#0033ff',
    'fillOpacity': '0.2',
    'strokeOpacity': '0.5'}, 
    OpenLayers.Feature.Vector.style['default']);
var L = {};
L.Point = OpenLayers.Size;
L.Icon = new OpenLayers.Class({
    initialize: function(url) {
        if (url) {
            this.iconUrl = url;
        }
    }    
});
L.Icon.extend = function(opts) {
    var cls = OpenLayers.Class(L.Icon, opts);
    return cls;
}
L.styleToSymbolizer = function(style) {
    var symbprops = {}
    for (var key in style) {
        if (key == "color") {
            symbprops['strokeColor'] = style[key];
            symbprops['fillColor'] = style[key];
        }
        if (key == "opacity") {
            symbprops['strokeOpacity'] = style[key];
        }
    }
    var symb = OpenLayers.Util.applyDefaults(symbprops, OpenLayers.Feature.Vector.style['default']);
    return symb;
}    
L.lonlatToLeafletLL = function(ll) {
    ll.transform(new OpenLayers.Projection("EPSG:900913"), new OpenLayers.Projection("EPSG:4326"));    
    ll.lng = ll.lon;
    ll.lat = ll.lat;
    return ll;
}
L.TileLayer = new OpenLayers.Class(OpenLayers.Layer.XYZ, {
    sphericalMercator: true,
    wrapDateLine: true,
    initialize: function(url, options) {
        url = url.replace("{s}", "a");
        url = url.replace(/{/g, "${");
        this.url = url;
        OpenLayers.Layer.XYZ.prototype.initialize.apply(this, ['', this.url, options]);
    }
});;    
L.LatLng = function(lat, lng) {
    var ll = new OpenLayers.Geometry.Point(lng, lat);
    ll.transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));
    ll.lat = ll.y;
    ll.lon = ll.x;
    return ll;
}
L.Map = OpenLayers.Class(OpenLayers.Map, {

    initialize: function(div) {
        this.overlays = new OpenLayers.Layer.Vector();
        OpenLayers.Map.prototype.initialize.apply(this, [div, {controls: [], 'theme': null}]);
        this._addLayer(this.overlays);
        this.addControl(new OpenLayers.Control.Attribution());
        this.addControl(new OpenLayers.Control.Navigation());
        this.addControl(new OpenLayers.Control.ZoomPanel());
        return this;
    },
    setView: function(loc, zoom) {
        this.setCenter(loc, zoom);
        return this;
    },

    addLayer: function(item) { 
        if (item instanceof L.TileLayer) {
            OpenLayers.Map.prototype.addLayer.apply(this, [item]);
        } else if (item instanceof OpenLayers.Feature.Vector) {
            this.overlays.addFeatures(item);
        }
        return this;    
    },
    on: function(evt, func) {
        this.events.register(evt, this, func);
    }
});
OpenLayers.Events.prototype._triggerEvent = OpenLayers.Events.prototype.triggerEvent;
OpenLayers.Events.prototype.triggerEvent = function(type, evt) {
    if (evt && evt.xy && this.object.getLonLatFromPixel) {
        evt.latlng = L.lonlatToLeafletLL(this.object.getLonLatFromPixel(evt.xy));
    }
    this._triggerEvent(type, evt);
}
L.Map.prototype._addLayer = OpenLayers.Map.prototype.addLayer;
L.Marker = function(loc, opts) {
    var style = L.Marker.defaultIcon;
    if (opts && opts.icon) {
        style = {
            externalGraphic: opts.icon.iconUrl,
            graphicWidth: opts.icon.iconSize.w,
            graphicHeight: opts.icon.iconSize.h,
            graphicXOffset: -opts.icon.iconAnchor.w,
            graphicYOffset: -opts.icon.iconAnchor.h
        }
    }   
    return new OpenLayers.Feature.Vector(loc, {}, style)
}
L.Marker.defaultIcon = {'externalGraphic': 'http://leaflet.cloudmade.com/dist/images/marker.png',
         'graphicWidth': 25, 'graphicHeight': 41,
         'graphicXOffset': -13, 'graphicYOffset': -41};
L.Circle = function(loc, radius, options) {
    var geom = OpenLayers.Geometry.Polygon.createRegularPolygon(loc, radius, 100, 0);
    var f = new OpenLayers.Feature.Vector(geom, {}, L.styleToSymbolizer(options));
    return f;
}   
L.Polygon = function(points) {
    var p = new OpenLayers.Geometry.Polygon(new OpenLayers.Geometry.LinearRing(points));
    var f = new OpenLayers.Feature.Vector(p);
    return f;
}    
