<script lang="ts">
	import type { HTMLLiAttributes } from "svelte/elements";
	import ChevronRight from "svelte-radix/ChevronRight.svelte";
	import { cn } from "$lib/utils/ui.js";

	type $$Props = HTMLLiAttributes & {
		el?: HTMLLIElement;
	};

	interface Props {
		el?: $$Props["el"];
		class?: $$Props["class"];
		children?: import('svelte').Snippet;
		[key: string]: any
	}

	let { el = $bindable(undefined), class: className = undefined, children, ...rest }: Props = $props();
	
</script>

<li
	role="presentation"
	aria-hidden="true"
	class={cn("[&>svg]:size-3.5", className)}
	bind:this={el}
	{...rest}
>
	{#if children}{@render children()}{:else}
		<ChevronRight tabindex="-1" />
	{/if}
</li>
