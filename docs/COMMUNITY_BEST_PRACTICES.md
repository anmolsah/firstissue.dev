# Community Best Practices, Issue Triage & Quality Standards

Practical guide for open-source contributors and maintainers on communication, issue triage, and high-quality Pull Requests.

---

## 1. Creating Minimal Reproducible Examples (MRE / MCVE)

When filing a bug report, maintainers need to reproduce the problem without setting up your entire bespoke infrastructure. An MRE consists of:

1. **Minimal**: Strip out all unnecessary code, third-party libraries, and custom business logic until only the bug remains.
2. **Complete**: Include all imports, configuration files, and exact dependency versions needed to run the snippet.
3. **Verifiable**: State the exact input given, expected output, and actual output (including stack traces).

### Recommended Issue Template Structure:
```markdown
### Summary
Concise description of the bug and its impact.

### Steps to Reproduce
1. Run `npm run build`
2. Open `/profile/edit`
3. Click "Save Changes" without filling in bio

### Expected Behavior
A validation toast should appear indicating bio length requirements.

### Actual Behavior
Unhandled Promise rejection: `TypeError: Cannot read properties of undefined (reading 'length')`.

### Environment
- OS: macOS Sequoia 15.1 / Windows 11
- Browser: Chrome 128
- Node.js: v20.14.0
- Package Version: v2.4.1

### Reproduction Link or Code Snippet
```js
// Minimal snippet that triggers the bug
```
```

---

## 2. Pull Request & Code Review Etiquette

### For Contributors:
- **Keep PRs Focused & Atomic**: One feature or bug fix per PR. Do not combine stylistic refactorings with core bug fixes.
- **Link Issues Using Keywords**: Use GitHub issue linking syntax in your PR description:
  - `Fixes #123`
  - `Closes #456`
  - `Resolves #789`
  This automatically closes the issue when the PR merges.
- **Provide Visual Proof**: Include before/after screenshots or GIFs for UI changes.
- **Respond Respectfully to Feedback**: Review comments are about the code, not you. If you disagree, politely explain your technical rationale with benchmarks or documentation links.

### For Maintainers:
- **Acknowledge Contributions Promptly**: Even an automated acknowledgement or "Thank you, we'll review this soon" keeps contributors motivated.
- **Use GitHub Suggestion Blocks**: Provide actionable fixes directly in review comments:
  ````markdown
  ```suggestion
  const total = items.reduce((acc, curr) => acc + curr.amount, 0);
  ```
  ````
- **Protect Project Health**: Enforce automated linting, test suites, and formatting via CI before human review.

---

## 3. Semantic Versioning (SemVer 2.0.0) & Changelogs

Semantic versioning follows the formula `MAJOR.MINOR.PATCH`:
- **MAJOR (`X.0.0`)**: Incompatible API changes (breaking changes).
- **MINOR (`0.X.0`)**: Backwards-compatible new features.
- **PATCH (`0.0.X`)**: Backwards-compatible bug fixes.

### Keep a Changelog Format (`CHANGELOG.md`):
Group changes under standard categories:
- `Added`: New features.
- `Changed`: Changes in existing functionality.
- `Deprecated`: Soon-to-be removed features.
- `Removed`: Now removed features.
- `Fixed`: Bug fixes.
- `Security`: Vulnerability mitigations.
