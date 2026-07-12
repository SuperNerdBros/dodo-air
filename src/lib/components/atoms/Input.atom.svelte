<script lang="ts">
	let { value = $bindable(''), class: className = '', ...rest } = $props<{ value?: any; class?: string; [key: string]: any }>();
</script>
<input class={className} bind:value {...rest} />
