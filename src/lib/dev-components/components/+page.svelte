<script lang="ts">
	import { enhance } from '$app/forms';
	import { Loader2, Package, CheckCircle2, Search, XCircle } from '@lucide/svelte';

	let { data, form }: { data: any; form: any } = $props();

	let searchQuery = $state('');
	let installing = $state(false);

	let filteredComponents = $derived(
		data.availableComponents.filter((c: string) =>
			c.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	let selected = $state<Set<string>>(new Set());

	function toggleSelection(comp: string) {
		const newSet = new Set(selected);
		if (newSet.has(comp)) {
			newSet.delete(comp);
		} else {
			newSet.add(comp);
		}
		selected = newSet;
	}

	function selectAllFiltered() {
		const newSet = new Set(selected);
		for (const comp of filteredComponents) {
			if (!data.installedComponents.includes(comp)) {
				newSet.add(comp);
			}
		}
		selected = newSet;
	}

	function deselectAll() {
		selected = new Set();
	}
</script>

<div class="min-h-screen bg-zinc-950 text-zinc-50 p-8 font-sans">
	<div class="max-w-5xl mx-auto space-y-8">
		<header class="space-y-2 border-b border-zinc-800 pb-8">
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-4xl font-bold tracking-normal text-white flex items-center gap-3">
						<Package class="w-10 h-10 text-emerald-400" />
						Component Installer
					</h1>
					<p class="text-zinc-400 mt-2 text-lg">
						Rapidly install shadcn-svelte components into your atomic workspace.
					</p>
				</div>
			</div>
		</header>

		{#if form?.message}
			<div
				class="p-4 rounded-xl flex items-start gap-3 border {form.success
					? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-300'
					: 'bg-red-950/30 border-red-900/50 text-red-300'}"
			>
				{#if form.success}
					<CheckCircle2 class="w-6 h-6 shrink-0 mt-0.5 text-emerald-500" />
				{:else}
					<XCircle class="w-6 h-6 shrink-0 mt-0.5 text-red-500" />
				{/if}
				<div class="flex-1 space-y-2">
					<h3 class="font-semibold">{form.message}</h3>
					{#if form.output}
						<pre class="text-xs bg-black/50 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap font-system border border-white/5">{form.output}</pre>
					{/if}
				</div>
			</div>
		{/if}

		<div class="flex flex-col md:flex-row gap-6">
			<!-- Main Content -->
			<div class="flex-1 space-y-6">
				<div class="flex items-center justify-between gap-4">
					<div class="relative flex-1 max-w-sm">
						<Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
						<input
							type="text"
							bind:value={searchQuery}
							placeholder="Search components..."
							class="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-zinc-600"
						/>
					</div>
					<div class="flex gap-2">
						<button
							class="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors"
							onclick={selectAllFiltered}
						>
							Select All
						</button>
						<button
							class="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors"
							onclick={deselectAll}
						>
							Clear
						</button>
					</div>
				</div>

				<form
					method="POST"
					action="?/install"
					use:enhance={() => {
						installing = true;
						return async ({ update }) => {
							installing = false;
							selected.clear(); // Reset selection after install
							await update();
						};
					}}
				>
					<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
						{#each filteredComponents as comp}
							{@const isInstalled = data.installedComponents.includes(comp)}
							{@const isSelected = selected.has(comp)}
							<label
								class="relative flex items-start p-4 cursor-pointer rounded-xl border transition-all duration-200 {isInstalled
									? 'bg-zinc-900/50 border-zinc-800/50 opacity-60'
									: isSelected
									? 'bg-emerald-950/20 border-emerald-500/50 ring-1 ring-emerald-500/20'
									: 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50'}"
							>
								<div class="flex items-center gap-3">
									<input
										type="checkbox"
										name="components"
										value={comp}
										checked={isSelected}
										disabled={isInstalled || installing}
										onchange={() => toggleSelection(comp)}
										class="hidden"
									/>
									<div
										class="w-5 h-5 rounded border flex items-center justify-center transition-colors {isInstalled
											? 'border-emerald-500/50 bg-emerald-500/10'
											: isSelected
											? 'border-emerald-500 bg-emerald-500'
											: 'border-zinc-700 bg-zinc-800'}"
									>
										{#if isInstalled || isSelected}
											<CheckCircle2 class="w-3.5 h-3.5 {isInstalled ? 'text-emerald-500' : 'text-white'}" />
										{/if}
									</div>
									<span class="font-medium text-sm {isInstalled ? 'text-zinc-500' : 'text-zinc-200'}">
										{comp}
									</span>
								</div>
								{#if isInstalled}
									<span class="absolute top-2 right-2 text-sm uppercase font-bold tracking-wider text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
										Installed
									</span>
								{/if}
							</label>
						{/each}
					</div>

					<div class="fixed bottom-0 left-0 right-0 p-4 bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-800/50 flex justify-center transform transition-transform duration-300 {selected.size > 0 ? 'translate-y-0' : 'translate-y-full'}">
						<button
							type="submit"
							disabled={installing || selected.size === 0}
							class="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-8 py-3 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]"
						>
							{#if installing}
								<Loader2 class="w-5 h-5 animate-spin" />
								Installing {selected.size} Components...
							{:else}
								<Package class="w-5 h-5" />
								Install {selected.size} Selected Components
							{/if}
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
</div>
