<script lang="ts">
	import { LinkPreview as HoverCardPrimitive } from "bits-ui";
	import { cn, flyAndScale } from "$lib/utils/ui.js";

	type $$Props = HoverCardPrimitive.ContentProps;

	interface Props {
		class?: $$Props["class"];
		align?: $$Props["align"];
		sideOffset?: $$Props["sideOffset"];
		transition?: $$Props["transition"];
		transitionConfig?: $$Props["transitionConfig"];
		children?: import('svelte').Snippet;
		[key: string]: any
	}

	let {
		class: className = undefined,
		align = "center",
		sideOffset = 4,
		transition = flyAndScale,
		transitionConfig = undefined,
		children,
		...rest
	}: Props = $props();
	
</script>

<HoverCardPrimitive.Content
	{transition}
	{transitionConfig}
	{sideOffset}
	{align}
	class={cn(
		"bg-popover text-popover-foreground z-50 w-64 rounded-md border p-4 shadow-md outline-none",
		className
	)}
	{...rest}
>
	{@render children?.()}
</HoverCardPrimitive.Content>
