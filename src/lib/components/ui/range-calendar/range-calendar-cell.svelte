<script lang="ts">
	import { RangeCalendar as RangeCalendarPrimitive } from "bits-ui";
	import { cn } from "$lib/utils/ui.js";

	type $$Props = RangeCalendarPrimitive.CellProps;

	interface Props {
		date: $$Props["date"];
		class?: $$Props["class"];
		children?: import('svelte').Snippet;
		[key: string]: any
	}

	let { date, class: className = undefined, children, ...rest }: Props = $props();
	
</script>

<RangeCalendarPrimitive.Cell
	{date}
	class={cn(
		"[&:has([data-selected])]:bg-accent [&:has([data-selected][data-outside-month])]:bg-accent/50 relative p-0 text-center text-sm focus-within:relative focus-within:z-20 first:[&:has([data-selected])]:rounded-l-md last:[&:has([data-selected])]:rounded-r-md [&:has([data-selected][data-selection-end])]:rounded-r-md [&:has([data-selected][data-selection-start])]:rounded-l-md",
		className
	)}
	{...rest}
>
	{@render children?.()}
</RangeCalendarPrimitive.Cell>
