import type { Data, Fields, Info, RowHook, TableHook } from "../../../types"
import type { Meta, Error, Errors } from "../types"
import { v4 } from "uuid"
import { ErrorSources } from "../../../types"
import { parseNumeric, formatNumeric } from "../../../utils/parseNumeric"

export const addErrorsAndRunHooks = async <T extends string>(
  data: (Data<T> & Partial<Meta>)[],
  fields: Fields<T>,
  rowHook?: RowHook<T>,
  tableHook?: TableHook<T>,
  changedRowIndexes?: number[],
): Promise<(Data<T> & Meta)[]> => {
  const errors: Errors = {}

  const addError = (source: ErrorSources, rowIndex: number, fieldKey: T, error: Info) => {
    errors[rowIndex] = {
      ...errors[rowIndex],
      [fieldKey]: { ...error, source },
    }
  }

  if (tableHook) {
    data = await tableHook(data, (...props) => addError(ErrorSources.Table, ...props))
  }

  if (rowHook) {
    if (changedRowIndexes) {
      for (const index of changedRowIndexes) {
        data[index] = await rowHook(data[index], (...props) => addError(ErrorSources.Row, index, ...props), data)
      }
    } else {
      data = await Promise.all(
        data.map(async (value, index) =>
          rowHook(value, (...props) => addError(ErrorSources.Row, index, ...props), data),
        ),
      )
    }
  }

  fields.forEach((field) => {
    if (field.fieldType.type === "select") {
      const validValues = new Set(field.fieldType.options.map((opt) => opt.value))
      const dataToValidate = changedRowIndexes ? changedRowIndexes.map((index) => data[index]) : data
      dataToValidate.forEach((entry, index) => {
        const realIndex = changedRowIndexes ? changedRowIndexes[index] : index
        const value = entry[field.key as T]
        if (value !== null && value !== undefined && value !== "" && !validValues.has(value as string)) {
          addError(ErrorSources.Row, realIndex, field.key as T, {
            level: "error",
            message: "Value is not a valid option",
          })
        }
      })
    }
  })

  fields.forEach((field) => {
    if (field.fieldType.type === "numeric") {
      const { decimalPlaces = 2, min, max } = field.fieldType
      const dataToValidate = changedRowIndexes ? changedRowIndexes.map((index) => data[index]) : data
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
  })

  fields.forEach((field) => {
    field.validations?.forEach((validation) => {
      switch (validation.rule) {
        case "unique": {
          const values = data.map((entry) => ({
            key: validation.keys?.length
              ? JSON.stringify(validation.keys.map((k) => entry[k as T] ?? ""))
              : entry[field.key as T],
            rownum: (entry as any).__rownum as number,
          }))

          const keyToRownums = new Map<unknown, number[]>()
          values.forEach(({ key, rownum }) => {
            if (validation.allowEmpty && !key) return
            const existing = keyToRownums.get(key)
            if (existing) {
              existing.push(rownum)
            } else {
              keyToRownums.set(key, [rownum])
            }
          })

          values.forEach(({ key }, index) => {
            if (validation.allowEmpty && !key) return
            const rownums = keyToRownums.get(key)!
            if (rownums.length > 1) {
              addError(ErrorSources.Unique, index, field.key as T, {
                level: validation.level || "error",
                message: `${validation.errorMessage || "Field must be unique"} (rows ${rownums.join(", ")})`,
              })
            } else {
              // If this row *previously* had a unique error but now its value is no longer a duplicate,
              // mark it as changed so the unique error can be cleared on both/all affected rows.
              const rowErrors = (data[index].__errors ?? {}) as Error;
              const hasUniqueError = Object.values(rowErrors).some((error) => error.source === ErrorSources.Unique);

              if (hasUniqueError) changedRowIndexes?.push(index);
            }
          })
          break
        }
        case "required": {
          const dataToValidate = changedRowIndexes ? changedRowIndexes.map((index) => data[index]) : data
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
          const dataToValidate = changedRowIndexes ? changedRowIndexes.map((index) => data[index]) : data
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
      value.__index = v4()
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
