# Feature Branching Strategy / GitHub Flow

## Structure

- **One main branch** that is stable and working at all times
- Create branches from `main` (`feat/`, `fix/`)
- Push branch and open pull request
- Continuous Integration tests
- At least one review required
- No direct commits to `main`
- Merge into `main` after approval
- Continuous Deployment
- Delete branch


### Optional Workflow (Without CI/CD)
- Push branch and open pull request
- At least one review required
- No direct commits to `main`
- Merge into `main` after approval
- Delete branch

### Workflow Diagram
```
main → new branch → PR → review → merge
|----feature----|
|               |
------------------------------------------------ main
        |                 |
        |-------fix-------|
```

---

## Naming Conventions

### Format
```
<type>/<short-description>
```

### Branch Types

- **`feat/`**      — New functionality
- **`fix/`**       — Bug fixes for existing functionality
- **`hotfix/`**    — Urgent production fixes
- **`refactor/`**  — Code changes/improvements/restructure without changing functionality
- **`docs/`**      — Documentation only changes
- **`test/`**      — Automated tests
- **`chore/`**     — Maintenance, config, dependency updates, file organization/reorganization, no production code change


### Examples

- **Main branch** : `main`
- **Feature**     : `feat/ui-mockup`
- **Fix**         : `fix/ui-main-menu-title-size`
- **Refactor**    : `refactor/ui-main-menu-buttons`
- **Docs**        : `docs/branch-naming-convention-document`
- **Test**        : `test/inventory-stacking`
- **Hotfix**      : `hotfix/player-movement-lag`
- **Chore**       : `chore/reorganize-assets-folder`

---

## Commit Messages

### Format
```
<type>[optional scope]: <description>

[optional body]

[optional footer]
```

### Examples

#### Feature Commits
- `feat(player-movement): add basic movement`
- `feat(player-movement): implement jump mechanic`

#### Fix Commits
- `fix(ui): fix canvas size`
- `fix(inventory): prevent item duplication`

#### Hotfix Commits
- `hotfix(save-system): fix stone ore not saving`
- `hotfix(ui): fix experience level not showing when player dies`

#### Refactor Commits
- `refactor(save-system): refactor saving`
- `refactor(player-movement): separate input from movement logic`

#### Documentation Commits
- `docs(git-branching-strategy): add branching strategy`
- `docs(readme): update readme file`

#### Test Commits
- `test(player-movement): add jump height unit test`
- `test(inventory): update item duplication unit test`

#### Chore Commits
- `chore(project): reorganize asset folder`
- `chore(unity): update Unity version to 2022.3`

---

## Rules

### Branch Naming
- ✅ Use lowercase
- ✅ Separate words with hyphens
- ✅ Keep descriptions under 50 characters
- ✅ Be specific: `feat/player-movement` **not** `feat/player`

### Commit Messages
- ✅ Use the imperative mood in the subject line (let it seem like you're giving a command)
  - Example: `feat(player-movement): add unit tests`
- ✅ Do not end the subject line with a period
- ✅ Separate the subject from the body with a blank line
- ✅ Wrap the body at 72 characters
- ✅ Use the body to explain **what** and **why**
- ✅ Describe what was done and why, but **not how**

---

## TODO Add example of body and footer
