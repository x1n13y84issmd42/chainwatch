import { Context, I$, IEngine } from "@x1n13y84issmd42/react-at-home";

export async function domFn(ctx: Context, $: I$, r: IEngine) {
	if (ctx.dom.vinst && ctx.dom.id.sidebar) {
		$.append(ctx.dom.id.sidebar, ctx.dom.vinst.childNodes, async n => await r.transform(n, ctx));
	}

	return [];
}
