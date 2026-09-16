# Repository Governance

This document records the minimum governance baseline for the CIS-Lab website repository.

## Current verified state (2026-09-16)

- Repository owner account: `CISLaboratory` (GitHub **User** account, not an Organization).
- Default branch: `main`.
- `main` branch protection/ruleset: **not enabled**.
- Required status checks on `main`: **not enforced**.
- Delete head branches after pull requests are merged: **disabled**.
- Repository Issues: **disabled**.
- `Leslie0319` currently has **write** access, but not `maintain` or `admin` access.
- The repository is a fork of `su-nan-ze/test-web2`; this does not block current maintenance but should be considered in any future repository migration.

## Admin actions required

These settings require the repository owner or another account with administrative permission.

### 1. Record repository ownership and recovery responsibility

- Identify the person(s) who control the `CISLaboratory` owner account and record this internally within the laboratory.
- Confirm that account recovery and two-factor authentication are configured and are not dependent on one graduating student.
- Record at least one backup maintainer/admin path for handover continuity.
- Do **not** share a personal GitHub password as the normal collaboration mechanism; use repository permissions instead.

### 2. Protect `main`

Create a branch ruleset / branch protection rule for `main` with at least:

- Require changes to go through a pull request before merging.
- Require the repository's `Validate site content` GitHub Actions check (select the actual check shown by GitHub from recent PR runs) before merge.
- Block force pushes to `main`.
- Block deletion of `main`.
- Keep administrators able to recover the repository when necessary, but avoid routine direct pushes to `main`.

Optional but recommended once more than one maintainer is active:

- Require review approval for code/structural changes.
- Require conversations to be resolved before merge.

### 3. Delete merged branches automatically

In repository settings, enable automatic deletion of head branches after pull requests are merged. This prevents temporary `codex/*`, `content/*`, `maintenance/*`, and similar branches from accumulating.

Existing stale merged branches can be cleaned up separately after verifying that they are no longer needed.

### 4. Enable Issues for maintenance tracking

Enable GitHub Issues for this repository so that future website maintenance, content gaps, SEO work, and architecture migrations can be tracked independently of pull requests.

Recommended issue categories/labels once Issues are enabled:

- `content`
- `bug`
- `maintenance`
- `seo`
- `governance`
- `architecture`

### 5. Decide long-term repository ownership model

The current repository is owned by a GitHub User account. This is workable in the short term. For long-term laboratory continuity, evaluate moving the website to a GitHub Organization so administrative responsibility can be assigned to multiple people without sharing one owner account.

Do not migrate only for cosmetic reasons. Any migration must first account for GitHub Pages URLs, redirects, SEO, repository history, and the current fork relationship.

## Maintainer workflow after governance is enabled

Routine maintenance should follow:

`topic branch → automated validation → pull request → review (when required) → merge → automatic branch cleanup`

Direct pushes to `main` should be reserved for exceptional recovery situations.
