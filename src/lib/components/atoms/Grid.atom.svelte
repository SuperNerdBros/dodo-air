<script lang="ts">
	import type { Snippet } from 'svelte';

	let { class: className = '', children } = $props<{ class?: string; children?: Snippet }>();
</script>

<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 {className}">
	{@render children?.()}
</div>
