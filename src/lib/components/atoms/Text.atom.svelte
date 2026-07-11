<script lang="ts">
	let { tag = 'p', class: className = '', children } = $props<{ tag?: string; class?: string; children?: any }>();
</script>

<svelte:element this={tag} class="text-base text-gray-900 {className}">
	{@render children?.()}
</svelte:element>
