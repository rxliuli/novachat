<script lang="ts">
	import { ContextMenu as ContextMenuPrimitive } from "bits-ui";
	import { cn } from "$lib/utils/ui.js";

	type $$Props = ContextMenuPrimitive.SeparatorProps;

	interface Props {
		class?: $$Props["class"];
		[key: string]: any
	}

	let { class: className = undefined, ...rest }: Props = $props();
	
</script>

<ContextMenuPrimitive.Separator
	class={cn("bg-border -mx-1 my-1 h-px", className)}
	{...rest}
/>
