<script lang="ts">
	import Hero from '@organisms/Hero.organism.svelte';
	import FeaturesList from '@organisms/FeaturesList.organism.svelte';
	import StructureList from '@organisms/StructureList.organism.svelte';
	import Container from '@atoms/Container.atom.svelte';

	let {
		heroTitle = '',
		heroSubtitle = '',
		heroStatus = '',
		features = [],
		structure = []
	} = $props<{
		heroTitle: string;
		heroSubtitle: string;
		heroStatus: string;
		features: { title: string; description: string }[];
		structure: { name: string; description: string }[];
	}>();
</script>

<!-- The template defines layout wrappers but relies on organisms for content -->
<div class="min-h-screen bg-white pb-24">
	<Container>
		<Hero title={heroTitle} subtitle={heroSubtitle} status={heroStatus} />
		<FeaturesList {features} />
		<StructureList items={structure} />
	</Container>
</div>
