<script lang="ts">
	import { RangeCalendar as RangeCalendarPrimitive } from "bits-ui";
	import { cn } from "$lib/utils/ui.js";

	type $$Props = RangeCalendarPrimitive.GridProps;

	interface Props {
		class?: $$Props["class"];
		children?: import('svelte').Snippet;
		[key: string]: any
	}

	let { class: className = undefined, children, ...rest }: Props = $props();
	
</script>

<RangeCalendarPrimitive.Grid
	class={cn("w-full border-collapse space-y-1", className)}
	{...rest}
>
	{@render children?.()}
</RangeCalendarPrimitive.Grid>
