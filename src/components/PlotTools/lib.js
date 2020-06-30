import { Image } from "ol/layer";
import Static from "ol/source/ImageStatic";
import { transform, Projection } from "ol/proj";

import InitMap from "utils/INITMAP"

export const plotImage =  {
  createImage: function(url, extent, data) {
    if (!this.layer) {
      return new Image({
        source: this.createImageSource(url, extent, data),
        zIndex: 99,
      })
    }
  },

  createImageSource: function(url, extent, data) {
    let projection = new Projection({
      code: "xkcd-image",
      units: "pixels",
      extent: extent,
    });
    return new Static({
      crossOrigin: "anonymous",
      url,
      imageExtent: extent,
      projection,
      ...data,
    });
  },
  addImageToMap: function(imgLayer) {
    InitMap.map.addLayer(imgLayer)
  }
}