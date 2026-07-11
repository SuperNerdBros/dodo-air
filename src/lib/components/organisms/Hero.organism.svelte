<script lang="ts">
	import Text from '@atoms/Text.atom.svelte';
	import Section from '@atoms/Section.atom.svelte';
	import Container from '@atoms/Container.atom.svelte';
	import StatusIndicator from '@molecules/StatusIndicator.molecule.svelte';

	let { title = '', subtitle = '', status = '' } = $props<{ title: string; subtitle: string; status: string }>();
</script>

<Section class="flex flex-col items-center justify-center space-y-6 pt-24 text-center">
	<Container class="space-y-4">
		<Text tag="h1" class="text-5xl font-extrabold tracking-tight text-gray-900 md:text-7xl">
			{title}
		</Text>
		<Text tag="p" class="mx-auto max-w-2xl text-lg text-gray-500 md:text-xl">
			{subtitle}
		</Text>
	</Container>
	<StatusIndicator statusText={status} />
</Section>
