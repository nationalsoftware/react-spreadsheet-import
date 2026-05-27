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
- **date-fns 4** for date parsing and formatting (`src/utils/parseDate.ts`)
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

React Testing Library + jsdom. 88 tests across 6 step test files plus one root-level test.

```powershell
npm run test:unit
```

**Test file locations:**

| File                                                         | What it covers                                                                                                                                                             |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/tests/ReactSpreadsheetImport.test.tsx`                  | Close modal confirmation flow                                                                                                                                              |
| `src/steps/UploadStep/tests/UploadStep.test.tsx`             | File drop, `uploadStepHook` call and mutation, hook error handling                                                                                                         |
| `src/steps/SelectSheetStep/tests/SelectSheetStep.test.tsx`   | Multi-sheet vs single-sheet detection, sheet selection, hook error                                                                                                         |
| `src/steps/SelectHeaderStep/tests/SelectHeaderStep.test.tsx` | Header row selection, `selectHeaderStepHook`, date formatting (`dateFormat` + `parseRaw`)                                                                                  |
| `src/steps/MatchColumnsStep/tests/MatchColumnsStep.test.tsx` | Auto-matching (fuzzy/exact/disabled), manual mapping, checkbox normalization, `booleanMatches`, `matchColumnsStepHook`, duplicate-column warning                           |
| `src/steps/ValidationStep/tests/ValidationStep.test.tsx`     | `onSubmit` (sync/async/error), required/unique/regex/composite-unique validation, error filtering, inline editing, numeric field formatting, multiselect field, date field |

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

Fields have one of five `fieldType.type` values: `"input"` | `"numeric"` | `"checkbox"` | `"select"` | `"date"`. Select fields support `multiSelect: true`. Validation rules are: `"required"` | `"unique"` | `"regex"`. The `"date"` field type uses **date-fns format tokens** for its `dateFormat` prop — see the type definitions below.

### How Field Types Work

Each field type is a discriminated union variant on `fieldType.type`. The type literal drives behaviour in five places across the pipeline:

| Touch point         | File                                                     | What it does                                         |
| ------------------- | -------------------------------------------------------- | ---------------------------------------------------- |
| Type definition     | `src/types.ts:77`                                        | Adds the variant to the `Field` union                |
| Column state        | `src/steps/MatchColumnsStep/MatchColumnsStep.tsx:21`     | Maps field type to a `ColumnType` enum value         |
| Value normalization | `src/steps/MatchColumnsStep/utils/normalizeTableData.ts` | Converts raw CSV strings to typed values             |
| Editor / formatter  | `src/steps/ValidationStep/components/columns.tsx`        | Renders the inline editor and read-only cell display |
| Runtime validation  | `src/steps/ValidationStep/utils/dataMutations.ts`        | Runs field-type-specific validation rules            |

There is one additional minor touch point: `src/steps/UploadStep/utils/generateTableData.ts:3` maintains a `titleMap` that maps each type to a fallback display string shown before upload.

---

### Type definitions (`src/types.ts`)

```typescript
export type Input = { type: "input" }
export type Numeric = { type: "numeric"; decimalPlaces?: number; min?: number; max?: number }
export type Checkbox = { type: "checkbox"; booleanMatches?: { [key: string]: boolean } }
export type Select = {
  type: "select"
  options: SelectOption[] // { label, value, alternateMatches? }
  multiSelect?: boolean // values stored as comma-separated string
}
export type DateField = {
  type: "date"
  dateFormat?: string // date-fns format string for display and storage. Default: "yyyy-MM-dd"
  min?: string // earliest allowed date, in ISO yyyy-MM-dd format; inclusive
  max?: string // latest allowed date, in ISO yyyy-MM-dd format; inclusive
}

