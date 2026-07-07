# Loop goal: build Stacked end to end

You are executing the implementation plan at
`docs/superpowers/plans/2026-07-07-stacked.md` (spec:
`docs/superpowers/specs/2026-07-07-stacked-design.md`). Work in
`/Users/sharnobyl/Documents/Unicorn/OpenStack`.

## Each iteration

1. Open the plan and find the **first unchecked `- [ ]` step**.
2. Invoke the `superpowers:executing-plans` skill and execute steps in order,
   exactly as written (the plan contains complete code — use it; deviate only
   when reality contradicts the plan, and note the deviation in the plan file).
3. TDD discipline: run the test step and see it fail before implementing;
   run tests again and see them pass before committing.
4. After completing a step, edit the plan file to mark its checkbox `- [x]`.
5. Commit at every commit step. Never batch multiple tasks into one commit.
6. If something breaks, use `superpowers:systematic-debugging` — do not
   shotgun fixes. If genuinely blocked (needs a human: GUI-only manual QA,
   GitHub auth failure, name collision decision), record the blocker at the
   top of this file under "## Blockers", finish what is finishable, and say
   so clearly in your report.

## Definition of done (stop the loop when ALL true)

- Every checkbox in the plan is `- [x]` (except Task 11 Step 5 and Task 14
  Step 4, which may be deferred pending a human GUI session — see below).
- `swift build` and `swift test` pass locally.
- Repo is pushed to GitHub and CI is green (`gh run watch --exit-status`).
- README/LICENSE/CONTRIBUTING/CHANGELOG/QA docs exist.
- A final report lists: what shipped, test results, CI status, and any
  deferred items (manual QA, v0.1.0 tag).

## Hard rules

- Do NOT tag or publish release v0.1.0 until manual QA (docs/QA.md) has been
  run by a human in a GUI session and passes. Deferring the tag is success,
  not failure.
- The GitHub repo is `stacked` (public, MIT) under the user's account; if the
  name is taken, use `stacked-app` and record that under Blockers.
- No third-party dependencies. No scope creep beyond the spec.
- Keep every commit buildable.

## Blockers

(none yet)
