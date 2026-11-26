

## Shared multi-agent coordination (FirstDay portfolio)

Applies to ChatGPT, Claude, Gemini, Muse and other automated contributors. Preserve existing project-specific rules, priorities, authorization and release gates; if they conflict, stop and ask the owner. No new deployment authority.

Before editing, refresh default branch, open issues/PRs/branches and docs/claims.json. Claim a unique issue, agent, branch, exact path prefixes, shared interfaces/migrations, acceptance tests and UTC expiry by compare-and-swap update of the registry on default branch using current blob SHA. On conflict reread and retry. Never edit without confirmed claim. Reject intersecting paths (including ancestors/descendants), shared contracts, migrations and cross-repo dependencies; acquire cross-repo claims in sorted repository order before editing. Treat existing active PRs/work as occupied until reconciled even if not registered. If registry inaccessible, stop.

Use agent/<agent>/<issue> branches and one PR per claim. No force push or direct implementation edits on default branch. Renew before expiry; inspect PR/branch and record handoff before taking expired work. Record owner, scope, status, commit, tests and next action in issue/PR; release claim only after merge or documented abandonment. Do not edit another agent's work without explicit handoff. Owning agent fixes and reruns failed automated tests; do not weaken or bypass tests. Preserve release rules. Test on Vulcan/Qonos and optionally verified Romulus GUI runner, never Daedalus. This cooperative protocol does not prove automated enforcement; verify branch protection and CI separately.
