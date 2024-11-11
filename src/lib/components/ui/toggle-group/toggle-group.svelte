<script lang="ts">
	import type { VariantProps } from "tailwind-variants";
	import { ToggleGroup as ToggleGroupPrimitive } from "bits-ui";
	import { setToggleGroupCtx } from "./index.js";
	import type { toggleVariants } from "$lib/components/ui/toggle/index.js";
	import { cn } from "$lib/utils/ui.js";

	type T = $$Generic<"single" | "multiple">;
	type $$Props = ToggleGroupPrimitive.Props<T> & VariantProps<typeof toggleVariants>;

	
	interface Props {
		class?: string | undefined | null;
		variant?: $$Props["variant"];
		size?: $$Props["size"];
		value?: $$Props["value"];
		children?: import('svelte').Snippet<[any]>;
		[key: string]: any
	}

	let {
		class: className = undefined,
		variant = "default",
		size = "default",
		value = $bindable(undefined),
		children,
		...rest
	}: Props = $props();

	setToggleGroupCtx({
		variant,
		size,
	});

	const children_render = $derived(children);
</script>

<ToggleGroupPrimitive.Root
	class={cn("flex items-center justify-center gap-1", className)}
	bind:value
	{...rest}
	
>
	{#snippet children({ builder })}
		{@render children_render?.({ builder, })}
	{/snippet}
</ToggleGroupPrimitive.Root>
