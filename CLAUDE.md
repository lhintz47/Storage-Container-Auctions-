# Project conventions

## Planning documents (`docs/plan.html`, `docs/hardware-plan.html`)

These are living HTML artifacts tracking the business and hardware/software plans for the
container auction platform. When editing them:

- **Always embed source links directly in the document**, not just in chat. If a fact comes
  from web research (a datasheet, vendor docs, a spec), cite it in the doc's own References
  section with the actual URL — not just the source's name in prose. A "Sourced:" callout
  that names a datasheet without linking it is incomplete.
- Each doc keeps one `References` section (last, before/after Open Questions) grouping links
  by what they back up. Add new citations there when adding sourced content elsewhere in the
  doc, rather than leaving links to exist only in conversation history.
- After editing either file in the scratchpad/artifact copy, copy it back to `docs/` and
  commit + push so it survives the session (the environment reclaims uncommitted work).
- Keep both docs' internal `Sec. NN` / `SPEC-NN` cross-references in sync when inserting or
  reordering sections — a renumbered section leaves stale references elsewhere that need
  updating too.
