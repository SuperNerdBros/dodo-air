<script lang="ts">
	import Text from '@atoms/Text.atom.svelte';
	import Badge from '@atoms/Badge.atom.svelte';

	let { statusText = 'Operational' } = $props<{ statusText: string }>();
</script>

<div class="flex items-center space-x-2">
	<Text tag="span" class="text-sm font-medium text-gray-600">System Status:</Text>
	<Badge text={statusText} type="success" />
</div>
