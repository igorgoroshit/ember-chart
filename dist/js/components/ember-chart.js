define('ember-chartjs/components/ember-chart', ['exports', 'ember', '../utils/chart-object', '../templates/components/ember-chart'], function (exports, _ember, _utilsChartObject, _templatesComponentsEmberChart) {
	/**
  * @module components
  *
  */

	'use strict';

	var Component = _ember['default'].Component;
	var isEmpty = _ember['default'].isEmpty;
	var isNone = _ember['default'].isNone;
	var get = _ember['default'].get;
	var set = _ember['default'].set;
	var computed = _ember['default'].computed;

	var camelize = _ember['default'].String.camelize;
	var htmlSafe = _ember['default'].String.htmlSafe;

	/***/

	/**
  * Sets a property to a default value if the property is
  * not already set.
  *
  * @private
  * @method setDefault
  * @param {object} object The object to set the value on
  * @param {string} key The key to the value in the object
  * @param {mixed} The default value to set
  */
	function setDefault(object, key, value) {
		if (isNone(get(object, key))) {
			set(object, key, value);
		}
	}

	/**
  * `EmberChart`
  *
  */
	exports['default'] = Component.extend({
		layout: _templatesComponentsEmberChart['default'],

		// data properties

		/**
   * Chartjs data object or an ember model
   *
   * @public
   * @property model
   * @type {object}
   */
		model: null,

		/**
   * The path of the property in the model to use
   * as the label for a data point.
   *
   * @public
   * @property labelPath
   * @type {string}
   */
		labelPath: null,

		/**
   * The path of the property in the model to use
   * as the data for a data point
   *
   * @public
   * @property dataPath
   * @type {string|array}
   */
		dataPath: null,

		/**
   * The path of each model in the model property to
   * use for each dataset.
   *
   * This property is optional and defaults to ['model'].
   *
   * @example
   *  if model === {somedata: [models], someotherdata: [models]}
   *  then modelPath === ["somedata", "someotherdata"]
   *  so dataset1 is somedata and dataset2 is someotherdata.
   *
   * @public
   * @property modelPath
   * @type {string|array}
   */
		modelPath: '',

		/**
   * Chart js options object.
   *
   * @public
   * @property options
   * @type object
   */
		options: null,

		/**
   * Options object for setting options on
   * a specific chart type.
   *
   * @public
   * @property chartOptions
   * @type object
   */
		chartOptions: null,

		// paging results properties

		/**
   * The text to display when the back button is showing.
   *
   * @public
   * @property backText
   * @type string
   */
		backText: "Back",

		/**
   * Text to display for the label of the other result when paging.
   *
   * @public
   * @property otherText
   * @type string
   */
		otherText: "Other",

		/**
   * The size of the results to show.
   *
   * This will show one less than the pageSize plus a result
   * that is other. The other result can be clicked to show more results.
   *
   * @public
   * @property pageSize
   * @default null - all results.
   * @type number
   */
		pageSize: null,

		// chart html properties

		/**
   * width of the chart.
   *
   * @public
   * @property width
   * @default 600
   * @type number
   */
		width: 600,

		/**
   * height of the chart.
   *
   * @public
   * @property height
   * @default 600
   * @type number
   */
		height: 600,

		_page: 0,
		_chartObject: null,
		isModel: false,

		/**
   * Ember init function gets called when the component
   * has rendered the element to the DOM
   *
   * @public
   * @method didInsertElement
   */
		didInsertElement: function didInsertElement() {
			var _this2 = this;

			// call the super funtion to handle any parent rendering
			this._super.apply(this, arguments);

			// create a chart object
			var chart = this.createChart();

			// save the chart object for later use
			this.set('chart', chart);

			if (this.get('isModel')) {
				// add oberserver methods for the model
				['model', 'model.[]', '_page', 'colors.[]'].forEach(function (observable) {
					_this2.addObserver(observable, _this2, _this2.updateChart);
				});
			} else {
				// add observer methods for chart data
				this.addObserver('data', this, this.redrawChart);
				this.addObserver('data.[]', this, this.redrawChart);
			}

			// add observers for options and type
			this.addObserver('options', this, this.redrawChart);
			this.addObserver('type', this, this.redrawChart);
		},

		/**
   * Creates a chart object with the type and values
   * passed in.
   *
   * @public
   * @method createChart
   * @returns {Chart} chartjs object class
   */
		createChart: function createChart() {
			var isModel = !isNone(this.get('model'));
			this.set('isModel', isModel);

			var _chartObject = this.initializeChartDataObject(isModel);

			var context = this.$().find('canvas').get(0),
			    type = this.get('type'),
			    options = this.setDefaultOptions(this.get('options'));

			var chart = new Chart(context, {
				type: camelize(type),
				data: _chartObject,
				options: options
			});

			// add the chart to the chartObject if
			// this is a model chartObject.
			if (isModel) {
				_chartObject.set('__chart', chart);
			}

			// store the ember model _chartObject
			this.set('_chartObject', _chartObject);

			// return the chartjs class
			return chart;
		},

		/**
   * Creates a chart data object with the type and values
   * passed in.
   *
   * @public
   * @method initializeChartDataObject
   * @returns {ChartObject}
   */
		initializeChartDataObject: function initializeChartDataObject(isModel) {
			var _chartObject = undefined;
			// if and ember model is passed in then
			// setup the chart object to handle the model data
			if (isModel) {
				// create a ChartObject that converts an ember model
				// to a chartjs data structure.
				_chartObject = _utilsChartObject['default'].create({
					model: this.get('model'), // model object
					labelPath: this.get('labelPath'), // path of the label to display in the provided model.
					dataPath: this.getTypeAsArray('dataPath'), // path of the data to display in the provided model.
					modelPath: this.getTypeAsArray('modelPath'), // path of each model in the model object.
					otherTitle: this.get('otherText'), // title to display for last result when paging.
					page: this.get('_page'), // internal paging for limiting chart results size.
					pageSize: this.get('pageSize'), // page size for limiting chart result szie.
					type: this.get('type'), // chart type
					options: this.get('options'), // chartjs options
					chartOptions: this.get('chartOptions') // chartjs chart specific options
				});
			} else {
					// set isModel to false and use
					// the chartjs style data array passed in
					_chartObject = this.get('data');
				}

			return _chartObject;
		},

		getTypeAsArray: function getTypeAsArray(type, defaultValue) {
			var arr = this.get(type);
			if (isNone(arr)) {
				if (!isNone(defaultValue)) {
					arr = defaultValue;
				} else {
					arr = [];
				}
			}

			if (typeof arr === 'string') {
				arr = arr.split(',');
			}
			return arr;
		},

		/**
   * Ember callback gets called when the component is getting destroyed
   *
   * @public
   * @method willDestroyElement
   */
		willDestroyElement: function willDestroyElement() {
			this._super.apply(this, arguments);

			// destroy the chartjs object class
			this.get('chart').destroy();

			// remove the observers
			this.addObserver('data', this, this.updateChart);
			this.addObserver('data.[]', this, this.updateChart);
			this.removeObserver('model', this, this.updateChart);
			this.removeObserver('model.[]', this, this.updateChart);
			this.removeObserver('_page', this, this.updateChart);
			this.removeObserver('colors.[]', this, this.updateChart);
			this.removeObserver('options', this, this.redrawChart);
			this.removeObserver('type', this, this.redrawChart);
		},

		redrawChart: function redrawChart() {
			var existingChart = this.get('chart');
			if (existingChart) {
				existingChart.destroy();
			}
			this.set('chart', this.createChart());
		},

		setDefaultOptions: function setDefaultOptions(options) {
			var _this = this;

			// set options
			options = options || {};

			// set onClick options
			var oldOnClick = function oldOnClick() {};
			if (options.onClick) {
				oldOnClick = options.onClick;
			}

			options.onClick = function () {
				_this.clickAction.apply(_this, arguments);
				oldOnClick.apply(this, arguments);
			};

			// add responsive options
			setDefault(options, 'responsive', true);
			setDefault(options, 'maintainAspectRatio', false);

			// set legend options
			options.legend = options.legend || {};

			setDefault(options.legend, 'display', true);
			setDefault(options.legend, 'position', 'bottom');
			setDefault(options.legend, 'fullWidth', true);

			// set tooltip options
			options.tooltips = options.tooltips || {};

			setDefault(options.tooltips, 'enabled', true);
			setDefault(options.tooltips, 'mode', 'single');
			setDefault(options.tooltips, 'backgroundColor', 'rgba(240,240,240,1)');
			setDefault(options.tooltips, 'titleFontColor', '#444');
			setDefault(options.tooltips, 'bodyFontColor', '#444');
			setDefault(options.tooltips, 'bodySpacing', 0);
			setDefault(options.tooltips, 'bodyFontStyle', 'italic');
			setDefault(options.tooltips, 'footerFontColor', '#444');
			setDefault(options.tooltips, 'xPadding', 10);
			setDefault(options.tooltips, 'yPadding', 15);
			setDefault(options.tooltips, 'caretSize', 10);
			setDefault(options.tooltips, 'cornerRadius', 3);
			setDefault(options.tooltips, 'multiKeybackground', '#999');

			// set tooltip callbacks
			options.tooltips.callbacks = options.tooltips.callbacks || {};

			setDefault(options.tooltips.callbacks, 'label', function (tooltip, data) {
				var label = data.labels[tooltip.index];
				var dataType = data.datasets[tooltip.datasetIndex].dataType;
				var value = data.datasets[tooltip.datasetIndex].data[tooltip.index];

				// hack to make all zero charts show up.
				value = value === 0.01 ? 0 : value;

				if (isEmpty(label)) {
					if (isEmpty(value)) {
						return;
					}
					return value;
				} else if (isEmpty(value)) {
					return label;
				}

				return _this.tooltip(label, value, dataType);
			});

			// return options with defaults
			return options;
		},

		clickAction: function clickAction(evt, segment) {
			var action = get(this, 'onClick');
			if (!isNone(action)) {
				if (get(this, 'isModel')) {
					segment = segment[0] || {};
					var segmentModel = segment._model;
					if (segmentModel && segmentModel.label === 'Other') {
						set(this, '_page', get(this, '_page') + 1);
						set(this, 'showBackButton', true);
					} else if (segmentModel && segmentModel.label) {
						var index = (get(this, 'colors.length') - 2) * get(this, '_page') + segment._index;
						var model = get(this, '_chartObject').getModel(index);
						if (!isNone(model)) {
							action(model);
						}
					} else {
						// expiremental
						//this.getClickedLabel(evt);
					}
				} else {
						action(evt, segment);
					}
			}
		},

		getClickedLabel: function getClickedLabel(evt) {
			var _chart = this.get('chart');
			var helpers = Chart.helpers;

			// hack to fix error in helper method
			_chart.currentDevicePixelRatio = 1;
			var pos = helpers.getRelativePosition(evt, _chart);

			var scale = _chart.scale;
			if (isNone(scale)) {
				for (var i in _chart.scales) {
					if (_chart.scales.hasOwnProperty(i) && isNone(scale)) {
						scale = _chart.scales[i];
					}
				}
			}

			var closestPixel = null;
			var closestPixelDistance = 10000000;
			var tickLabel = '';
			// loop through all the labels
			helpers.each(scale.ticks, function (label, index) {
				var pixel = this.getPixelForTick(index, true);
				var distance = Math.abs(pos.x - pixel);
				if (distance < closestPixelDistance) {
					closestPixel = index;
					closestPixelDistance = distance;
					tickLabel = label;
				}
			}, scale);

			if (tickLabel === 'Other') {
				this.set('_page', this.get('_page') + 1);
				this.set('showBackButton', true);
			} else {
				var model = this.get('_chartObject').getModel(closestPixel);
				if (!isNone(model)) {
					if (!isNone(get(this, 'onClick'))) {
						get(this, 'onClick')(model);
					}
				}
			}
		},

		tooltip: function tooltip(label, value) {
			return label + ': ' + value;
		},

		updateChart: function updateChart() {
			var data = undefined;
			if (this.get('isModel')) {
				data = this.get('_chartObject');
				if (this.get('model.length') !== data.get('model.length')) {
					data.set('model', this.get('model'));
				}

				if (this.get('colors.length') !== data.get('colors.length')) {
					data.set('colors', this.get('colors'));
				}

				if (this.get('_page') !== data.get('page')) {
					data.set('page', this.get('_page'));
				}
			} else {
				data = this.get('data');
				var chart = this.get('chart');
				chart.config.data = data;
				chart.update();
			}
		},

		buttonDisplay: computed('showBackButton', function () {
			if (this.get('showBackButton')) {
				return htmlSafe('display:block; position:absolute; top:0; left:0;');
			}

			return htmlSafe('display:none; position:absolute;');
		}),

		actions: {
			backAction: function backAction() {
				var segments = this.get('_page') - 1;
				if (segments <= 0) {
					segments = 0;
					this.set('showBackButton', false);
				}

				this.set('_page', segments);
			}
		}
	});
});

//import Chart from 'chartjs';