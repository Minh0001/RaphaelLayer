R.Arc = R.Layer.extend({
	initialize: function(latlngs, attr, options) {
		R.Layer.prototype.initialize.call(this, options);

		this._latlngs = latlngs;
		this._attr = attr;
	},

	onAdd: function(map) {
		R.Layer.prototype.onAdd.call(this, map);
	},

	projectLatLngs: function() {
		if (!this._paper.customAttributes.arc) {
			this._paper.customAttributes.arc = function(xloc, yloc, value, total, R) {
				var alpha = 360 / total * value,
					a = (90 - alpha) * Math.PI / 180,
					x = xloc + R * Math.cos(a),
					y = yloc - R * Math.sin(a),
					path;
				if (total == value) {
					path = [
						["M", xloc, yloc - R],
						["A", R, R, 0, 1, 1, xloc - 0.01, yloc - R]
					];
				} else {
					path = [
						["M", xloc, yloc - R],
						["A", R, R, 0, +(alpha > 180), 1, x, y]
					];
				}
				return {
					path: path
				};
			};
		}

		if (this._path) {
			this._path.remove();
		}

		var start = this._map.latLngToLayerPoint(this._latlngs[0]),
			end = this._map.latLngToLayerPoint(this._latlngs[1]),
			cp = this.getControlPoint(start, end),
			length = this.getLength(start, end),
			angle = this.getAngle(start, end);

		this.controlPoint = cp;
		this.angle = angle;

		this._attr = {
			"stroke": "#f00",
			"stroke-width": (0.5 * this._map.getZoom())
		};
		this._attr.arc = [cp.x, cp.y, 50, 100, length / 2];
		this._path = this._paper.path();
		this._path.attr(this._attr);
		this._path.rotate(angle, cp.x, cp.y);
		this._path.toBack();

		this._set.push(this._path);
	},

	getControlPoint: function(start, end) {
		var cp = {
			x: 0,
			y: 0
		};
		cp.x = start.x + (end.x - [start.x]) / 2;
		cp.y = start.y + (end.y - [start.y]) / 2;
		return cp;
	},

	getLength: function(start, end) {
		var length = Math.sqrt(Math.pow(end.x - [start.x], 2) + Math.pow(end.y - [
			start.y
		], 2));
		return length;
	},

	getAngle: function(start, end) {
		var deltaX = end.x - start.x;
		var deltaY = end.y - start.y;
		var angle = Math.atan(deltaY / deltaX) * 180 / Math.PI;
		while (angle < 0) {
			angle += 360;
		}
		if (angle < 90) {
			angle += 180;
		}
		angle = angle + 90;
		return angle;
	}
});
