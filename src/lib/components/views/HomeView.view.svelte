<script lang="ts">
	import HomeTemplate from '@templates/HomeTemplate.template.svelte';

	// The View acts as the data injection layer. No raw styled HTML here.
	let { pageData } = $props<{
		pageData: {
			title: string;
			message: string;
			status: string;
			features: { title: string; description: string }[];
			structure: { name: string; description: string }[];
		};
	}>();
</script>

<HomeTemplate
	heroTitle={pageData.title}
	heroSubtitle={pageData.message}
	heroStatus={pageData.status}
	features={pageData.features}
	structure={pageData.structure}
/>
