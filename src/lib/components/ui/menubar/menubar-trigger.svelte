<script lang="ts">
	import { Menubar as MenubarPrimitive } from "bits-ui";
	import { cn } from "$lib/utils/ui.js";

	type $$Props = MenubarPrimitive.TriggerProps;
	type $$Events = MenubarPrimitive.TriggerEvents;

	interface Props {
		class?: $$Props["class"];
		children?: import('svelte').Snippet;
		[key: string]: any
	}

	let { class: className = undefined, children, ...rest }: Props = $props();
	
</script>

<MenubarPrimitive.Trigger
	class={cn(
		"focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default select-none items-center rounded-sm px-3 py-1 text-sm font-medium outline-none",
		className
	)}
	{...rest}
	on:click
	on:keydown
	on:pointerenter
>
	{@render children?.()}
</MenubarPrimitive.Trigger>
