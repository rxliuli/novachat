<script lang="ts">
	import { Popover as PopoverPrimitive } from "bits-ui";
	import { cn, flyAndScale } from "$lib/utils/ui.js";

	type $$Props = PopoverPrimitive.ContentProps;

	interface Props {
		class?: $$Props["class"];
		transition?: $$Props["transition"];
		transitionConfig?: $$Props["transitionConfig"];
		align?: $$Props["align"];
		sideOffset?: $$Props["sideOffset"];
		children?: import('svelte').Snippet;
		[key: string]: any
	}

	let {
		class: className = undefined,
		transition = flyAndScale,
		transitionConfig = undefined,
		align = "center",
		sideOffset = 4,
		children,
		...rest
	}: Props = $props();
	
</script>

<PopoverPrimitive.Content
	{transition}
	{transitionConfig}
	{align}
	{sideOffset}
	{...rest}
	class={cn(
		"bg-popover text-popover-foreground z-50 w-72 rounded-md border p-4 shadow-md outline-none",
		className
	)}
>
	{@render children?.()}
</PopoverPrimitive.Content>
