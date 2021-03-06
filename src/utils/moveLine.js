// (function (global, factory) {
//   typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
//       // typeof define === 'function' && define.amd ? define(factory) :
//           (global.MoveLine = factory());
// }(this, (function () {

//   /**
//    * @author https://github.com/chengquan223
//    * @Date 2017-02-27
//    * */

//   return MoveLine;

// })));
'use strict';
  function CanvasLayer(options) {
      this.options = options || {};
      this.paneName = this.options.paneName || 'labelPane';
      this.zIndex = this.options.zIndex || 0;
      this._map = options.map;
      this.canvas = null;
      this._lastDrawTime = null;
      this.destory = false;
      this.show();
  }

  CanvasLayer.prototype.onChangeProperty = function(canvas){
    if(!canvas || this.destory) return;
    canvas.style.display = 'none';
  }

  CanvasLayer.prototype.onMoveEnd = function(canvas){
    if(!canvas || this.destory) return;
    canvas.style.display = 'block';
    this.adjustSize();
    this._draw();
  }

  CanvasLayer.prototype._draw = function () {
    var map = this._map;
    var size = map.getSize();
    var center = map.getView().getCenter();
    if (center) {
        var pixel = map.getPixelFromCoordinate(center);
        this.canvas.style.left = pixel[0] - size[0] / 2 + 'px';
        this.canvas.style.top = pixel[1] - size[1] / 2 + 'px';
        this.options.update && this.options.update.call(this);
    }
  };

  CanvasLayer.prototype.initialize = function () {
      var canvas = this.canvas = document.createElement('canvas');
      var ctx = this.ctx = this.canvas.getContext('2d');
      canvas.style.cssText = 'position:absolute;' + 'left:0;' + 'top:0;' + 'z-index:' + this.zIndex + ';';
      canvas.style.pointerEvents = 'none';
      this.adjustSize();
      this.adjustRatio(ctx);
      this._map.getViewport().appendChild(canvas);
      var that = this;
      this._map.getView().on('propertychange',this.onChangeProperty.bind(this, this.canvas));
      this._map.on("moveend", this.onMoveEnd.bind(this, this.canvas));
      return this.canvas;
  };

  CanvasLayer.prototype.remove = function(){
    let canvas = this.canvas;
    if(canvas){
      canvas.parentNode.removeChild(canvas);
    }
  }

  CanvasLayer.prototype.adjustSize = function () {
      var size = this._map.getSize();
      var canvas = this.canvas;
      canvas.width = size[0];
      canvas.height = size[1];
      canvas.style.width = canvas.width + 'px';
      canvas.style.height = canvas.height + 'px';
  };

  CanvasLayer.prototype.hidden = function(){
    var canvas = this.canvas;
    canvas.style.display = 'none';
    this._map.un('propertychange', this.onChangeProperty);
    this._map.un('moveend', this.onMoveEnd);
  }

  CanvasLayer.prototype.adjustRatio = function (ctx) {
      var backingStore = ctx.backingStorePixelRatio || ctx.webkitBackingStorePixelRatio || ctx.mozBackingStorePixelRatio || ctx.msBackingStorePixelRatio || ctx.oBackingStorePixelRatio || ctx.backingStorePixelRatio || 1;
      var pixelRatio = (window.devicePixelRatio || 1) / backingStore;
      var canvasWidth = ctx.canvas.width;
      var canvasHeight = ctx.canvas.height;
      ctx.canvas.width = canvasWidth * pixelRatio;
      ctx.canvas.height = canvasHeight * pixelRatio;
      ctx.canvas.style.width = canvasWidth + 'px';
      ctx.canvas.style.height = canvasHeight + 'px';
      ctx.scale(pixelRatio, pixelRatio);
  };

  CanvasLayer.prototype.draw = function () {
      var self = this;
      var args = arguments;
      clearTimeout(self.timeoutID);
      self.timeoutID = setTimeout(function () {
          self._draw();
      }, 15);
  };

  CanvasLayer.prototype.getContainer = function () {
      return this.canvas;
  };

  CanvasLayer.prototype.showLayer = function(){
    this.canvas.style.display = 'block';
  }

  CanvasLayer.prototype.show = function () {
      this.initialize();
      this.canvas.style.display = 'block';
  };

  CanvasLayer.prototype.hide = function () {
      this.canvas.style.display = 'none';
  };

  CanvasLayer.prototype.setZIndex = function (zIndex) {
      this.canvas.style.zIndex = zIndex;
  };

  CanvasLayer.prototype.getZIndex = function () {
      return this.zIndex;
  };

  var global = typeof window === 'undefined' ? {} : window;

  var requestAnimationFrame = global.requestAnimationFrame || global.mozRequestAnimationFrame || global.webkitRequestAnimationFrame || global.msRequestAnimationFrame || function (callback) {
          return global.setTimeout(callback, 1000 / 60);
      };

  var MoveLine = function MoveLine(map, userOptions) {
      var self = this;

      //????????????
      var options = {
          //marker?????????
          markerRadius: 3,
          //marker?????????,?????????null????????????????????????
          markerColor: '#fff',
          //???????????? solid???dashed???dotted
          lineType: 'solid',
          //????????????
          lineWidth: 1,
          //????????????
          colors: ['#F9815C', '#F8AB60', '#EDCC72', '#E2F194', '#94E08A', '#4ECDA5'],
          //???????????????
          moveRadius: 2,
          //???????????????
          fillColor: '#fff',
          //?????????????????????
          shadowColor: '#fff',
          //?????????????????????
          shadowBlur: 5
      };

      //????????????
      var baseLayer = null,
          animationLayer = null,
          width = map.getSize()[0],
          height = map.getSize()[1],
          animationFlag = true,
          markLines = [];

      //????????????
      var merge = function merge(userOptions, options) {
          Object.keys(userOptions).forEach(function (key) {
              options[key] = userOptions[key];
          });
      };

      function Marker(opts) {
          this.city = opts.city;
          this.location = opts.location;
          this.color = opts.color;
      }

      Marker.prototype.draw = function (context) {
          var pixel = this.pixel = map.getPixelFromCoordinate(this.location);

          context.save();
          context.beginPath();
          context.fillStyle = options.markerColor || this.color;
          context.arc(pixel[0], pixel[1], options.markerRadius, 0, Math.PI * 2, true);
          context.closePath();
          context.fill();

          context.textAlign = 'center';
          context.textBaseline = 'middle';
          context.font = '12px Microsoft YaHei';
          context.fillStyle = this.color;
          context.fillText(this.city, pixel[0], pixel[1] - 10);
          context.restore();
      };

      function MarkLine(opts) {
          this.from = opts.from;
          this.to = opts.to;
          this.id = opts.id;
          this.step = 0;
      }

      MarkLine.prototype.getPointList = function (from, to) {
          var points = [[from[0], from[1]], [to[0], to[1]]];
          var ex = points[1][0];
          var ey = points[1][1];
          points[3] = [ex, ey];
          points[1] = this.getOffsetPoint(points[0], points[3]);
          points[2] = this.getOffsetPoint(points[3], points[0]);
          points = this.smoothSpline(points, false);
          //??????????????????????????????????????????
          points[points.length - 1] = [ex, ey];
          return points;
      };

      MarkLine.prototype.getOffsetPoint = function (start, end) {
          var distance = this.getDistance(start, end) / 3; //??????3???
          var angle, dX, dY;
          var mp = [start[0], start[1]];
          var deltaAngle = -0.2; //??????0.2??????
          if (start[0] != end[0] && start[1] != end[1]) {
              //????????????
              var k = (end[1] - start[1]) / (end[0] - start[0]);
              angle = Math.atan(k);
          } else if (start[0] == end[0]) {
              //?????????
              angle = (start[1] <= end[1] ? 1 : -1) * Math.PI / 2;
          } else {
              //?????????
              angle = 0;
          }
          if (start[0] <= end[0]) {
              angle -= deltaAngle;
              dX = Math.round(Math.cos(angle) * distance);
              dY = Math.round(Math.sin(angle) * distance);
              mp[0] += dX;
              mp[1] += dY;
          } else {
              angle += deltaAngle;
              dX = Math.round(Math.cos(angle) * distance);
              dY = Math.round(Math.sin(angle) * distance);
              mp[0] -= dX;
              mp[1] -= dY;
          }
          return mp;
      };

      MarkLine.prototype.smoothSpline = function (points, isLoop) {
          var len = points.length;
          var ret = [];
          var distance = 0;
          for (var i = 1; i < len; i++) {
              distance += this.getDistance(points[i - 1], points[i]);
          }
          var segs = distance / 2;
          segs = segs < len ? len : segs;
          for (var i = 0; i < segs; i++) {
              var pos = i / (segs - 1) * (isLoop ? len : len - 1);
              var idx = Math.floor(pos);
              var w = pos - idx;
              var p0;
              var p1 = points[idx % len];
              var p2;
              var p3;
              if (!isLoop) {
                  p0 = points[idx === 0 ? idx : idx - 1];
                  p2 = points[idx > len - 2 ? len - 1 : idx + 1];
                  p3 = points[idx > len - 3 ? len - 1 : idx + 2];
              } else {
                  p0 = points[(idx - 1 + len) % len];
                  p2 = points[(idx + 1) % len];
                  p3 = points[(idx + 2) % len];
              }
              var w2 = w * w;
              var w3 = w * w2;

              ret.push([this.interpolate(p0[0], p1[0], p2[0], p3[0], w, w2, w3), this.interpolate(p0[1], p1[1], p2[1], p3[1], w, w2, w3)]);
          }
          return ret;
      };

      MarkLine.prototype.interpolate = function (p0, p1, p2, p3, t, t2, t3) {
          var v0 = (p2 - p0) * 0.5;
          var v1 = (p3 - p1) * 0.5;
          return (2 * (p1 - p2) + v0 + v1) * t3 + (-3 * (p1 - p2) - 2 * v0 - v1) * t2 + v0 * t + p1;
      };

      MarkLine.prototype.getDistance = function (p1, p2) {
          return Math.sqrt((p1[0] - p2[0]) * (p1[0] - p2[0]) + (p1[1] - p2[1]) * (p1[1] - p2[1]));
      };

      MarkLine.prototype.drawMarker = function (context) {
          this.from.draw(context);
          this.to.draw(context);
      };

      MarkLine.prototype.drawLinePath = function (context) {
          var pointList = this.path = this.getPointList(map.getPixelFromCoordinate(this.from.location), map.getPixelFromCoordinate(this.to.location));
          var len = pointList.length;
          context.save();
          context.beginPath();
          context.lineWidth = options.lineWidth;
          context.strokeStyle = options.strokeColor ||  options.colors[this.id];

          if (!options.lineType || options.lineType == 'solid') {
              context.moveTo(pointList[0][0], pointList[0][1]);
              for (var i = 0; i < len; i++) {
                  context.lineTo(pointList[i][0], pointList[i][1]);
              }
          } else if (options.lineType == 'dashed' || options.lineType == 'dotted') {
              for (var i = 1; i < len; i += 2) {
                  context.moveTo(pointList[i - 1][0], pointList[i - 1][1]);
                  context.lineTo(pointList[i][0], pointList[i][1]);
              }
          }
          context.stroke();
          context.restore();
          this.step = 0; //?????????????????????????????????
      };

      MarkLine.prototype.drawMoveCircle = function (context) {
          var pointList = this.path || this.getPointList(map.getPixelFromCoordinate(this.from.location), map.getPixelFromCoordinate(this.to.location));

          context.save();
          context.fillStyle = options.fillColor;
          context.shadowColor = options.shadowColor;
          context.shadowBlur = options.shadowBlur;
          context.beginPath();
          context.arc(pointList[this.step][0], pointList[this.step][1], options.moveRadius, 0, Math.PI * 2, true);
          context.fill();
          context.closePath();
          context.restore();
          this.step += 1;
          if (this.step >= pointList.length) {
              this.step = 0;
          }
      };

      //??????canvas????????????????????????
      var brush = function brush() {
          var baseCtx = baseLayer.canvas.getContext('2d');
          if (!baseCtx) {
              return;
          }

          addMarkLine();

          baseCtx.clearRect(0, 0, width, height);

          markLines.forEach(function (line) {
              line.drawMarker(baseCtx);
              line.drawLinePath(baseCtx);
          });
      };

      //??????canvas?????????????????????
      var render = function render() {
          var animationCtx = animationLayer.canvas.getContext('2d');
          if (!animationCtx) {
              return;
          }

          if (!animationFlag) {
              animationCtx.clearRect(0, 0, width, height);
              return;
          }

          animationCtx.fillStyle = 'rgba(0,0,0,.93)';
          var prev = animationCtx.globalCompositeOperation;
          animationCtx.globalCompositeOperation = 'destination-in';
          animationCtx.fillRect(0, 0, width, height);
          animationCtx.globalCompositeOperation = prev;

          for (var i = 0; i < markLines.length; i++) {
              var markLine = markLines[i];
              markLine.drawMoveCircle(animationCtx); //????????????
          }
      };
      var addMarkLine = function addMarkLine() {
          markLines = [];
          var dataset = options.data;
          dataset.forEach(function (line, i) {
              markLines.push(new MarkLine({
                  id: i,
                  from: new Marker({
                      city: line.from.city,
                      location: [line.from.lnglat[0], line.from.lnglat[1]],
                      color: options.strokeColor || options.colors[i] || '#FF0000'
                  }),
                  to: new Marker({
                      city: line.to.city,
                      location: [line.to.lnglat[0], line.to.lnglat[1]],
                      color: options.strokeColor || options.colors[i] || '#FF0000'
                  })
              }));
          });
      };

      //?????????
      var init = function init(map, options) {
          merge(userOptions, options);

          baseLayer = new CanvasLayer({
              map: map,
              update: brush
          });
          baseLayer._draw();
          self.canvas = baseLayer;

          animationLayer = new CanvasLayer({
              map: map,
              update: render
          });
          animationLayer._draw();
          self.animateCanvas = animationLayer;
          (function drawFrame() {
              requestAnimationFrame(drawFrame);
              render();
          })();

          // MoveLine.prototype = baseLayer.prototype;
      };

      init(map, options);

      self.options = options;
  };
  MoveLine.prototype.update = function (resetOpts) {
      for (var key in resetOpts) {
          this.options[key] = resetOpts[key];
      }
  };

  export default MoveLine;
