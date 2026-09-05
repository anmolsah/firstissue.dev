# Contributors to FirstIssue.dev 🌱

Thank you for being part of FirstIssue.dev! Every leaf on our **Contribution Tree** represents a developer who took their first step into open source.

## How to add yourself to the Contribution Tree

You can add yourself directly by submitting a Pull Request! Follow the quick steps below:

### 1. Fork this repository
Click the **Fork** button at the top right of the repository page.

### 2. Clone your fork
```bash
git clone https://github.com/<YOUR-GITHUB-USERNAME>/firstissue.dev.git
cd firstissue.dev
```

### 3. Create a branch
```bash
git switch -c add-<YOUR-GITHUB-USERNAME>
```
*(If you are on an older Git version, use `git checkout -b add-<YOUR-GITHUB-USERNAME>`)*

### 4. Add your profile to `src/data/contributors.json`
Open `src/data/contributors.json` in your code editor and append your details to the list:

```json
  {
    "id": "<next-available-id>",
    "name": "Your Full Name",
    "github": "your-github-username",
    "avatar": "https://github.com/your-github-username.png",
    "role": "Contributor",
    "message": "Your personal message or quote here! 🌱",
    "joinedAt": "YYYY-MM-DD",
    "branch": "center"
  }
```

> **Note:** Please make sure your JSON syntax is valid (commas between objects, no trailing comma on the last item).

### 5. Commit and Push
```bash
git add src/data/contributors.json
git commit -m "feat(contributors): add <YOUR-GITHUB-USERNAME> to contribution tree"
git push -u origin add-<YOUR-GITHUB-USERNAME>
```

### 6. Submit a Pull Request
Go to your fork on GitHub and click **Compare & pull request**. Submit your PR!

Once your PR is reviewed and merged into `main`, your leaf and avatar will automatically appear on the interactive **Contribution Tree** on [firstissue.dev](https://firstissue.dev)!
