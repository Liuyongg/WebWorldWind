/*
 * Copyright (C) 2017 United States Government as represented by the Administrator of the
 * National Aeronautics and Space Administration. All Rights Reserved.
 */
define([
    './WktTokens'
], function (WktTokens) {
    /**
     * WktParser is capable of parsing the text representation of the WKT objects. The explanation of what all is
     * supported is to be found in the README.MD in this directory.<br/>
     * <br/>
     * The simplest possible usage is:<br/>
     * var layer = new WorldWind.RenderableLayer();<br/>
     * var parser = new WktParser('POINT (19 23)');<br/>
     * parser.load(null, null, layer);<br/>
     * wwd.addLayer(layer);<br/>
     * This example adds the WKT into the map<br/>
     *
     * The more complex usage allows you to update the attributes of the objects after adding them to the layer. In this example all
     * the shapes will have font color changed to the red:<br/>
     * var layer = new WorldWind.RenderableLayer();<br/>
     * var parser = new WktParser('POINT (19 23)');<br/>
     * parser.load(function(objects){<br/>
     *  objects.forEach(function(object){<br/>
     *    var shapeAttributes = new ShapeAttributes(null);<br/>
     *    shapeAttributes.fontColor = Color.RED;<br/>
     *    object.highlightAttributes = shapeAttributes;<br/>
     *  })<br/>
     * }, null, layer);<br/>
     * wwd.addLayer(layer);<br/>
     *
     * The most complex usage is when you want to supply different configuration for object before it is added to the layer.<br/>
     * var layer = new WorldWind.RenderableLayer();<br/>
     * var parser = new WktParser('POINT (19 23)');<br/>
     * parser.load(null, function(shape) {<br/>
     *   if(shape.type == WktType.SupportedGeometries.POINT) {<br/>
     *     var shapeAttributes = new ShapeAttributes(null);<br/>
     *     shapeAttributes.fontColor = Color.RED;<br/>
     *     return {<br/>
     *         attributes: shapeAttributes<br/>
     *     };<br/>
     *   }<br/>
     * }, layer);<br/>
     * wwd.addLayer(layer);<br/>
     *
     * @param textRepresentation {String} Text representation of WKT objects.
     * @constructor
     * @alias WktParser
     */
    var WktParser = function (textRepresentation) {
        this.objects = null;

        this.textRepresentation = textRepresentation;
    };

    /**
     * It parses the received string and create the Objects, which then can be rendered.
     * @param parserCompletionCallback {Function} An optional function called when the WKT loading is
     *   complete and all the shapes have been added to the layer.
     * @param shapeConfigurationCallback {Function} This function  is called whenever new shape is created. It provides
     *   the current shape as the first argument. In this way it is possible to modify the shape even provide another one.
     *   If any shape is returned it is used in place of the previous one. This function should be synchronous and if
     *   you want to provide custom shape, it has to be synchronous.
     * @param layer {RenderableLayer} Layer to use for adding all the parsed shapes
     * @return {Renderable[]} Array of the Renderables present in the WKT.
     */
    WktParser.prototype.load = function (parserCompletionCallback, shapeConfigurationCallback, layer) {
        var objects = new WktTokens(this.textRepresentation).objects();

        shapeConfigurationCallback = shapeConfigurationCallback || function(){};
        parserCompletionCallback = parserCompletionCallback || function(){};

        var shapes = [];
        objects.forEach(function(object){
            object.shapes().forEach(function(shape){
                var configuration = shapeConfigurationCallback(object);
                if(configuration && configuration.attributes) {
                    shape.attributes = configuration.attributes;
                }
                if(configuration && configuration.highlightAttributes) {
                    shape.highlightAttributes = configuration.highlightAttributes;
                }
                if(configuration && configuration.pickDelegate) {
                    shape.pickDelegate = configuration.pickDelegate;
                }
                if(configuration && configuration.userProperties) {
                    shape.userProperties = configuration.userProperties;
                }
                shapes.push(shape);
            });
        });

        layer.addRenderables(shapes);

        parserCompletionCallback(shapes);

        return objects;
    };

    return WktParser;
});