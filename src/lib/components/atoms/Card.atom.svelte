<script lang="ts">
	import type { Snippet } from 'svelte';

	let { class: className = '', children } = $props<{ class?: string; children?: Snippet }>();
</script>

<div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md {className}">
	{@render children?.()}
</div>
