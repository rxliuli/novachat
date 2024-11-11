<script lang="ts">
	import * as FormPrimitive from "formsnap";
	import { cn } from "$lib/utils/ui.js";

	type $$Props = FormPrimitive.DescriptionProps;
	interface Props {
		class?: $$Props["class"];
		children?: import('svelte').Snippet<[any]>;
		[key: string]: any
	}

	let { class: className = undefined, children, ...rest }: Props = $props();
	

	const children_render = $derived(children);
</script>

<FormPrimitive.Description
	class={cn("text-muted-foreground text-[0.8rem]", className)}
	{...rest}
	
>
	{#snippet children({ descriptionAttrs })}
		{@render children_render?.({ descriptionAttrs, })}
	{/snippet}
</FormPrimitive.Description>
