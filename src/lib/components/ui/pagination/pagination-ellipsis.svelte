<script lang="ts">
	import DotsHorizontal from "svelte-radix/DotsHorizontal.svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import { cn } from "$lib/utils/ui.js";

	type $$Props = HTMLAttributes<HTMLSpanElement>;

	interface Props {
		class?: $$Props["class"];
		[key: string]: any
	}

	let { class: className = undefined, ...rest }: Props = $props();
	
</script>

<span
	aria-hidden
	class={cn("flex h-9 w-9 items-center justify-center", className)}
	{...rest}
>
	<DotsHorizontal class="h-4 w-4" />
	<span class="sr-only">More pages</span>
</span>
