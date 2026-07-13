import { setContext, getContext } from 'svelte';
export function setAppState(state: any) {
	setContext('appState', state);
}
export function getAppState(): any {
	return getContext('appState');
}
