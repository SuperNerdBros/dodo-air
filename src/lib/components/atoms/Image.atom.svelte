<script lang="ts">
	let { class: className = '', ...rest } = $props<{ class?: string; [key: string]: any }>();
</script>
<img class={className} {...rest} />
