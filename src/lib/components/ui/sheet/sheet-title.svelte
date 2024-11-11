<script lang="ts">
	import { Dialog as SheetPrimitive } from "bits-ui";
	import { cn } from "$lib/utils/ui.js";

	type $$Props = SheetPrimitive.TitleProps;

	interface Props {
		class?: $$Props["class"];
		children?: import('svelte').Snippet;
		[key: string]: any
	}

	let { class: className = undefined, children, ...rest }: Props = $props();
	
</script>

<SheetPrimitive.Title
	class={cn("text-foreground text-lg font-semibold", className)}
	{...rest}
>
	{@render children?.()}
</SheetPrimitive.Title>
