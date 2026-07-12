<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import type { HeadingLevel } from "./index.js";
	import { cn } from "$lib/utils.js";

	type Props = HTMLAttributes<HTMLHeadingElement> & {
		tag?: HeadingLevel;
		children?: import('svelte').Snippet;
	};

	let { class: className, tag = "h3", children, ...restProps }: Props = $props();
</script>

<svelte:element
	this={tag}
	class={cn("text-lg font-semibold leading-none tracking-tight", className)}
	{...restProps}
>
	{@render children?.()}
</svelte:element>
