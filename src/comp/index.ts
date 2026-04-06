import { Engine } from "@x1n13y84issmd42/react-at-home";
import * as app from './app';
import * as sidebar from './sidebar';
import * as sidebar_wide from './sidebar_wide';
import * as explorer from './explorer';
import * as explorer_graph from './explorer_graph';
import * as side_btn_input from './side_btn_input';
import * as alert from './alert';
import * as address_list from './address_list';
import * as button_bar from './button_bar';

export function register(rah: Engine) {
	rah.register('app', app.stateFn);
	rah.register('explorer', explorer.stateFn, undefined, explorer.onRender);
	rah.register('explorer_graph', undefined, undefined, explorer_graph.onRender);
	rah.register('sidebar', undefined, sidebar.domFn);
	rah.register('sidebar_wide', undefined, sidebar_wide.domFn);
	rah.register('side_btn');
	rah.register('side_btn_input', side_btn_input.stateFn);
	rah.register('alert', alert.stateFn, alert.domFn);
	rah.register('address_list', address_list.stateFn);
	rah.register('button_bar', undefined, button_bar.domFn);
}