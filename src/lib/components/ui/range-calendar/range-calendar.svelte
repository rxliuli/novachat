<script lang="ts">
	import { RangeCalendar as RangeCalendarPrimitive } from "bits-ui";
	import * as RangeCalendar from "./index.js";
	import { cn } from "$lib/utils/ui.js";

	type $$Props = RangeCalendarPrimitive.Props;
	type $$Events = RangeCalendarPrimitive.Events;


	interface Props {
		value?: $$Props["value"];
		placeholder?: $$Props["placeholder"];
		weekdayFormat?: $$Props["weekdayFormat"];
		startValue?: $$Props["startValue"];
		class?: $$Props["class"];
		[key: string]: any
	}

	let {
		value = $bindable(undefined),
		placeholder = $bindable(undefined),
		weekdayFormat = "short",
		startValue = $bindable(undefined),
		class: className = undefined,
		...rest
	}: Props = $props();
	
</script>

<RangeCalendarPrimitive.Root
	bind:value
	bind:placeholder
	bind:startValue
	{weekdayFormat}
	class={cn("p-3", className)}
	{...rest}
	on:keydown
	
	
>
	{#snippet children({ months, weekdays })}
		<RangeCalendar.Header>
			<RangeCalendar.PrevButton />
			<RangeCalendar.Heading />
			<RangeCalendar.NextButton />
		</RangeCalendar.Header>
		<RangeCalendar.Months>
			{#each months as month}
				<RangeCalendar.Grid>
					<RangeCalendar.GridHead>
						<RangeCalendar.GridRow class="flex">
							{#each weekdays as weekday}
								<RangeCalendar.HeadCell>
									{weekday.slice(0, 2)}
								</RangeCalendar.HeadCell>
							{/each}
						</RangeCalendar.GridRow>
					</RangeCalendar.GridHead>
					<RangeCalendar.GridBody>
						{#each month.weeks as weekDates}
							<RangeCalendar.GridRow class="mt-2 w-full">
								{#each weekDates as date}
									<RangeCalendar.Cell {date}>
										<RangeCalendar.Day {date} month={month.value} />
									</RangeCalendar.Cell>
								{/each}
							</RangeCalendar.GridRow>
						{/each}
					</RangeCalendar.GridBody>
				</RangeCalendar.Grid>
			{/each}
		</RangeCalendar.Months>
	{/snippet}
</RangeCalendarPrimitive.Root>
