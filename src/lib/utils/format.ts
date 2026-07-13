/**
 * Formats a Switch Friend Code.
 * Standard format: SW-XXXX-XXXX-XXXX
 * - Strips any leading 'SW-' prefix (case-insensitive).
 * - Strips all non-digit and non-X/x characters.
 * - Caps at 12 characters of actual code.
 * - Inserts dashes at positions 4 and 8.
 * - Always pre-pends 'SW-' (if not completely empty).
 */
export function formatFriendCode(val: string): string {
	if (!val) return '';
	let cleaned = val.replace(/^SW-?/i, '');
	cleaned = cleaned.replace(/[^0-9X]/gi, '').toUpperCase();
	cleaned = cleaned.slice(0, 12);

	let part1 = cleaned.slice(0, 4);
	let part2 = cleaned.slice(4, 8);
	let part3 = cleaned.slice(8, 12);

	let formatted = 'SW-';
	if (part1) formatted += part1;
	if (part2) formatted += '-' + part2;
	if (part3) formatted += '-' + part3;

	return formatted;
}

/**
 * Formats a Dream Address.
 * Standard format: DA-XXXX-XXXX-XXXX
 * - Strips any leading 'DA-' prefix (case-insensitive).
 * - Strips all non-digit and non-X/x characters.
 * - Caps at 12 characters of actual code.
 * - Inserts dashes at positions 4 and 8.
 * - Always pre-pends 'DA-' (if not completely empty).
 */
export function formatDreamAddress(val: string): string {
	if (!val) return '';
	let cleaned = val.replace(/^DA-?/i, '');
	cleaned = cleaned.replace(/[^0-9X]/gi, '').toUpperCase();
	cleaned = cleaned.slice(0, 12);

	let part1 = cleaned.slice(0, 4);
	let part2 = cleaned.slice(4, 8);
	let part3 = cleaned.slice(8, 12);

	let formatted = 'DA-';
	if (part1) formatted += part1;
	if (part2) formatted += '-' + part2;
	if (part3) formatted += '-' + part3;

	return formatted;
}
