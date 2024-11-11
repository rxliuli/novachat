<script lang="ts">
	import { Accordion as AccordionPrimitive } from "bits-ui";
	import ChevronDown from "svelte-radix/ChevronDown.svelte";
	import { cn } from "$lib/utils/ui.js";

	type $$Props = AccordionPrimitive.TriggerProps;
	type $$Events = AccordionPrimitive.TriggerEvents;

	interface Props {
		class?: $$Props["class"];
		level?: AccordionPrimitive.HeaderProps["level"];
		children?: import('svelte').Snippet;
		[key: string]: any
	}

	let { class: className = undefined, level = 3, children, ...rest }: Props = $props();
	
</script>

<AccordionPrimitive.Header {level} class="flex">
	<AccordionPrimitive.Trigger
		class={cn(
			"flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
			className
		)}
		{...rest}
		on:click
	>
		{@render children?.()}
		<ChevronDown
			class="text-muted-foreground h-4 w-4 shrink-0 transition-transform duration-200"
		/>
	</AccordionPrimitive.Trigger>
</AccordionPrimitive.Header>
