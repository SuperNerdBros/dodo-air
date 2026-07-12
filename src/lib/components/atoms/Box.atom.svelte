<script lang="ts">
	let { tag = 'div', class: className = '', children, ...rest } = $props<{ tag?: string; class?: string; children?: any; [key: string]: any }>();
</script>
<svelte:element this={tag} class={className} {...rest}>
	{@render children?.()}
</svelte:element>
