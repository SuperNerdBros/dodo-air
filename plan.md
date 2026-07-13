### Architecture Review: The "God Component" Anti-Pattern
I have successfully extracted the massive API logic into `src/lib/api/TerminalAPI.ts`. `+layout.svelte` has dropped by 150+ lines, but it is still ~1,200 lines long. 

After stepping back and analyzing the remaining 1,200 lines, I found the true architectural bottleneck: **`+layout.svelte` is acting as a "God Component" that hoards all the state and HTML for every modal in the entire application.**

Instead of letting the child tabs manage their own modals, the layout file currently manages:
1. `StandbyTicketModal` (Belongs in `DeparturesTab.svelte`)
2. `MilesStampBook` (Belongs in `PassportTab.svelte`)
3. `BoardingPassModal` (Belongs in `DeparturesTab.svelte`)
4. `FuelDepotModal` (Belongs in the Footer)
5. `TrustProfileModal` (Shared, but can be moved to a `GlobalModals` component)

It is hoarding variables like `requestGateType`, `requestTime`, `requestMemo`, `showStandbyModal`, `showMilesModal`, etc., and manually passing them down as 15+ props to each tab. 

### Svelte 5 Refactoring Plan
To permanently get `+layout.svelte` under 500 lines and adhere to Svelte standards:
1. **Decentralize Modals:** Move the `StandbyTicketModal`, `BoardingPassModal`, and their associated local state (`requestGateType`, `boardingError`, etc.) directly into `DeparturesTab.svelte`. 
2. **Move Passport Modals:** Move `MilesStampBook` and `PassportEditModal` into `PassportTab.svelte`.
3. **Extract Footer & Header:** Move the Footer (and the `FuelDepotModal`) into a dedicated `TerminalFooter.svelte` component.
4. **Extract Auth:** Move the inline `showLogoutModal` HTML into a small `LogoutModal.svelte` component.

This will naturally strip 500+ lines of HTML and state variables from `+layout.svelte` without breaking reactivity.
