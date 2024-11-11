<script lang="ts">
	import { Progress as ProgressPrimitive } from "bits-ui";
	import { cn } from "$lib/utils/ui.js";

	type $$Props = ProgressPrimitive.Props;

	interface Props {
		class?: $$Props["class"];
		max?: $$Props["max"];
		value?: $$Props["value"];
		[key: string]: any
	}

	let { class: className = undefined, max = 100, value = undefined, ...rest }: Props = $props();
	
</script>

<ProgressPrimitive.Root
	class={cn("bg-primary/20 relative h-2 w-full overflow-hidden rounded-full", className)}
	{...rest}
>
	<div
		class="bg-primary h-full w-full flex-1 transition-all"
		style={`transform: translateX(-${100 - (100 * (value ?? 0)) / (max ?? 1)}%)`}
	></div>
</ProgressPrimitive.Root>
