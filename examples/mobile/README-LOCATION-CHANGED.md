# Project Location Changed

This project has been moved to a monorepo structure.

## Previous Location
```
lazor-kit-rn-demo/
├── src/
├── assets/
└── package.json
```

## New Location
```
lazor-kit-examples/
└── examples/
    └── mobile/  ← This project is now here
        ├── src/
        ├── assets/
        └── package.json
```

## Running the App

### From Root Directory (Recommended)
```bash
cd /path/to/lazor-kit-examples
npm run mobile
```

### From This Directory
```bash
cd examples/mobile
npm start
```

## Full Documentation

- Monorepo documentation: [../../README.md](../../README.md)
- Mobile app documentation: [README.md](./README.md)
- Migration guide: [../../MIGRATION.md](../../MIGRATION.md)

## Benefits of Monorepo

- Multiple examples can coexist (web, desktop, etc.)
- Shared dependencies are installed once
- Consistent tooling across all examples
- Easy to add new examples

## Questions?

See the [Migration Guide](../../MIGRATION.md) for detailed information about the changes.
