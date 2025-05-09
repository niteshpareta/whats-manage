# Contributing to Invoice Generator

We love your input! We want to make contributing to Invoice Generator as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Pull Request Process

1. Update the README.md with details of changes to the interface, if applicable.
2. Update the ROADMAP.md, checking off any completed items.
3. The PR will be merged once you have the sign-off of at least one other developer.

## Any contributions you make will be under the MIT Software License

In short, when you submit code changes, your submissions are understood to be under the same [MIT License](http://choosealicense.com/licenses/mit/) that covers the project. Feel free to contact the maintainers if that's a concern.

## Report bugs using GitHub's [issue tracker](../../issues)

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](../../issues/new); it's that easy!

## Write bug reports with detail, background, and sample code

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can.
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## Use a Consistent Coding Style

* Use 2 spaces for indentation
* You can try running `npm run lint` for style unification

## License

By contributing, you agree that your contributions will be licensed under its MIT License.

## References

This document was adapted from the open-source contribution guidelines for [Facebook's Draft](https://github.com/facebook/draft-js/blob/a9316a723f9e918afde44dea68b5f9f39b7d9b00/CONTRIBUTING.md).

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Setup Development Environment

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/invoice-generator.git
   cd invoice-generator
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm start
   ```

4. Run tests
   ```bash
   npm test
   ```

### Project Structure

```
invoice-generator/
├── src/
│   ├── components/
│   ├── utils/
│   ├── styles/
│   ├── hooks/
│   └── tests/
├── public/
├── docs/
└── package.json
```

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. This leads to more readable messages that are easy to follow when looking through the project history.

Example commit messages:

- `feat: add new tax calculation method`
- `fix: resolve issue with PDF generation`
- `docs: update installation instructions`
- `style: format code using prettier`
- `test: add unit tests for invoice generation`

### Code Review Process

1. The maintainer(s) will review your PR within 3 business days
2. They will provide feedback and request changes if necessary
3. Once approved, they will merge the PR
4. Your contribution will be added to the changelog

### Community

- Join our [Discord server](discord-link) for discussions
- Follow us on [Twitter](twitter-link) for updates
- Subscribe to our [newsletter](newsletter-link)

Thank you for contributing to Invoice Generator! 