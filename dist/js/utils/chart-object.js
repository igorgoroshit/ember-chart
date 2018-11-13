define('ember-chartjs/utils/chart-object', ['exports', 'ember'], function (exports, _ember) {
	/**
  * @module Utils
  *
  */
	'use strict';

	var A = _ember['default'].A;
	var isArray = _ember['default'].isArray;
	var isEmpty = _ember['default'].isEmpty;
	var isNone = _ember['default'].isNone;
	var assert = _ember['default'].assert;
	var observer = _ember['default'].observer;
	var get = _ember['default'].get;
	var set = _ember['default'].set;
	var computed = _ember['default'].computed;

	var on = _ember['default'].on;
	var EmberObject = _ember['default'].Object;

	/**
  * `Utils/ChartObject`
  *
  * @class ChartObject
  */
	exports['default'] = EmberObject.extend({
		model: null,
		labelPath: null,
		dataPath: null,
		modelPath: '',
		otherTitle: '',
		page: 0,
		pageSize: null,
		type: '',
		options: null,
		chartOptions: null,

		datasets: null,
		labels: null,

		_init: on('init', function () {
			this.setup();
		}),

		_buildData: observer('model', 'page', function () {
			this.setup();
			this.get('__chart').update();
		}),

		setup: function setup() {
			assert("labelPath must be set to parse the model objects for labels <ember-chart::labelPath>", !isEmpty(this.get('labelPath')));
			assert("dataPath must be set to parse the model objects for data values <ember-chart::dataPath>", !isEmpty(this.get('dataPath')));

			this.buildLabels();
			this.generateDatasets();
		},

		generateDatasets: function generateDatasets() {
			var _this = this;

			var datasets = A();
			var dataPaths = this.get('dataPath');

			var modelPath = this.get('modelPath') || [];
			modelPath.forEach(function (path, index) {
				var models = _this.getModels(path);
				var dataPath = dataPaths[index];

				// make suer models were found at the path provided.
				assert('The path provided returned no models', !isNone(models));
				assert('The path provided did not return an array', isArray(models));

				var data = A();
				var hasOther = false;
				var otherTotal = 0;

				_this.eachModel(models, function (item, index, isActive, isOther) {
					if (isActive) {
						// 0.01 is a hack to make all zero charts show up.
						data.push(get(item, dataPath) || 0.01);
					} else if (isOther) {
						hasOther = true;
						otherTotal = otherTotal + (get(item, dataPath) || 0);
					}
				});

				if (otherTotal > 0 || hasOther) {
					data.push(otherTotal || 0.01);
				}

				var dataset = _this.createDataset(data, index);
				datasets.set('path', path);
				datasets.push(dataset);
			});

			this.set('datasets', datasets);
		},

		createDataset: function createDataset(data, index) {
			var chartOptions = this.get('chartOptions') || {};
			var dataset = EmberObject.create({ data: data });

			for (var i in chartOptions) {
				if (chartOptions.hasOwnProperty(i)) {
					var key = i;
					if (/^_/.test(i)) {
						key = i.replace(/^_/, '');
						chartOptions[key] = chartOptions[i][index];
					}
					this.setOption(dataset, chartOptions, key);
				}
			}

			return dataset;
		},

		buildLabels: function buildLabels() {
			var _this2 = this;

			// add the ability to pass a static set of labels for multiple datasets.
			var staticLabels = this.get('chartOptions.staticLabels');
			if (!isNone(staticLabels) && isArray(staticLabels)) {
				this.get('labels', staticLabels);
			} else {
				(function () {
					var hasOther = false;
					var labels = A();
					var modelPath = _this2.get('modelPath') || [];
					modelPath.forEach(function (path) {
						var models = _this2.getModels(path);

						// make suer models were found at the path provided.
						assert('The path provided returned no models', !isNone(models));
						assert('The path provided did not return an array', isArray(models));

						_this2.eachModel(models, function (item, idx, isActive, isOther) {
							if (isActive) {
								var _label = get(item, _this2.get('labelPath')) || '';
								if (labels.indexOf(_label) === -1) {
									labels.push(_label);
								}
							} else if (isOther) {
								hasOther = true;
							}
						});
					});

					if (hasOther) {
						labels.push(_this2.get('otherTitle'));
					}
					_this2.set('labels', labels);
				})();
			}
		},

		setOption: function setOption(data, object, key) {
			var defaultValue = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];

			var value = get(object, key);
			if (!isNone(value) || !isNone(defaultValue)) {
				set(data, key, value || defaultValue);
			}
			return this;
		},

		getModels: function getModels(path) {
			path = ('model.' + path).replace(/\.$/, '');
			return this.get(path);
		},

		eachModel: function eachModel(items, callback) {
			var page = this.get('page');

			var pageSize = this.get('pageSize');
			if (isNone(pageSize)) {
				pageSize = items.get ? items.get('length') : items.length;
			}

			var min = page * pageSize;
			var max = min + (pageSize - 1);

			items.forEach(function (item, index) {
				if (index >= min && index <= max) {
					callback(item, index, true, false);
				} else if (index > max) {
					callback(item, index, false, true);
				} else {
					callback(item, index, false, false);
				}
			});

			return this;
		},

		_dataset: computed(function () {
			return this.get('datasets').objectAt(0);
		}),

		getModel: function getModel(index) {
			var models = this.getModels(this.get('modelPath')[0]);
			if (models && models.objectAt && models.objectAt(index)) {
				return models.objectAt(index);
			} else if (models && models[index]) {
				return models[index];
			}
			return null;
		}
	});
});