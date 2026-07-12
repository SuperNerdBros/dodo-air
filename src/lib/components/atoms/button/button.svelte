<script lang="ts" module>
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from "svelte/elements";
	import { type VariantProps, tv } from "tailwind-variants";

	export const buttonVariants = tv({
		base: "font-system font-black tracking-wide rounded-[1rem] border-x-2 border-t-2 border-b-4 transition-all active:translate-y-1 active:border-b-[2px] disabled:pointer-events-none disabled:opacity-50 select-none inline-flex items-center justify-center whitespace-nowrap outline-none focus-visible:ring-4 focus-visible:ring-ring/50 [&_svg]:pointer-events-none [&_svg]:shrink-0 gap-2",
		variants: {
			variant: {
				default: "bg-[#0084CC] text-white border-x-[#0073B3] border-t-[#0073B3] border-b-[#005788] hover:bg-[#0095E8] shadow-sm",
				outline: "bg-white text-[#8C7A5A] border-x-[#F2F2F2] border-t-[#F2F2F2] border-b-[#E0E0E0] hover:bg-[#FFFDF5] hover:-translate-y-0.5 shadow-sm",
				secondary: "bg-[#FFCC00] text-[#7A5A00] border-x-[#E5B800] border-t-[#E5B800] border-b-[#CC9900] hover:bg-[#FFD633] shadow-sm",
				ghost: "border-transparent bg-transparent hover:bg-black/5 hover:border-black/5 border-b-transparent active:border-b-transparent active:border-transparent",
				destructive: "bg-[#FF4747] text-white border-x-[#E63939] border-t-[#E63939] border-b-[#CC0000] hover:bg-[#FF5C5C] shadow-sm",
				link: "text-[#0084CC] underline-offset-4 hover:underline border-transparent bg-transparent border-b-transparent active:border-transparent",
			},
			size: {
				default: "h-11 px-5 py-2.5 text-base [&_svg:not([class*='size-'])]:size-5",
				xs: "h-7 px-2.5 text-xs rounded-[0.75rem] border-b-[3px] active:border-b-[1px] [&_svg:not([class*='size-'])]:size-3",
				sm: "h-9 px-3.5 text-sm rounded-[0.875rem] border-b-[3px] active:border-b-[1px] [&_svg:not([class*='size-'])]:size-4",
				lg: "h-14 px-8 py-3 text-lg rounded-[1.25rem] border-b-[6px] active:border-b-[3px] [&_svg:not([class*='size-'])]:size-6",
				icon: "size-11",
				"icon-xs": "size-7 rounded-[0.75rem] border-b-[3px] active:border-b-[1px] [&_svg:not([class*='size-'])]:size-3",
				"icon-sm": "size-9 rounded-[0.875rem] border-b-[3px] active:border-b-[1px] [&_svg:not([class*='size-'])]:size-4",
				"icon-lg": "size-14 rounded-[1.25rem] border-b-[6px] active:border-b-[3px] [&_svg:not([class*='size-'])]:size-6",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	});

	export type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];
	export type ButtonSize = VariantProps<typeof buttonVariants>["size"];

	export type ButtonProps = WithElementRef<HTMLButtonAttributes> &
		WithElementRef<HTMLAnchorAttributes> & {
			variant?: ButtonVariant;
			size?: ButtonSize;
		};
</script>

<script lang="ts">
	let {
		class: className,
		variant = "default",
		size = "default",
		ref = $bindable(null),
		href = undefined,
		type = "button",
		disabled,
		children,
		...restProps
	}: ButtonProps = $props();
</script>

{#if href}
	<a
		bind:this={ref}
		data-slot="button"
		class={cn(buttonVariants({ variant, size }), className)}
		href={disabled ? undefined : href}
		aria-disabled={disabled}
		role={disabled ? "link" : undefined}
		tabindex={disabled ? -1 : undefined}
		{...restProps}
	>
		{@render children?.()}
	</a>
{:else}
	<button
		bind:this={ref}
		data-slot="button"
		class={cn(buttonVariants({ variant, size }), className)}
		{type}
		{disabled}
		{...restProps}
	>
		{@render children?.()}
	</button>
{/if}
