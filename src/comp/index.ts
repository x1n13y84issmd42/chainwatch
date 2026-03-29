import { Engine } from "@x1n13y84issmd42/react-at-home";
import * as app from './app';
import * as sidebar from './sidebar';
import * as explorer from './explorer';
import * as explorer_graph from './explorer_graph';
import * as side_btn_input from './side_btn_input';
import * as alert from './alert';

export function register(rah: Engine) {
	rah.register('app', app.stateFn);
	rah.register('explorer', explorer.stateFn, undefined, explorer.onRender);
	rah.register('explorer_graph', undefined, undefined, explorer_graph.onRender);
	rah.register('sidebar', undefined, sidebar.domFn);
	rah.register('side_btn');
	rah.register('side_btn_input', side_btn_input.stateFn);
	rah.register('alert', alert.stateFn, alert.domFn);
}