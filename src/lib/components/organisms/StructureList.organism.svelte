<script lang="ts">
	import Section from '@atoms/Section.atom.svelte';
	import Text from '@atoms/Text.atom.svelte';
	import Grid from '@atoms/Grid.atom.svelte';
	import FeatureCard from '@molecules/FeatureCard.molecule.svelte';

	let { items = [] } = $props<{ items: { name: string; description: string }[] }>();
</script>

<Section>
	<Text tag="h2" class="mb-8 text-center text-3xl font-extrabold text-gray-900">Atomic Structure</Text>
	<Grid>
		{#each items as item}
			<FeatureCard title={item.name} description={item.description} />
		{/each}
	</Grid>
</Section>
