<script lang="ts">
	import { Checkbox as CheckboxPrimitive } from "bits-ui";
	import Check from "svelte-radix/Check.svelte";
	import Minus from "svelte-radix/Minus.svelte";
	import { cn } from "$lib/utils/ui.js";

	type $$Props = CheckboxPrimitive.Props;
	type $$Events = CheckboxPrimitive.Events;

	interface Props {
		class?: $$Props["class"];
		checked?: $$Props["checked"];
		[key: string]: any
	}

	let { class: className = undefined, checked = $bindable(false), ...rest }: Props = $props();
	
</script>

<CheckboxPrimitive.Root
	class={cn(
		"border-primary focus-visible:ring-ring data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground peer box-content h-4 w-4 shrink-0 rounded-sm border shadow focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50",
		className
	)}
	bind:checked
	on:click
	{...rest}
>
	<CheckboxPrimitive.Indicator
		class={cn("flex h-4 w-4 items-center justify-center text-current")}
		
		
	>
		{#snippet children({ isChecked, isIndeterminate })}
				{#if isIndeterminate}
				<Minus class="h-3.5 w-3.5" />
			{:else}
				<Check class={cn("h-3.5 w-3.5", !isChecked && "text-transparent")} />
			{/if}
					{/snippet}
		</CheckboxPrimitive.Indicator>
</CheckboxPrimitive.Root>
