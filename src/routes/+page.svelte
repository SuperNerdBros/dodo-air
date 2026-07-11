<script lang="ts">
	import HomeView from '@views/HomeView.view.svelte';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
</script>

<!-- 
	The route purely acts as the bridge between the SvelteKit loader (server)
	and the State Injection Layer (View).
-->
<HomeView pageData={data.pageData} />
