<script lang="ts">
	let { value = $bindable(''), class: className = '', children, ...rest } = $props<{ value?: any; class?: string; children?: any; [key: string]: any }>();
</script>
<select class={className} bind:value {...rest}>
	{@render children?.()}
</select>
