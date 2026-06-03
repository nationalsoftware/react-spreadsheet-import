import type { Data, Fields, Info, RowHook, SelectOption, TableHook } from "../../../types"
import type { Meta, Error, Errors, SelectOptionsMap } from "../types"
import { ErrorSources } from "../../../types"
import { flattenFields } from "../../../utils/flattenFields"
import { parseNumeric, formatNumeric } from "../../../utils/parseNumeric"
import { isBefore, isAfter } from "date-fns"
import { parseDate, formatDate } from "../../../utils/parseDate"

export const addErrorsAndRunHooks = async <T extends string>(
  data: (Data<T> & Partial<Meta>)[],
  fields: Fields<T>,
  rowHook?: RowHook<T>,
  tableHook?: TableHook<T>,
  changedRowIndexes?: number[],
  changedFieldKey?: string,
): Promise<(Data<T> & Meta)[]> => {
  const flatFields = flattenFields(fields)
  const errors: Errors = {}

  const addError = (source: ErrorSources, rowIndex: number, fieldKey: T, error: Info) => {
    errors[rowIndex] = {
      ...errors[rowIndex],
      [fieldKey]: { ...error, source },
    }
  }

  // Normally set by normalizeTableData; this handles data injected via initialStepState.
  data.forEach((entry, index) => {
    if (!("__rownum" in entry)) {
      entry.__rownum = index + 2
    }
  })

  if (tableHook) {
    data = await tableHook(data, (...props) => addError(ErrorSources.Table, ...props))
  }

  if (rowHook) {
    const selectOptionsMap: { [rowIndex: number]: SelectOptionsMap } = {}
    const makeSetSelectOptions = (index: number) => (fieldKey: T, options: SelectOption[] | undefined) => {
      if (options !== undefined) {
        selectOptionsMap[index] = { ...selectOptionsMap[index], [fieldKey]: options }
      }
      // undefined = use fieldType.options from schema (stored once, no per-row copy needed)
    }

    if (changedRowIndexes) {
      for (const index of changedRowIndexes) {
        const result = await rowHook(
          data[index],
          (...props) => addError(ErrorSources.Row, index, ...props),
          data,
          makeSetSelectOptions(index),
        )
        // Always write __selectOptions (even undefined) to clear stale overrides from the previous cycle
        data[index] = { ...result, __selectOptions: selectOptionsMap[index] }
      }
    } else {
      data = await Promise.all(
        data.map(async (value, index) => {
          const result = await rowHook(
            value,
            (...props) => addError(ErrorSources.Row, index, ...props),
            data,
            makeSetSelectOptions(index),
          )
          // Initial load: rows start fresh so skip writing when nothing was set (avoids unnecessary property)
          return selectOptionsMap[index] !== undefined
            ? { ...result, __selectOptions: selectOptionsMap[index] }
            : result
        }),
      )
    }
  }

  // Unique validations run first (table-scoped) so they can expand changedRowIndexes
  // before any row-level validations execute — prevents row errors being incorrectly
  // cleared on rows that become non-duplicate as a side-effect of another row's edit.
  //
  // Skip entirely when the edited field isn't part of any unique constraint — the scan
  // is irrelevant and would be O(n) for nothing.
  const fieldHasUniqueConstraintFor = (fieldKey: string) =>
    flatFields.some((f) =>
      f.validations?.some((v) => {
        if (v.rule !== "unique") return false
        return v.keys?.length ? v.keys.includes(fieldKey) : f.key === fieldKey
      }),
    )

  if (!changedFieldKey || fieldHasUniqueConstraintFor(changedFieldKey)) {
    flatFields.forEach((field) => {
      field.validations?.forEach((validation) => {
        if (validation.rule !== "unique") return

        // Cap stored row numbers to avoid OOM when thousands of rows share the same key.
        // count tracks the true total; rownums holds only the first MAX for the message.
        const rowKeys = data.map((entry) =>
          validation.keys?.length
            ? JSON.stringify(validation.keys.map((k) => entry[k as T] ?? ""))
            : (entry[field.key as T] as unknown),
        )

        const MAX_ROWNUMS_IN_MESSAGE = 3
        const keyToEntry = new Map<unknown, { count: number; rownums: number[] }>()
        data.forEach((entry, index) => {
          const key = rowKeys[index]
          if (validation.allowEmpty && !key) return
          const existing = keyToEntry.get(key)
          if (existing) {
            existing.count++
            if (existing.rownums.length < MAX_ROWNUMS_IN_MESSAGE) {
              existing.rownums.push(entry.__rownum!)
            }
          } else {
            keyToEntry.set(key, { count: 1, rownums: [entry.__rownum!] })
          }
        })

        data.forEach((_entry, index) => {
          const key = rowKeys[index]
          if (validation.allowEmpty && !key) return
          const { count, rownums } = keyToEntry.get(key)!
          if (count > 1) {
            const overflow = count - rownums.length
            const rowList = overflow > 0 ? `${rownums.join(", ")} (+${overflow} more)` : rownums.join(", ")
            addError(ErrorSources.Unique, index, field.key as T, {
              level: validation.level || "error",
              message: `${validation.errorMessage || "Field must be unique"}\n\nRelated rows: ${rowList}`,
            })
          } else {
            // If this row *previously* had a unique error but now its value is no longer a duplicate,
            // mark it as changed so the unique error can be cleared on both/all affected rows.
            const rowErrors = (data[index].__errors ?? {}) as Error
            const hasUniqueError = Object.values(rowErrors).some((error) => error.source === ErrorSources.Unique)
            if (hasUniqueError) changedRowIndexes?.push(index)
          }
        })
      })
    })
  }

  // Row-level validations run after unique so changedRowIndexes is fully expanded.
  flatFields.forEach((field) => {
    const dataToValidate = changedRowIndexes ? changedRowIndexes.map((index) => data[index]) : data

    if (field.fieldType.type === "select") {
      const selectFieldType = field.fieldType
      dataToValidate.forEach((entry, index) => {
        const realIndex = changedRowIndexes ? changedRowIndexes[index] : index
        // __selectOptions from rowHook takes precedence; empty array means input mode — skip validation
        const options = entry.__selectOptions?.[field.key] ?? selectFieldType.options
        if (options.length === 0) return
        const validValues = new Set(options.map((opt) => opt.value))
        const value = entry[field.key as T]
        if (value === null || value === undefined || value === "") return

        if (selectFieldType.multiSelect) {
          const parts = (value as string).split(",").filter(Boolean)
          const invalid = parts.filter((p) => !validValues.has(p))
          if (invalid.length > 0) {
            addError(ErrorSources.Row, realIndex, field.key as T, {
              level: "error",
              message: `${invalid.map((v) => `'${v}'`).join(", ")} ${invalid.length === 1 ? "is not a valid option" : "are not valid options"}`,
            })
          }
        } else if (!validValues.has(value as string)) {
          addError(ErrorSources.Row, realIndex, field.key as T, {
            level: "error",
            message: `'${value}' is not a valid option`,
          })
        }
      })
    }

    if (field.fieldType.type === "numeric") {
      const { decimalPlaces = 0, min, max } = field.fieldType
      dataToValidate.forEach((entry, index) => {
        const realIndex = changedRowIndexes ? changedRowIndexes[index] : index
        const value = entry[field.key as T]
        if (value === null || value === undefined || value === "") return
        const result = parseNumeric(value)
        if (!result.valid) {
          addError(ErrorSources.Row, realIndex, field.key as T, {
            level: "error",
            message: "Value must be a valid number",
          })
        } else {
          data[realIndex] = { ...data[realIndex], [field.key]: formatNumeric(result.value, decimalPlaces) }
          if (min !== undefined && result.value < min) {
            addError(ErrorSources.Row, realIndex, field.key as T, {
              level: "error",
              message: `Value must be at least ${min}`,
            })
          } else if (max !== undefined && result.value > max) {
            addError(ErrorSources.Row, realIndex, field.key as T, {
              level: "error",
              message: `Value cannot exceed ${max}`,
            })
          }
        }
      })
    }

    if (field.fieldType.type === "date") {
      const { dateFormat = "yyyy-MM-dd", min, max } = field.fieldType
      const minDate = min !== undefined ? parseDate(min, "yyyy-MM-dd") : null
      const maxDate = max !== undefined ? parseDate(max, "yyyy-MM-dd") : null
      dataToValidate.forEach((entry, index) => {
        const realIndex = changedRowIndexes ? changedRowIndexes[index] : index
        const value = entry[field.key as T]
        if (value === null || value === undefined || value === "") return
        const result = parseDate(value as string, dateFormat)
        if (!result.valid) {
          addError(ErrorSources.Row, realIndex, field.key as T, {
            level: "error",
            message: "Value must be a valid date",
          })
        } else {
          data[realIndex] = { ...data[realIndex], [field.key]: formatDate(result.value, dateFormat) }
          if (minDate?.valid && isBefore(result.value, minDate.value)) {
            addError(ErrorSources.Row, realIndex, field.key as T, {
              level: "error",
              message: `Date must be on or after ${min}`,
            })
          } else if (maxDate?.valid && isAfter(result.value, maxDate.value)) {
            addError(ErrorSources.Row, realIndex, field.key as T, {
              level: "error",
              message: `Date must be on or before ${max}`,
            })
          }
        }
      })
    }

    field.validations?.forEach((validation) => {
      switch (validation.rule) {
        case "required": {
          dataToValidate.forEach((entry, index) => {
            const realIndex = changedRowIndexes ? changedRowIndexes[index] : index
            if (entry[field.key as T] === null || entry[field.key as T] === undefined || entry[field.key as T] === "") {
              addError(ErrorSources.Row, realIndex, field.key as T, {
                level: validation.level || "error",
                message: validation.errorMessage || "Field is required",
              })
            }
          })
          break
        }
        case "regex": {
          const regex = new RegExp(validation.value, validation.flags)
          dataToValidate.forEach((entry, index) => {
            const realIndex = changedRowIndexes ? changedRowIndexes[index] : index
            const value = entry[field.key]?.toString() ?? ""
            if (!value.match(regex)) {
              addError(ErrorSources.Row, realIndex, field.key as T, {
                level: validation.level || "error",
                message:
                  validation.errorMessage || `Field did not match the regex /${validation.value}/${validation.flags} `,
              })
            }
          })
          break
        }
      }
    })
  })

  return data.map((value, index) => {
    // This is required only for table. Mutates to prevent needless rerenders
    if (!("__index" in value)) {
      value.__index = crypto.randomUUID()
    }
    const newValue = value as Data<T> & Meta

    // If we are validating all indexes, or we did full validation on this row - apply all errors
    if (!changedRowIndexes || changedRowIndexes.includes(index)) {
      if (errors[index]) {
        return { ...newValue, __errors: errors[index] }
      }

      if (!errors[index] && value?.__errors) {
        return { ...newValue, __errors: null }
      }
    }
    // if we have not validated this row, keep it's row errors but apply global error changes
    else {
      // at this point errors[index] contains only table source errors, previous row and table errors are in value.__errors
      const hasRowErrors =
        value.__errors && Object.values(value.__errors).some((error) => error.source === ErrorSources.Row)

      if (!hasRowErrors) {
        if (errors[index]) {
          return { ...newValue, __errors: errors[index] }
        }

        return newValue
      }

      const errorsWithoutTableError = Object.entries(value.__errors!).reduce((acc, [key, value]) => {
        if (value.source === ErrorSources.Row) {
          acc[key] = value
        }
        return acc
      }, {} as Error)

      const newErrors = { ...errorsWithoutTableError, ...errors[index] }

      return { ...newValue, __errors: newErrors }
    }

    return newValue
  })
}
