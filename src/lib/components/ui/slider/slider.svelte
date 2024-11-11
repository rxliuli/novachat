<script lang="ts">
	import { Slider as SliderPrimitive } from "bits-ui";
	import { cn } from "$lib/utils/ui.js";

	type $$Props = SliderPrimitive.Props;

	interface Props {
		class?: $$Props["class"];
		value?: $$Props["value"];
		[key: string]: any
	}

	let { class: className = undefined, value = $bindable([0]), ...rest }: Props = $props();
	
</script>

<SliderPrimitive.Root
	bind:value
	class={cn("relative flex w-full touch-none select-none items-center", className)}
	{...rest}
	
>
	{#snippet children({ thumbs })}
		<span class="bg-primary/20 relative h-1.5 w-full grow overflow-hidden rounded-full">
			<SliderPrimitive.Range class="bg-primary absolute h-full" />
		</span>
		{#each thumbs as thumb}
			<SliderPrimitive.Thumb
				{thumb}
				class="border-primary/50 bg-background focus-visible:ring-ring block h-4 w-4 rounded-full border shadow transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50"
			/>
		{/each}
	{/snippet}
</SliderPrimitive.Root>
