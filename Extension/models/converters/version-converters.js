/**
 * Created with JetBrains PhpStorm.
 * User: alexeybelozerov
 * Date: 3/21/13
 * Time: 12:38 AM
 * To change this template use File | Settings | File Templates.
 */

var VersionConverter = {

    convert: function(currentDataVersion, targetDataVersion) {
    }

};

var VersionConverter_FromLegacy = _.extend(VersionConverter, {

    /**
     * Overriden
     */
    convert: function(currentDataVersion, targetDataVersion) {
        // Get old data
        var currentOverlayId = Number(localStorage["currentOverlayId"] || -1);
        if (localStorage["options"]) {
            var overlayShown = $.parseJSON(localStorage["options"]).visible || false;
            var overlayLocked = $.parseJSON(localStorage["options"]).locked || false;
            var overlayInverted = $.parseJSON(localStorage["options"]).locked || false;
        }
        else
            var overlayShown = overlayLocked = overlayInverted = false;
        var layersData = [];

        { // scope
            var index = 0;
            while(localStorage["overlay" + index + "_data"] && localStorage["overlay" + index + "_position"])
            {
                var layerData = $.parseJSON(localStorage["overlay" + index + "_data"]);
                var layerPosition = $.parseJSON(localStorage["overlay" + index + "_position"]);

                var combinedLayerData = _.extend(layerData, layerPosition);
                combinedLayerData.IsCurrent = index == currentOverlayId;
                layersData.push(combinedLayerData);
                index++;
            }
        }

        // Save old data in new format
        var PerfectPixel = new PerfectPixelModel({
            id: 1,
            overlayShown: overlayShown,
            overlayLocked: overlayLocked,
            overlayInverted: overlayInverted,
            version: targetDataVersion
        });

        for(var i=0; i<layersData.length; i++)
        {
            var layerDataItem = layersData[i];
            var overlay = new Overlay({
                x: layerDataItem.X,
                y: layerDataItem.Y,
                width: layerDataItem.Width,
                height: layerDataItem.Height,
                opacity: layerDataItem.Opacity,
                scale: layerDataItem.Scale,
                filename: layerDataItem.FileName,
                thumbnailFilename: layerDataItem.ThumbnailFileName
            });

            PerfectPixel.overlays.add(overlay);
            overlay.save();
            if(layerDataItem.IsCurrent)
                PerfectPixel.set({ currentOverlayId: overlay.id });
        }

        PerfectPixel.save();

        // Delete old data
        localStorage.removeItem("currentOverlayId");
        localStorage.removeItem("options");
        for(var i=0; i<layersData.length; i++)
        {
            localStorage.removeItem("overlay" + i + "_data");
            localStorage.removeItem("overlay" + i + "_position");
        }
    }

});

var VersionConverter_SimpleVersionUpdater = _.extend(VersionConverter, {

    /**
     * Overriden
     */
    convert: function(currentDataVersion, targetDataVersion) {
        var PerfectPixel = new PerfectPixelModel({ id: 1 });
        PerfectPixel.fetch();
        PerfectPixel.set('version', targetDataVersion);
        PerfectPixel.save();
    }
});