<script lang="ts">
	import type { Snippet } from 'svelte';

	let { class: className = '', children } = $props<{ class?: string; children?: Snippet }>();
</script>

<section class="py-16 {className}">
	{@render children?.()}
</section>
