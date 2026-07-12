<script lang="ts">
	let { class: className = '', children, ...rest } = $props<{ class?: string; children?: any; [key: string]: any }>();
</script>
<button class={className} {...rest}>
	{@render children?.()}
</button>
