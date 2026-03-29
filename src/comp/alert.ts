import { Context, I$, IEngine } from "@x1n13y84issmd42/react-at-home";

export type State = Partial<{
	type: 'error'|'warning'|'info';
	title: string;
}>;

export async function stateFn(state: State) {
	return {
		type: state.type || 'info',
		title: state.title || 'Chainwatch',
	};
}

export async function domFn(ctx: Context, $: I$, e: IEngine) {
	if (ctx.dom.vinst && ctx.dom.id.content) {
		$.append(ctx.dom.id.content, ctx.dom.vinst.childNodes, async n => await e.transform(n, ctx));
	}

	return [];
}