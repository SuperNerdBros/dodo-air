<script lang="ts">
	// BoardLayout.template.svelte
	// A generic layout template for views that contain a header, optional filters, and main content.
	import type { Snippet } from 'svelte';

	let { 
		alert, 
		header, 
		filters, 
		content, 
		children 
	}: { 
		alert?: Snippet; 
		header?: Snippet; 
		filters?: Snippet; 
		content?: Snippet; 
		children?: Snippet; 
	} = $props();
</script>

<div class="space-y-4 pt-5">
	<!-- Optional top-level alerts or bubbles -->
	{#if alert}
		{@render alert()}
	{/if}

	<div class="space-y-3">
		<!-- Row 1: Title and summary counts -->
		{#if header}
			{@render header()}
		{/if}

		<!-- Row 2: Filter chips or search bars -->
		{#if filters}
			<div class="flex flex-wrap justify-center gap-1.5 px-1">
				{@render filters()}
			</div>
		{/if}

		<!-- Main Content (e.g., Table or Grid) -->
		{#if content}
			{@render content()}
		{/if}
		
		<!-- Default slot for any additional content -->
		{#if children}
			{@render children()}
		{/if}
	</div>
</div>
