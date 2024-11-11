<script lang="ts">
	import { Dialog as SheetPrimitive } from "bits-ui";
	import { cn } from "$lib/utils/ui.js";

	type $$Props = SheetPrimitive.DescriptionProps;

	interface Props {
		class?: $$Props["class"];
		children?: import('svelte').Snippet;
		[key: string]: any
	}

	let { class: className = undefined, children, ...rest }: Props = $props();
	
</script>

<SheetPrimitive.Description class={cn("text-muted-foreground text-sm", className)} {...rest}>
	{@render children?.()}
</SheetPrimitive.Description>
