# react-spreadsheet-import

A forked, customized version of [UgnisSoftware/react-spreadsheet-import](https://github.com/UgnisSoftware/react-spreadsheet-import). This repo is the library itself — it is consumed by a separate application.

## Project Purpose

This is a private fork maintained to add custom features beyond the upstream library. Changes here are built as a library and consumed elsewhere, not contributed upstream.

## TypeScript

Avoid using `any` wherever possible. Prefer specific types, `unknown` with narrowing, or generics. Only use `any` as a last resort when the type is genuinely unknowable.

## Tech Stack

- **React 18** + **TypeScript 5**
- **Chakra UI 2** for all UI components and theming
- **React Data Grid 7** for the validation/editing table
- **ExcelJS / SheetJS** for file parsing
- **Vite** for building (dual ESM + CommonJS output)
- **Vitest + jsdom** for unit tests
- **Storybook 8** for component dev and visual testing

## Project Structure

```
src/
├── index.ts                    # Public API — only exports ReactSpreadsheetImport & StepType
├── ReactSpreadsheetImport.tsx  # Root component; merges defaults, applies theme
├── types.ts                    # All TypeScript types (RsiProps, Field, Validation, etc.)
├── theme.ts                    # Chakra UI theme overrides for all steps
├── translationsRSIProps.ts     # All user-facing strings (customizable via translations prop)
├── hooks/useRsi.ts             # Context hook — access global RSI props anywhere
├── components/                 # Shared components (alerts, selects, table, modal)
└── steps/                      # One folder per import step:
    ├── UploadStep/             # 1. File upload (dropzone)
    ├── SelectSheetStep/        # 2. Sheet picker (multi-sheet XLS files)
    ├── SelectHeaderStep/       # 3. Header row selection
    ├── MatchColumnsStep/       # 4. Column-to-field mapping (fuzzy match via Levenshtein)
    └── ValidationStep/         # 5. Data review, validation, inline editing
```

Each step folder contains: `StepComponent.tsx`, `components/`, `utils/`, `stories/`, `tests/`.

## Import Flow (Data Pipeline)

Raw file → UploadStep → SelectSheetStep → SelectHeaderStep → MatchColumnsStep → ValidationStep → `onSubmit`

Hooks run at each transition; `rowHook` and `tableHook` run repeatedly in the validation step.

## Key Files

| File                                              | Purpose                                                     |
| ------------------------------------------------- | ----------------------------------------------------------- |
| `src/types.ts`                                    | All types — start here when adding new props or field types |
| `src/theme.ts`                                    | Styling for all steps; extend here for visual changes       |
| `src/translationsRSIProps.ts`                     | Every user-facing string; add keys here for new UI text     |
| `src/steps/ValidationStep/utils/dataMutations.ts` | Validation logic applied to rows                            |
| `src/steps/MatchColumnsStep/utils/findMatch.ts`   | Fuzzy header matching logic                                 |

## Build

```powershell
npm run build         # Vite: outputs to dist/ (ESM) and dist-commonjs/ (CJS)
npm run ts            # TypeScript type-check only
npm run lint          # ESLint
```

## Development

```powershell
npm start             # Storybook dev server on http://localhost:6006
```

Storybook is the primary dev environment for visual work. Stories live alongside each step in `steps/<StepName>/stories/`.

## Testing

### `npm run test:unit` — Vitest

React Testing Library + jsdom. 70 tests across 6 step test files plus one root-level test.

```powershell
npm run test:unit
```

**Test file locations:**

| File                                                         | What it covers                                                                                                                                                 |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/tests/ReactSpreadsheetImport.test.tsx`                  | Close modal confirmation flow                                                                                                                                  |
| `src/steps/UploadStep/tests/UploadStep.test.tsx`             | File drop, `uploadStepHook` call and mutation, hook error handling                                                                                             |
| `src/steps/SelectSheetStep/tests/SelectSheetStep.test.tsx`   | Multi-sheet vs single-sheet detection, sheet selection, hook error                                                                                             |
| `src/steps/SelectHeaderStep/tests/SelectHeaderStep.test.tsx` | Header row selection, `selectHeaderStepHook`, date formatting (`dateFormat` + `parseRaw`)                                                                      |
| `src/steps/MatchColumnsStep/tests/MatchColumnsStep.test.tsx` | Auto-matching (fuzzy/exact/disabled), manual mapping, checkbox normalization, `booleanMatches`, `matchColumnsStepHook`, duplicate-column warning               |
| `src/steps/ValidationStep/tests/ValidationStep.test.tsx`     | `onSubmit` (sync/async/error), required/unique/regex/composite-unique validation, error filtering, inline editing, numeric field formatting, multiselect field |

**Setup file:** `src/tests/setup.ts` — imports `@testing-library/jest-dom`, mocks ResizeObserver, `matchMedia`, `scrollIntoView`, and `clientWidth`/`clientHeight` (returns 1920×1080 for React Data Grid elements).

**Vitest globals:** `src/tests/vitest-env.d.ts` provides the `/// <reference types="vitest/globals" />` declaration so `vi`, `describe`, `it`, `expect` etc. are available without imports in test files.

**Module alias:** `~/` → `src/`

**Timeout:** 30 seconds per test (set via `testTimeout` in `vitest.config.ts`).

---

### `npm run test:e2e` — Playwright visual regression

> **Do not run this.** It requires Storybook to be running (`npm start`) and must be run manually by the user.

Captures screenshots of each step's Storybook story and diffs them against committed baseline images in `e2e/visual.spec.ts-snapshots/`. Runs against Chromium, Firefox, and WebKit. Fails if any screenshot differs from its baseline by more than 5 pixels.

**Test file:** `e2e/visual.spec.ts` — one test per step (Upload, Select Sheet, Select Header, Match Columns, Validation).

**Baselines:** `e2e/visual.spec.ts-snapshots/` — committed PNG files named `<story>-<browser>-win32.png`. To regenerate after an intentional visual change:

```powershell
npx playwright test --update-snapshots
```

## Field Type System

Fields have one of four `fieldType.type` values: `"input"` | `"numeric"` | `"checkbox"` | `"select"`. Select fields support `multiSelect: true`. Validation rules are: `"required"` | `"unique"` | `"regex"`.

## Customisation Entry Points

- **Styles**: extend `src/theme.ts` or pass `customTheme` prop
- **Strings**: extend `src/translationsRSIProps.ts` or pass `translations` prop
- **New field types or validations**: edit `src/types.ts` first, then wire up in `MatchColumnsStep` and `ValidationStep`
- **Data transforms**: `rowHook` (per-row, fast) or `tableHook` (all rows, expensive)

## Windows / PowerShell Notes

- Use the **PowerShell tool** for all shell commands (Windows 11)
- Initialize FNM before any node/npm commands:
  ```powershell
  fnm env --use-on-cd | Out-String | Invoke-Expression
  ```
