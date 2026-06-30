# Tools

Small collection of browser-based tools hosted at [tools.diegogliarte.com](https://tools.diegogliarte.com).

Most tools here are built first for my own specific use cases, workflows, and games I care about. Some of them may still be useful to other people, but the site is intentionally practical rather than general-purpose.

The project is built with SvelteKit and deployed as a mostly static site.

## Development

```sh
pnpm install
pnpm dev
```

## Build

```sh
pnpm build
pnpm preview
```

## Notes

- Source lives under `src/lib/tools`.
- Tool metadata and routing are generated from local data/config.
- The production site is deployed with the SvelteKit Netlify adapter.

## Contributing

Contributions are welcome. Feel free to open an issue or PR for bug fixes, small improvements, or new tools that fit the project.

For larger changes, opening an issue first is usually better so the scope is clear.
