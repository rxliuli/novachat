<script lang="ts">
	import { RangeCalendar as RangeCalendarPrimitive } from "bits-ui";
	import ChevronRight from "svelte-radix/ChevronRight.svelte";
	import { buttonVariants } from "$lib/components/ui/button/index.js";
	import { cn } from "$lib/utils/ui.js";

	type $$Props = RangeCalendarPrimitive.NextButtonProps;
	type $$Events = RangeCalendarPrimitive.NextButtonEvents;

	interface Props {
		class?: $$Props["class"];
		children?: import('svelte').Snippet<[any]>;
		[key: string]: any
	}

	let { class: className = undefined, children, ...rest }: Props = $props();
	

	const children_render = $derived(children);
</script>

<RangeCalendarPrimitive.NextButton
	on:click
	class={cn(
		buttonVariants({ variant: "outline" }),
		"h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
		className
	)}
	{...rest}
	
>
	{#snippet children({ builder })}
		{#if children_render}{@render children_render({ builder, })}{:else}
			<ChevronRight class="h-4 w-4" />
		{/if}
	{/snippet}
</RangeCalendarPrimitive.NextButton>
