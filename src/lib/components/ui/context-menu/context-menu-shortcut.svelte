<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { cn } from "$lib/utils/ui.js";

	type $$Props = HTMLAttributes<HTMLSpanElement>;

	interface Props {
		class?: $$Props["class"];
		children?: import('svelte').Snippet;
		[key: string]: any
	}

	let { class: className = undefined, children, ...rest }: Props = $props();
	
</script>

<span
	class={cn("text-muted-foreground ml-auto text-xs tracking-widest", className)}
	{...rest}
>
	{@render children?.()}
</span>
