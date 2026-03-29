import { Context } from "@x1n13y84issmd42/react-at-home";
import { D3Graph } from "../lib/D3Graph";

export async function onRender(ctx: Context) {
	const dg = new D3Graph('#graph');
	ctx.state.dg = dg;
}