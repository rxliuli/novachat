<script lang="ts">
	import type { HTMLOlAttributes } from "svelte/elements";
	import { cn } from "$lib/utils/ui.js";

	type $$Props = HTMLOlAttributes & {
		el?: HTMLOListElement;
	};

	interface Props {
		el?: $$Props["el"];
		class?: $$Props["class"];
		children?: import('svelte').Snippet;
		[key: string]: any
	}

	let { el = $bindable(undefined), class: className = undefined, children, ...rest }: Props = $props();
	
</script>

<ol
	bind:this={el}
	class={cn(
		"text-muted-foreground flex flex-wrap items-center gap-1.5 break-words text-sm sm:gap-2.5",
		className
	)}
	{...rest}
>
	{@render children?.()}
</ol>
