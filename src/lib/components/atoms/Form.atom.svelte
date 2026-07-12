<script lang="ts">
	let { class: className = '', children, ...rest } = $props<{ class?: string; children?: any; [key: string]: any }>();
</script>
<form class={className} {...rest}>
	{@render children?.()}
</form>
