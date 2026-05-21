# react-spreadsheet-import

A forked, customized version of [UgnisSoftware/react-spreadsheet-import](https://github.com/UgnisSoftware/react-spreadsheet-import). This repo is the library itself — it is consumed by a separate application.

## Project Purpose

This is a private fork maintained to add custom features beyond the upstream library. Changes here are built as a library and consumed elsewhere, not contributed upstream.

## Tech Stack

- **React 18** + **TypeScript 4.9**
- **Chakra UI 2** for all UI components and theming
- **React Data Grid 7** for the validation/editing table
- **ExcelJS / SheetJS** for file parsing
- **Rollup** for building (dual ESM + CommonJS output)
- **Jest + jsdom** for unit tests
- **Storybook 7** for component dev and visual testing

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

| File | Purpose |
|---|---|
| `src/types.ts` | All types — start here when adding new props or field types |
| `src/theme.ts` | Styling for all steps; extend here for visual changes |
| `src/translationsRSIProps.ts` | Every user-facing string; add keys here for new UI text |
| `src/steps/ValidationStep/utils/dataMutations.ts` | Validation logic applied to rows |
| `src/steps/MatchColumnsStep/utils/findMatch.ts` | Fuzzy header matching logic |

## Build

```powershell
npm run build         # Rollup: outputs to dist/ (ESM) and dist-commonjs/ (CJS)
npm run ts            # TypeScript type-check only
npm run lint          # ESLint
```

## Development

```powershell
npm start             # Storybook dev server on http://localhost:6006
```

Storybook is the primary dev environment for visual work. Stories live alongside each step in `steps/<StepName>/stories/`.

## Testing

Only Jest unit tests are used regularly:

```powershell
npm run test:unit     # Jest with jsdom
```

- Tests live colocated in each step folder: `steps/<StepName>/tests/<StepName>.test.tsx`
- Root-level tests: `src/tests/ReactSpreadsheetImport.test.tsx`
- DOM mocks (ResizeObserver, matchMedia, scrollIntoView) are in `src/tests/setup.ts`
- Module alias: `~/` maps to `src/`

Playwright E2E tests (`npm run test:e2e`) exist but are not actively used.

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