// Field union (src/types.ts:77):
fieldType: Checkbox | Select | Input | Numeric | DateField
```

**`DateField` uses [date-fns format tokens](https://date-fns.org/docs/format)** (`yyyy`, `MM`, `dd`) — not moment/dayjs tokens. `YYYY` and `DD` mean ISO week-year and day-of-year in date-fns and will produce wrong output if used.

`parseDate` normalizes `-`, `/`, and `.` to `-` in both the input and the format before parsing, so users can type dates with any of these separators regardless of what `dateFormat` specifies. This means `dateFormat` strings that contain a literal `.` as part of the display (e.g. `"d. MMMM yyyy"`) will not parse correctly — use only numeric formats with standard separators.

---

### Column state machine (`MatchColumnsStep.tsx:21`)

`ColumnType` is an enum with three values:

```typescript
enum ColumnType {
  empty, // CSV column not yet mapped
  matched, // mapped to input / numeric / select / date
  matchedCheckbox, // mapped to checkbox (uses Switch instead of Input in ValidationStep)
}
```

`setColumn.ts` assigns `ColumnType.matchedCheckbox` for `"checkbox"` and `ColumnType.matched` for everything else. If you need a new field type to behave differently in the table (e.g., a read-only display), add a new `ColumnType` variant here and handle it wherever `ColumnType` is switched on.

---

### Value normalization (`normalizeTableData.ts`)

Runs once after the user confirms column mappings. Converts raw CSV strings into the typed values that flow through `ValidationStep` and `onSubmit`.

- **`ColumnType.matchedCheckbox`** — calls `normalizeCheckboxValue()` (whitelist: `yes/no/true/false → boolean`) or applies user-supplied `booleanMatches` keys (case-insensitive).
- **`ColumnType.matched` + `"select"`** — resolves each raw string against `options[].value`, `options[].label`, and `options[].alternateMatches` (all case-insensitive). For `multiSelect`, splits on `,` first, resolves each part, then rejoins.
- **`ColumnType.matched` + `"date"`** — calls `parseDate()` (tries the configured `dateFormat` first, then ISO `yyyy-MM-dd` as a fallback) and stores the result formatted as `dateFormat`. Raw values that can't be parsed are stored as-is; `dataMutations` will flag them as invalid.
- **`ColumnType.matched` + everything else** — passes the string through unchanged; empty string becomes `undefined`.

Date parsing and formatting lives in `src/utils/parseDate.ts` (uses date-fns). A fixed midnight reference date is used when parsing so that dates compared later in validation are always at 00:00:00 regardless of when parsing ran.

---

### Editor and formatter (`columns.tsx`)

These are React Data Grid column definitions. Each field type can supply its own editor (for inline editing) and formatter (for read-only display).

**Editor**: switch on `column.fieldType.type`.

- `"select"` → `<TableSelect>` or `<TableMultiSelect>`
- `"checkbox"` → `editable: false`; checkbox is toggled via the formatter's `<Switch>` instead
- `"date"` → `<Input>` (text); value is stored and displayed in `dateFormat`. On change, stores the raw typed string; `dataMutations` parses and normalizes it to `dateFormat` on the next cycle.
- all others → `<Input>` (with optional `columnStyle.prefix`/`suffix`)

**Formatter**: switch on `column.fieldType.type`.

- `"checkbox"` → `<Switch isChecked={...} onChange={...} />`
- `"select"` → resolves raw value to `option.label`; multiSelect splits/joins
- `"date"` → displays the stored `dateFormat` string as-is
- `"numeric"` → `num.toLocaleString("en-US", { minimumFractionDigits, maximumFractionDigits })` using `decimalPlaces`
- `"input"` / default → raw string with optional prefix/suffix

---

### Runtime validation (`dataMutations.ts`)

Runs on every cell edit and on initial load. Field-type-specific checks run before the user-defined `validations` array.

- **`"select"`** — checks each value (or each comma-separated part for `multiSelect`) is a member of `options[].value`. Adds an `"error"` if not.
- **`"numeric"`** — parses the string with `parseNumeric()` (strips currency symbols and thousands separators), adds an error if non-numeric, normalizes the stored value to `formatNumeric(value, decimalPlaces)`, and enforces `min`/`max` if set.
- **`"date"`** — parses the string with `parseDate()` (using `dateFormat`), adds an error if not a valid date, normalizes the stored value to `formatDate(date, dateFormat)`, and enforces `min`/`max` (specified in ISO `yyyy-MM-dd`, inclusive, compared as Date objects via date-fns `isBefore`/`isAfter`).
- **`"input"` / `"checkbox"`** — no field-type-specific validation; only the universal `required`, `unique`, and `regex` rules from `field.validations` apply.

---

### Data types in `Data<T>`

All field values are typed as `string | boolean | undefined` in `Data<T>`:

| Field type | Stored as             | Notes                                                                                   |
| ---------- | --------------------- | --------------------------------------------------------------------------------------- |
| `input`    | `string \| undefined` | Raw string from CSV                                                                     |
| `numeric`  | `string`              | Formatted string (e.g. `"1,000.00"`); formatting applied in `dataMutations`             |
| `checkbox` | `boolean`             | Normalized at `normalizeTableData` time                                                 |
| `select`   | `string`              | Option value; multiSelect stores comma-separated values                                 |
| `date`     | `string`              | Formatted per `dateFormat` (e.g. `"01/15/2024"`); formatting applied in `dataMutations` |

---

### Adding a new field type: checklist

Suppose you are adding `"rating"` as a new field type:

1. **`src/types.ts`** — Define the type and add it to the `Field` union:

   ```typescript
   export type Rating = { type: "rating"; max?: number }
   // Update: fieldType: Checkbox | Select | Input | Numeric | DateField | Rating
   ```

2. **`src/steps/MatchColumnsStep/utils/setColumn.ts`** — Add a `case "rating":` that returns `ColumnType.matched` (or a new `ColumnType` variant if needed).

3. **`src/steps/MatchColumnsStep/utils/normalizeTableData.ts`** — If the raw CSV string needs transformation, add a branch inside the `ColumnType.matched` case alongside the existing `"select"` and `"date"` checks.

4. **`src/steps/ValidationStep/components/columns.tsx`**:
   - Add a `case "rating":` in the **editor** switch to render an appropriate input component.
   - Add a `case "rating":` in the **formatter** switch to render the display value.

5. **`src/steps/ValidationStep/utils/dataMutations.ts`** — Add a field-type-specific validation block (modelled after the `"numeric"` or `"date"` blocks) if the type needs its own validity check.

6. **`src/steps/UploadStep/utils/generateTableData.ts:3`** — Add the type to the `titleMap` record (TypeScript will error here if you miss it, since `titleMap` is typed as `Record<Field<string>["fieldType"]["type"], string>`).

7. **Tests** — `src/steps/ValidationStep/tests/ValidationStep.test.tsx` and `src/steps/MatchColumnsStep/tests/MatchColumnsStep.test.tsx` have the most field-type-specific coverage; add cases there.

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
