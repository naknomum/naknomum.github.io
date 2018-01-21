/*  https://github.com/naknomum/hexicon  */

function Hexicon(svg, text) {
    var _this = {};
    var theta = Math.PI / 6;
    var rotPattern = [ [Math.PI / 3, -Math.PI / 3, Math.PI], [2 * Math.PI / 3, -2 * Math.PI / 3, 2 * Math.PI] ];

    _this.create = function(svg, text) {
        _this.svg = svg;
        if (!text) text = svg.getAttribute('data-text');
        if (!text) return;
        var w = svg.clientWidth;
        var h = svg.clientHeight;
        var ratio = w / h;
        var R = Math.cos(theta);
        if (ratio < R) {
            _this.scale = (w / 2) / R;
        } else {
            _this.scale = h / 2;
        }
        _this.ctr = [w/2, h/2];
//console.info('[%d, %d] %d', _this.ctr[0], _this.ctr[1], _this.scale);
        _this.hexicon(text);
    };

    _this.updateText = function(text) {
        _this.create(_this.svg, text);
    };

    _this.sdbm = function(s) {
	      var h = 0;
	      for (var i = 0 ; i < s.length ; i++) {
		        h = s.charCodeAt(i) + (h << 6) + (h << 16) - h;
	      }
	      return (h >>> 0);
    };

    _this.coordDelta = function(xy) {
	      return [
		        xy[0] * Math.cos(theta) - xy[1] * Math.cos(theta),
		        xy[0] * Math.sin(theta) + xy[1] * Math.sin(theta)
	      ];
    };


    _this.coord = function(xy, alpha) {
	      var d = _this.coordDelta(xy);

//console.log(_this.scale);
	      var dx = _this.scale * d[0];
	      var dy = _this.scale * d[1];
	      var hyp = Math.sqrt(dx*dx + dy*dy);
//console.info(hyp);

	      var pt;
	      if (!alpha) {
		        pt = [ ctr[0] + dx, ctr[1] + dy ];
	      } else {
		        var beta = Math.atan2(dy, dx) + alpha;
//console.info('beta=' + beta);
		        dx = hyp * Math.cos(beta);
		        dy = hyp * Math.sin(beta);
//console.info(_this.ctr);
		        pt = [ _this.ctr[0] + dx, _this.ctr[1] - dy ];
	      }

//console.info('(%0.2f,%0.2f) ---[%0.2f,%02.f]--> (%0.2f,%0.2f)', xy[0], xy[1], dx, dy, pt[0], pt[1]);
	      return pt;
    };


    _this.addPolygon = function(arrPts, style, rpattern) {
        if (!rpattern) rpattern = 0;
	      for (r = 0 ; r < 3 ; r++) {
		        var pts = '';
		        for (var i = 0 ; i < arrPts.length ; i++) {
			          var m = _this.coord(arrPts[i], rotPattern[rpattern][r]);
			          pts += m[0] + ',' + m[1] + ' ';
		        }
		        var polygon = '<polygon points="' + pts + '" style="' + style + '"></polygon>';
		        _this.svg.innerHTML += polygon;
	      }
    };

    _this.rgb32 = function(v32) {
	      return Math.floor((v32 / 31) * 255);
    };


    _this.getRgb = function(h) {
	      var b = _this.rgb32(h & 31);
	      var g = _this.rgb32(h >>> 5 & 31);
	      var r = _this.rgb32(h >>> 10 & 31);
	      return 'rgb(' + r + ',' + g + ',' + b + ')';
    };


    _this.hexicon = function(s) {
	      var h = _this.sdbm(s);
//console.warn('%d (%s)', h, (h >>> 0).toString(2));
	      var rgb = _this.getRgb(h);
	      svg.innerHTML = '<polygon style="stroke: ' + rgb + '; fill: ' + rgb + ';" points="' + _this.outerPts() + '"></polygon>';

	      rgb = _this.getRgb(h >>> 15);
	      var shape = [ [0,1], [1/3,1], [1/3,2/3], [1/3,1/3],
		        [2/3,1/3], [2/3,2/3], [2/3,1], [1,1],
		        [1,2/3], [1,1/3], [1,0],
		        [2/3,0], [1/3,0], [0,0], [0,1/3], [0,2/3] ];

	      var pts = [];
	      for (var i = 0 ; i < shape.length ; i++) {
		        if (h >>> i & 1) continue;
		        pts.push(shape[i]);
	      }
	      var rpattern = h >>> 7 & 1;
	      _this.addPolygon(pts, 'stroke: ' + rgb + '; fill: ' + rgb, h >>> 17 & 1);
	      //toPng();
    };

    _this.outerPts = function() {
	      var pts = '';
	      for (var i = 0 ; i < 6 ; i++) {
		        var p = _this.coord([1,1], (i+1) * Math.PI / 3);
		        pts += p[0] + ',' + p[1] + ' ';
	      }
	      return pts;
    };


// h/t https://stackoverflow.com/a/33227005
    //note: this is not quite functional -- image is offset for some reason FIXME
    _this.toCanvas = function(canv, callback) {
        if (!canv) {
            canv = document.createElement('canvas');
            canv.height = _this.svg.clientHeight;
            canv.width = _this.svg.clientWidth;
        }
        var ctx = canv.getContext('2d');
        var svgURL = new XMLSerializer().serializeToString(_this.svg);
        var img  = new Image();
        img.onload = function() {
            ctx.drawImage(this, 0,0);
            if (callback) callback(ctx);  //e.g. access ctx.canvas.toDataURL()
        };
        img.src = 'data:image/svg+xml; charset=utf8, '+encodeURIComponent(svgURL);
    };


    if (svg) _this.create(svg, text);
    return _this;
}
