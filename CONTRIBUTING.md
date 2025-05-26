# Contributing to p1-headless-next

Thank you for your interest in contributing to [Project Name]! We welcome contributions from everyone, regardless of experience level.

This document outlines the process for contributing to our project using a fork-based workflow.

### Fork and Clone Repository

1. **Fork the repository**: Click the "Fork" button in the upper right corner of the [Project repository](https://github.com/pagina-um/p1-headless-next).

2. **Clone your fork**:

   ```bash
   git clone https://github.com/YOUR-USERNAME/p1-headless-next.git
   cd project
   ```

3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/pagina-um/p1-headless-next
   ```

## Development Workflow

### Create a Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-you-are-fixing
```

Use a descriptive branch name that reflects the purpose of your changes.

### Make Your Changes

1. Make your changes to the codebase.
2. Keep your changes focused on a single issue or feature.
3. Write clear, descriptive commit messages that explain the "why" behind your changes.

### Keep Your Fork Up to Date

Before submitting a pull request, ensure your fork is up to date with the upstream repository:

```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main

# Then rebase your feature branch
git checkout feature/your-feature-name
git rebase main
```

## Submitting a Pull Request

1. **Push your changes to your fork**:

   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request**:

   - Go to the [original repository](https://github.com/pagina-um/p1-headless-next)
   - Click "Pull Requests" and then "New Pull Request"
   - Click "compare across forks"
   - Set the base repository to the original repository and base branch to `main`
   - Set the head repository to your fork and the compare branch to your feature branch
   - Click "Create Pull Request"

3. **After approval**:
   - A maintainer will merge your PR once it's approved
   - Your contribution will become part of the project!
