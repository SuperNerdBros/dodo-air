<script lang="ts">
	let { text = '', type = 'default' }: { text: string; type?: 'default' | 'success' | 'error' } = $props();

	const baseClasses = 'inline-block rounded-full px-3 py-1 text-xs font-semibold';
	const typeClasses: Record<'default' | 'success' | 'error', string> = {
		default: 'bg-gray-200 text-gray-800',
		success: 'bg-green-100 text-green-800',
		error: 'bg-red-100 text-red-800'
	};
</script>

<span class="{baseClasses} {typeClasses[type]}">
	{text}
</span>

