<script lang="ts">
	import Section from '@atoms/Section.atom.svelte';
	import Text from '@atoms/Text.atom.svelte';
	import Grid from '@atoms/Grid.atom.svelte';
	import FeatureCard from '@molecules/FeatureCard.molecule.svelte';

	let { features = [] } = $props<{ features: { title: string; description: string }[] }>();
</script>

<Section>
	<Text tag="h2" class="mb-8 text-center text-3xl font-extrabold text-gray-900">Why use this boilerplate?</Text>
	<Grid>
		{#each features as feature}
			<FeatureCard title={feature.title} description={feature.description} />
		{/each}
	</Grid>
</Section>
