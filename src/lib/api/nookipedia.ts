import type { AcnhItem } from '../types';

export async function searchNookipedia(query: string): Promise<AcnhItem[]> {
	if (!query || query.length < 2) return [];

	try {
		// Call our WordPress REST API endpoint that proxies the Cargo requests
		const res = await fetch(`/wp-json/dodo-air/v1/nookipedia/search?q=${encodeURIComponent(query)}`);
		
		if (!res.ok) {
			console.error('Failed to fetch from Nookipedia proxy endpoint');
			return [];
		}

		const results: AcnhItem[] = await res.json();
		return results;
	} catch (error) {
		console.error('Error fetching Nookipedia search:', error);
		return [];
	}
}
