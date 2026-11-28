---
title: "Setup, Configuration & Repository Creation"
description: "Essential commands to set up Git, configure user information, and create or obtain repositories"
readTime: "5 min read"
updated: "1 day ago"
difficulty: "Beginner"
order: 1
---
These commands are used to set up Git, configure user information, and create or obtain a working repository.

## Configuration Commands

- git config --global user.name "Name" - Sets your username for all repositories on your system
- git config --global user.email "email" - Sets your email address for all repositories
- git config --list - Lists all your current configuration settings

```bash
# Set your identity
git config --global user.name "John Doe"
git config --global user.email "john@example.com"

# View all configurations
git config --list
```

## Repository Creation

- git init - Initializes a new, empty Git repository in the current directory
- git clone <url> - Creates a local copy of a remote repository

```bash
# Initialize a new repository
git init

# Clone an existing repository
git clone https://github.com/username/repository.git
```

> [!INFO] First Time Setup
> Always configure your username and email before making your first commit. This information is attached to every commit you make.
