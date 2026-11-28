---
title: "Your First Open Source Contribution"
description: "Learn how to find and contribute to your first open source issue using FirstIssue.dev"
readTime: "8 min read"
updated: "2 days ago"
difficulty: "Beginner"
order: 1
---
Welcome to your open source journey! FirstIssue.dev is designed to help students and beginners find their perfect first contribution. This guide will walk you through the entire process.

## What is Open Source?

Open source software is code that's freely available for anyone to view, use, and contribute to. It's like a collaborative cookbook where developers worldwide share recipes (code) and help improve them together.

> [!INFO] Why Contribute to Open Source?
> Contributing to open source helps you learn from real projects, build your portfolio, connect with developers worldwide, and give back to the community.

## Step 1: Create Your Account

1. Visit FirstIssue.dev and click 'Sign Up'
2. Connect your GitHub account (required for contributions)
3. Complete your profile with your interests and skill level
4. Verify your email address

## Step 2: Find Your First Issue

Navigate to the Explore page to discover beginner-friendly issues. Use our smart filters to find issues that match your skills and interests.

- Filter by programming language (JavaScript, Python, Java, etc.)
- Look for 'good first issue' and 'help wanted' labels
- Choose issues with clear descriptions and recent activity
- Start with documentation or small bug fixes

## Step 3: Bookmark and Track Issues

Found an interesting issue? Bookmark it to save for later and track your progress through our status system.

```text
Issue Status Flow:
Saved -> Applied -> Working On -> Done
```

## Step 4: Make Your Contribution

Ready to contribute? Click 'View on GitHub' to go to the actual issue and start your contribution journey.

> [!TIP] Pro Tip
> Always comment on the issue first to let maintainers know you're interested in working on it. This prevents duplicate work and shows you're engaged!

## Configuring Git Credentials and Security

Before pushing code to remote repositories, you need a secure way to authenticate with GitHub. Modern platforms have deprecated simple password authentication in favor of secure keys.

### Generating and Configuring SSH Keys

SSH (Secure Shell) keys allow you to connect and authenticate to remote servers and services securely. By setting up SSH, you can push and pull code without typing your GitHub username and password every time.

1. Open your terminal or Git Bash.
2. Generate a new SSH key using the Ed25519 algorithm: ssh-keygen -t ed25519 -C "your_email@example.com"
3. When prompted to save the key, press Enter to accept the default location.
4. Type a secure passphrase when prompted (optional but highly recommended).
5. Start the SSH agent in the background: eval "$(ssh-agent -s)"
6. Add your generated private key to the SSH agent: ssh-add ~/.ssh/id_ed25519
7. Copy the public key to your clipboard: cat ~/.ssh/id_ed25519.pub
8. Add the public key to your GitHub account under Settings -> SSH and GPG keys.

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "developer@example.com"

# Start ssh-agent
eval "$(ssh-agent -s)"

# Add SSH key
ssh-add ~/.ssh/id_ed25519

# Display public key to copy to GitHub
cat ~/.ssh/id_ed25519.pub
```

### Verifying the SSH Connection

To ensure your SSH key is properly registered and accepted, test the connection using the following command:

```bash
ssh -T git@github.com
```

You should see a message confirming successful authentication, such as: 'Hi username! You've successfully authenticated, but GitHub does not provide shell access.'

### Configuring GPG Commit Signatures

Signing commits using GPG (GNU Privacy Guard) keys provides cryptographic proof that a commit actually came from you. GitHub displays a 'Verified' badge next to signed commits, which enhances repository security and prevents commit spoofing.

1. Download and install GPG suite for your operating system (e.g., Gpg4win for Windows, GPG Tools for macOS).
2. Generate a GPG key pair: gpg --full-generate-key
3. Choose RSA and RSA (default), key size 4096, and set an expiration time (recommended: 2y).
4. List your secret GPG keys to find the key ID: gpg --list-secret-keys --keyid-format=long
5. Look for the sec line (e.g., sec rsa4096/3AA5C34371567BD2) and copy the ID (the alphanumeric string after the slash).
6. Export the GPG public key block: gpg --armor --export 3AA5C34371567BD2
7. Copy the entire GPG key block (including BEGIN/END headers) and add it to your GitHub settings under SSH and GPG keys.
8. Configure Git to sign commits with this key: git config --global user.signingkey 3AA5C34371567BD2
9. Enable signing for all commits by default: git config --global commit.gpgsign true

```bash
# Generate GPG key
gpg --full-generate-key

# List GPG keys to locate the long ID
gpg --list-secret-keys --keyid-format=long

# Export public key for GitHub
gpg --armor --export YOUR_GPG_KEY_ID

# Configure global Git signing settings
git config --global user.signingkey YOUR_GPG_KEY_ID
git config --global commit.gpgsign true
```
