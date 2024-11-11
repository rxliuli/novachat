<script lang="ts">
	import { RangeCalendar as RangeCalendarPrimitive } from "bits-ui";
	import { cn } from "$lib/utils/ui.js";

	type $$Props = RangeCalendarPrimitive.HeaderProps;

	interface Props {
		class?: $$Props["class"];
		children?: import('svelte').Snippet;
		[key: string]: any
	}

	let { class: className = undefined, children, ...rest }: Props = $props();
	
</script>

<RangeCalendarPrimitive.Header
	class={cn("relative flex w-full items-center justify-between pt-1", className)}
	{...rest}
>
	{@render children?.()}
</RangeCalendarPrimitive.Header>
