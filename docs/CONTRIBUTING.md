# Dave Hall's Prospector

**Version:** 1.0 Professional Edition

**Maintained by:** App Intelligence

**Document:** CONTRIBUTING

**Last Updated:** June 26, 2026

---

# Contributing Guide

Thank you for your interest in Dave Hall's Prospector.

This document describes the engineering standards, development workflow, documentation practices, and coding conventions used throughout the project.

The objective is to maintain a clean, consistent, and maintainable codebase while supporting long-term platform growth.

---

# Development Philosophy

Every contribution should improve one or more of the following:

* User experience
* Platform reliability
* Maintainability
* Performance
* Documentation
* Security
* Accessibility

Features should solve real problems while keeping the platform simple and understandable.

---

# Core Engineering Principles

Development follows several guiding principles:

* Write readable code.
* Prefer simplicity over cleverness.
* Build reusable components.
* Keep responsibilities well separated.
* Document important decisions.
* Refactor continuously.
* Leave the codebase cleaner than you found it.

---

# Repository Structure

```
docs/
src/
  components/
  pages/
  pages/legal/
  lib/
  api/
  styles/
public/
```

Documentation is maintained alongside the application and evolves with every release.

---

# Branch Strategy

Recommended branch naming:

```
main
feature/player-export
feature/organization-accounts
feature/world-map
bugfix/search-pagination
docs/system-architecture
refactor/trust-center
```

Each branch should focus on a single logical change.

---

# Commit Messages

Use clear, descriptive commit messages.

Examples:

```
feat: add digital player card export

fix: improve search pagination

docs: update system architecture

refactor: simplify trust components

style: improve responsive dashboard

perf: optimize player search queries
```

Avoid generic commit messages such as:

```
update

changes

fixes

stuff
```

---

# Coding Standards

The project emphasizes:

* Functional React components
* Reusable UI components
* Clear naming conventions
* Consistent formatting
* Small, focused modules
* Meaningful comments where appropriate

Code should be easy to understand without requiring unnecessary explanation.

---

# Documentation Standards

Every significant feature should include corresponding documentation updates when appropriate.

Documentation should be:

* Accurate
* Current
* Professional
* Written in plain language
* Versioned

The `/docs` directory serves as the primary source for platform documentation.

---

# Pull Requests

Before submitting changes:

* Verify the application builds successfully.
* Test affected functionality.
* Update documentation if necessary.
* Remove unused code.
* Confirm responsive behavior where applicable.
* Review for readability and consistency.

---

# Issue Reporting

Helpful issue reports should include:

* Clear description
* Expected behavior
* Actual behavior
* Steps to reproduce
* Environment information
* Screenshots when applicable

Well-documented issues improve development efficiency.

---

# Security

Potential security issues should be reported responsibly.

Avoid publicly disclosing security vulnerabilities before they can be reviewed and addressed.

See:

* **SECURITY.md**

---

# Accessibility

Accessibility improvements are always encouraged.

Contributors should consider:

* Keyboard navigation
* Readability
* Responsive layouts
* Semantic HTML
* Color contrast
* Usability

See:

* **ACCESSIBILITY.md**

---

# Artificial Intelligence

AI-assisted development tools may be used to improve productivity.

However:

* Developers remain responsible for all code.
* Generated code should be reviewed.
* Security should never be assumed.
* Documentation should remain accurate.
* Human judgment takes priority.

---

# Code Review Checklist

Before merging changes, verify:

* Code is readable.
* No unnecessary duplication exists.
* Components remain reusable.
* Documentation is current.
* Security considerations have been reviewed.
* Accessibility has not been reduced.
* The feature aligns with the platform vision.

---

# Continuous Improvement

Dave Hall's Prospector is developed through incremental improvement.

Every contribution—whether code, documentation, testing, or design—helps strengthen the platform.

The goal is not simply to add features.

The goal is to build software that hockey organizations can trust, maintain, and rely upon for years to come.

Thank you for contributing to Dave Hall's Prospector.
