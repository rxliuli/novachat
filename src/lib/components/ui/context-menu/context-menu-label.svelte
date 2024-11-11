<script lang="ts">
	import { ContextMenu as ContextMenuPrimitive } from "bits-ui";
	import { cn } from "$lib/utils/ui.js";

	type $$Props = ContextMenuPrimitive.LabelProps & {
		inset?: boolean;
	};

	interface Props {
		class?: $$Props["class"];
		inset?: $$Props["inset"];
		children?: import('svelte').Snippet;
		[key: string]: any
	}

	let { class: className = undefined, inset = undefined, children, ...rest }: Props = $props();
	
</script>

<ContextMenuPrimitive.Label
	class={cn("text-foreground px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className)}
	{...rest}
>
	{@render children?.()}
</ContextMenuPrimitive.Label>
