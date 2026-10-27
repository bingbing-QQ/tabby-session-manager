# Contributing

Keep existing settings, profile IDs, file formats, bilingual names and all supported features compatible. Runtime modules are built from src with node scripts/build.cjs. Run node scripts/verify.cjs; optional browser fixtures use npm run test:ui with Playwright 1.62.1 and Windows Edge.

Do not commit real logs, credentials, .env/.npmrc files or private connection data. Document third-party sources and preserve applicable notices. Do not label the project official. Review and update runtime-integrity.json after deliberate runtime changes; never bypass checks to hide a mismatch.

Real Tabby version/platform and installation results should be recorded separately from mocked tests. No workflow in this repository publishes npm automatically.

