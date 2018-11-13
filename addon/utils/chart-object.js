/**
 * @module Utils
 *
 */
import Ember from 'ember';

const {
	A,
	isArray,
	isEmpty,
	isNone,
	assert,
	observer,
	get,
	set,
	computed
} = Ember;


var on 					= Ember.on;
var EmberObject = Ember.Object;

/**
 * `Utils/ChartObject`
 *
 * @class ChartObject
 */
export default EmberObject.extend({
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

	_init: on('init', function() {
		this.setup();
	}),

	_buildData: observer('model', 'page', function() {
		this.setup();
		this.get('__chart').update();
	}),

	setup: function() {
		assert("labelPath must be set to parse the model objects for labels <ember-chart::labelPath>", !isEmpty(this.get('labelPath')));
		assert("dataPath must be set to parse the model objects for data values <ember-chart::dataPath>", !isEmpty(this.get('dataPath')));

		this.buildLabels();
		this.generateDatasets();
	},

	generateDatasets() {
		const datasets = A();
		const dataPaths = this.get('dataPath');

		const modelPath = (this.get('modelPath') || []);
		modelPath.forEach((path, index) => {
			const models = this.getModels(path);
			const dataPath = dataPaths[index];

			// make suer models were found at the path provided.
			assert('The path provided returned no models', !isNone(models));
			assert('The path provided did not return an array', isArray(models));

			const data = A();
			let hasOther = false;
			let otherTotal = 0;

			this.eachModel(models, (item, index, isActive, isOther) => {
				if (isActive) {
					// 0.01 is a hack to make all zero charts show up.
					data.push((get(item, dataPath) || 0.01));
				} else if (isOther) {
					hasOther = true;
					otherTotal = otherTotal + (get(item, dataPath) || 0);
				}
			});

			if (otherTotal > 0 || hasOther) {
				data.push((otherTotal || 0.01));
			}

			const dataset = this.createDataset(data, index);
			datasets.set('path', path);
			datasets.push(dataset);
		});

		this.set('datasets', datasets);
	},

	createDataset(data, index) {
		const chartOptions = this.get('chartOptions') || {};
		const dataset = EmberObject.create({ data });

		for (let i in chartOptions) {
			if (chartOptions.hasOwnProperty(i)) {
				let key = i;
				if(/^_/.test(i)) {
					key = i.replace(/^_/, '');
					chartOptions[key] = chartOptions[i][index];
				}
				this.setOption(dataset, chartOptions, key);
			}
		}

		return dataset;
	},

	buildLabels() {
		// add the ability to pass a static set of labels for multiple datasets.
		const staticLabels = this.get('chartOptions.staticLabels');
		if (!isNone(staticLabels) && isArray(staticLabels)) {
			this.get('labels', staticLabels);
		} else {
			let hasOther = false;
			const labels = A();
			const modelPath = (this.get('modelPath') || []);
			modelPath.forEach((path) => {
				const models = this.getModels(path);

				// make suer models were found at the path provided.
				assert('The path provided returned no models', !isNone(models));
				assert('The path provided did not return an array', isArray(models));

				this.eachModel(models, (item, idx, isActive, isOther) => {
					if (isActive) {
						const _label = get(item, this.get('labelPath')) || '';
						if(labels.indexOf(_label) === -1) {
							labels.push(_label);
						}
					} else if (isOther) {
						hasOther = true;
					}
				});
			});

			if (hasOther) {
				labels.push(this.get('otherTitle'));
			}
			this.set('labels', labels);
		}
	},

	setOption(data, object, key, defaultValue=null) {
		const value = get(object, key);
		if (!isNone(value) || !isNone(defaultValue)) {
			set(data, key, (value || defaultValue));
		}
		return this;
	},

	getModels(path) {
		path = `model.${path}`.replace(/\.$/, '');
		return this.get(path);
	},

	eachModel(items, callback) {
		const page = this.get('page');

		let pageSize = this.get('pageSize');
		if (isNone(pageSize)) {
			pageSize = items.get ? items.get('length') : items.length;
		}

		const min = (page * pageSize);
		const max = (min + (pageSize-1));

		items.forEach((item, index) => {
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

	_dataset: computed(function() {
		return this.get('datasets').objectAt(0);
	}),

	getModel: function(index) {
		const models = this.getModels(this.get('modelPath')[0]);
		if (models && models.objectAt && models.objectAt(index)) {
			return models.objectAt(index);
		} else if (models && models[index]) {
			return models[index];
		}
		return null;
	}
});
