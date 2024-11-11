<script lang="ts">
	import { RangeCalendar as RangeCalendarPrimitive } from "bits-ui";
	import { cn } from "$lib/utils/ui.js";

	type $$Props = RangeCalendarPrimitive.HeadCellProps;

	interface Props {
		class?: $$Props["class"];
		children?: import('svelte').Snippet;
		[key: string]: any
	}

	let { class: className = undefined, children, ...rest }: Props = $props();
	
</script>

<RangeCalendarPrimitive.HeadCell
	class={cn("text-muted-foreground w-8 rounded-md text-[0.8rem] font-normal", className)}
	{...rest}
>
	{@render children?.()}
</RangeCalendarPrimitive.HeadCell>
