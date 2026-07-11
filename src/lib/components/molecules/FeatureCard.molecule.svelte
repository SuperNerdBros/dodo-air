<script lang="ts">
	import Card from '@atoms/Card.atom.svelte';
	import Text from '@atoms/Text.atom.svelte';

	let { title = '', description = '' } = $props<{ title: string; description: string }>();
</script>

<Card class="flex flex-col h-full">
	<Text tag="h3" class="mb-2 text-xl font-bold text-gray-900">{title}</Text>
	<Text tag="p" class="text-gray-600">{description}</Text>
</Card>
