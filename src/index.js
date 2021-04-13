import {Chart} from 'chart.js';
import TreemapController from './controller';
import TreemapElement from './element';

Chart.register(TreemapController, TreemapElement);

export * from './utils';
