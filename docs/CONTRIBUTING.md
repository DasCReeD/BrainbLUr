# Contributing to BrainBlur

Thanks for your interest in contributing! Here's how to get started.

## Development Setup

```bash
git clone https://github.com/DasCReeD/BrainbLUr.git
cd BrainbLUr
npm install
npm run dev
```

## Branch Strategy

- `main` — production (auto-deploys to GitHub Pages)
- `develop` — integration branch
- `feature/*` — feature branches (merge into develop via PR)

## Commit Conventions

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add microphone fallback for Firefox
fix: resolve canvas resize flicker on fullscreen toggle
docs: update CODEMAP with new preset loader module
chore: bump butterchurn to 3.0.0-beta.6
```

## Pull Request Process

1. Create a feature branch from `develop`
2. Make your changes
3. Test locally with `npm run dev`
4. Ensure `npm run build` succeeds
5. Open a PR against `develop`
6. Describe what changed and why

## Adding Presets

To add new MilkDrop presets:

1. Place `.milk` files in `raw-presets/`
2. Run `npm run convert-presets`
3. Verify the new presets appear in `public/presets/`
4. Test them locally before committing

## Code Style

- ES Modules (`import`/`export`)
- No semicolons (project convention)
- Single quotes for strings
- Descriptive function and variable names

## License

By contributing, you agree that your contributions will be licensed under MIT.
