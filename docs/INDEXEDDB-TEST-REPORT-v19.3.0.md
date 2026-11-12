# v19.3.0 IndexedDB test preview

Date: November 12, 2026. Scope: `mega-tinker/ttc-shift-log-test`, branch `test-v19.3.0`. Production repository/main and production Pages configuration are unchanged.

## Implementation

`storage.js` is the integrated adapter. The original isolated `indexeddb.js` remains as a historical foundation; it is not loaded by the UI. The integrated database name includes the site's directory path. `records` stores the raw logical values without embedded photo payloads, `photos` stores content-addressed binary Blobs, and `metadata` stores a revision and migration marker. This preserves the existing validation and JSON representation at the UI boundary. Recovery, drafts and deleted items reuse photo blobs instead of full-photo database snapshots. Unreferenced blobs are retained in this preview; there is no automatic storage cleanup.

Startup waits for hydration/migration before enabling the form. Record saves, Spareboard/holiday changes, recovery snapshots and associated trash changes use atomic IndexedDB transactions. A revision check rejects stale-tab writes. Success messages follow transaction completion. Failed saves retain the unfinished form. Draft writes are serialized; Save clicks arriving during a draft commit wait and then proceed.

The migration copies the eight recognized legacy keys, resolves interrupted legacy journals in memory, validates active records and metadata, verifies photo roundtrips, commits atomically and compares the full hydrated result. The marker and all migrated values commit together, so aborted migration can retry. The adapter never writes or removes legacy localStorage keys, and never falls back to localStorage after an IndexedDB error.

## Shared-origin correction

Different GitHub Pages paths under `mega-tinker.github.io` share an origin. Earlier claims that the test path alone isolated localStorage were incorrect. The new test database and service-worker cache are explicitly namespaced by path/scope. Initial copying of shared legacy data requires an on-screen choice; declining creates an empty test database without changing legacy data. No real backup is imported automatically. Old legacy keys cannot reliably identify which site originally wrote them.

The new service worker only handles its own scope and reads its own versioned cache. It neither deletes old caches nor forces an update into open tabs. Close all test-site tabs and reopen if the older version is still active. Production's existing service-worker scope and permissions are not changed by this release.

## Verification

`npm test` runs eight migration/integration groups plus the existing camera, holiday, history, Spareboard editing and Spareboard workflow suites, adapted for asynchronous storage. All fixtures are synthetic; no private backup is required.

Covered: fresh installation; consent/decline of shared legacy copying; exact raw-value and photo preservation; restart without repeating migration; a 6 MiB logical value; malformed migration; interrupted legacy journal; aborted migration and retry; simulated quota abort; stale-tab conflict; UI save/edit; 13-minute paid 2x OT; holiday credit and holiday work categories; report-only Spareboard days; multiple pieces; waiting; delete scopes/undo/recovery; JSON v1/v2/v3 imports, merges and replacements; filters/history; drafts; failed saves retaining the entry; and rollback-readable records. The legacy rollback test renders exported work with the prior app version.

`npm run test:browser` passes in an isolated headless Microsoft Edge profile using the actual browser's IndexedDB and service worker: save, 13-minute OT, reload persistence, offline reload, offline edit, and second offline reload. The test profile does not use the user's normal browser data.

Quota errors and migration interruption are injected transaction failures, not a claim that a physical device was filled. The 6 MiB check is an automated adapter test. Safari/iPhone installed-PWA behavior, device-specific eviction, and the user's real 79-record backup remain unverified. Keep JSON backups. IndexedDB is larger storage, not unlimited or a backup service.

## Recovery and rollback

Before any code rollback, export a full JSON backup from the upgraded test app. The preserved legacy localStorage contains the pre-migration state, not later IndexedDB edits. Old code will see that older state until a compatible JSON export is explicitly imported. Never copy the IndexedDB cache directly over production localStorage.

To roll back the test deployment, publish the previous test commit `31550a1af37a9210a087d7841e5fa96c2bc37e18` through a normal reverting commit; retain both databases, legacy keys and caches. Close all test tabs so the corresponding service worker can activate. Restore the exported JSON if later preview edits are needed. No production merge is authorized.

## Review

Manual diff review checked every storage mutation and asynchronous save call, untouched payroll logic (`core.js`), namespace boundaries, service-worker version consistency, atomic abort behavior, JSON compatibility and stale-tab protection. The regression and real-browser checks caught and corrected unawaited metadata writes the Save/draft click race, and invalidation of queued drafts after a failed record commit. External CodeRabbit approval must not be claimed unless an actual review is returned on the test PR.
