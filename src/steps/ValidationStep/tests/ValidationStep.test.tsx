import { render, waitFor, screen, act } from "@testing-library/react"
import { ValidationStep } from "../ValidationStep"
import { defaultRSIProps, defaultTheme } from "../../../ReactSpreadsheetImport"
import { Providers } from "../../../components/Providers"
import { ModalWrapper } from "../../../components/ModalWrapper"
import userEvent from "@testing-library/user-event"
import { translations } from "../../../translationsRSIProps"
import { addErrorsAndRunHooks } from "../utils/dataMutations"
import { Fields, RowHook, TableHook } from "../../../types"

type fieldKeys<T extends Fields<string>> = T[number]["key"]

const mockValues = {
  ...defaultRSIProps,
  fields: [],
  onSubmit: () => {},
  isOpen: true,
  onClose: () => {},
} as const

const getAllRowsButton = () =>
  screen.getByRole("button", { name: new RegExp(`^${translations.validationStep.allRowsCountTitle}`) })
const getErrorsButton = () =>
  screen.getByRole("button", { name: new RegExp(`^${translations.validationStep.errorRowsCountTitle}`) })
const getWarningsButton = () =>
  screen.getByRole("button", { name: new RegExp(`^${translations.validationStep.warningRowsCountTitle}`) })

const file = new File([""], "file.csv")

describe("Validation step tests", () => {
  test("Submit data", async () => {
    const onSubmit = vi.fn()
    render(
      <Providers theme={defaultTheme} rsiValues={{ ...mockValues, onSubmit: onSubmit }}>
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <ValidationStep initialData={[]} file={file} />
        </ModalWrapper>
      </Providers>,
    )

    const finishButton = screen.getByRole("button", {
      name: "Confirm",
    })

    await userEvent.click(finishButton)

    await waitFor(() => {
      expect(onSubmit).toBeCalledWith({ all: [], invalidData: [], validData: [] }, file)
    })
  })

  test("Submit data without returning promise", async () => {
    const onSuccess = vi.fn()
    const onSubmit = vi.fn(() => {
      onSuccess()
    })
    const onClose = vi.fn()
    render(
      <Providers theme={defaultTheme} rsiValues={{ ...mockValues, onSubmit, onClose }}>
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <ValidationStep initialData={[]} file={file} />
        </ModalWrapper>
      </Providers>,
    )

    const finishButton = screen.getByRole("button", {
      name: "Confirm",
    })

    await userEvent.click(finishButton)

    await waitFor(() => {
      expect(onSubmit).toBeCalledWith({ all: [], invalidData: [], validData: [] }, file)
    })
    await waitFor(() => {
      expect(onSuccess).toBeCalled()
      expect(onClose).toBeCalled()
    })
  })

  test("Submit data with a successful async return", async () => {
    const onSuccess = vi.fn()
    const onSubmit = vi.fn(async (): Promise<void> => {
      onSuccess()
      return Promise.resolve()
    })
    const onClose = vi.fn()
    render(
      <Providers theme={defaultTheme} rsiValues={{ ...mockValues, onSubmit, onClose }}>
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <ValidationStep initialData={[]} file={file} />
        </ModalWrapper>
      </Providers>,
    )

    const finishButton = screen.getByRole("button", {
      name: "Confirm",
    })

    await userEvent.click(finishButton)

    await waitFor(() => {
      expect(onSubmit).toBeCalledWith({ all: [], invalidData: [], validData: [] }, file)
    })
    await waitFor(() => {
      expect(onSuccess).toBeCalled()
      expect(onClose).toBeCalled()
    })
  })

  test("Submit data with a unsuccessful async return", async () => {
    const ERROR_MESSAGE = "ERROR has occurred"
    const onReject = vi.fn()
    const onSubmit = vi.fn(async (): Promise<void> => {
      onReject()
      throw new Error(ERROR_MESSAGE)
    })
    const onClose = vi.fn()

    render(
      <Providers theme={defaultTheme} rsiValues={{ ...mockValues, onSubmit, onClose }}>
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <ValidationStep initialData={[]} file={file} />
        </ModalWrapper>
      </Providers>,
    )

    const finishButton = screen.getByRole("button", {
      name: "Confirm",
    })

    await userEvent.click(finishButton)

    await waitFor(() => {
      expect(onSubmit).toBeCalledWith({ all: [], invalidData: [], validData: [] }, file)
    })

    const errorToast = await screen.findAllByText(ERROR_MESSAGE, undefined, { timeout: 5000 })

    expect(onReject).toBeCalled()
    expect(errorToast?.[0]).toBeInTheDocument()
    expect(onClose).not.toBeCalled()
  })

  test("Filters rows with required errors", async () => {
    const UNIQUE_NAME = "very unique name"
    const fields = [
      {
        label: "Name",
        key: "name",
        fieldType: {
          type: "input",
        },
        validations: [
          {
            rule: "required",
            errorMessage: "Name is required",
          },
        ],
      },
    ] as const
    const initialData = await addErrorsAndRunHooks(
      [
        {
          name: UNIQUE_NAME,
        },
        {
          name: undefined,
        },
      ],
      fields,
    )
    render(
      <Providers theme={defaultTheme} rsiValues={{ ...mockValues, fields }}>
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <ValidationStep<fieldKeys<typeof fields>> initialData={initialData} file={file} />
        </ModalWrapper>
      </Providers>,
    )

    const allRowsWithHeader = await screen.findAllByRole("row")
    expect(allRowsWithHeader).toHaveLength(3)

    const validRow = screen.getByText(UNIQUE_NAME)
    expect(validRow).toBeInTheDocument()

    await userEvent.click(getErrorsButton())

    const filteredRowsWithHeader = await screen.findAllByRole("row")
    expect(filteredRowsWithHeader).toHaveLength(2)
  })

  test("Filters rows with errors, fixes row, removes filter", async () => {
    const UNIQUE_NAME = "very unique name"
    const SECOND_UNIQUE_NAME = "another unique name"
    const FINAL_NAME = "just name"

    const fields = [
      {
        label: "Name",
        key: "name",
        fieldType: {
          type: "input",
        },
        validations: [
          {
            rule: "required",
            errorMessage: "Name is required",
          },
        ],
      },
    ] as const
    const initialData = await addErrorsAndRunHooks(
      [
        {
          name: UNIQUE_NAME,
        },
        {
          name: undefined,
        },
        {
          name: SECOND_UNIQUE_NAME,
        },
      ],
      fields,
    )
    const onSubmit = vi.fn()
    render(
      <Providers theme={defaultTheme} rsiValues={{ ...mockValues, fields, onSubmit }}>
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <ValidationStep<fieldKeys<typeof fields>> initialData={initialData} file={file} />
        </ModalWrapper>
      </Providers>,
    )

    const allRowsWithHeader = await screen.findAllByRole("row")
    expect(allRowsWithHeader).toHaveLength(4)

    const validRow = screen.getByText(UNIQUE_NAME)
    expect(validRow).toBeInTheDocument()

    await userEvent.click(getErrorsButton())

    const filteredRowsWithHeader = await screen.findAllByRole("row")
    expect(filteredRowsWithHeader).toHaveLength(2)

    // don't really know another way to select an empty cell
    const emptyCell = screen.getAllByRole("gridcell", { name: undefined })[1]
    await userEvent.click(emptyCell)

    await userEvent.keyboard(FINAL_NAME + "{enter}")

    const filteredRowsNoErrorsWithHeader = await screen.findAllByRole("row")
    expect(filteredRowsNoErrorsWithHeader).toHaveLength(1)

    await userEvent.click(getAllRowsButton())

    const allRowsFixedWithHeader = await screen.findAllByRole("row")
    expect(allRowsFixedWithHeader).toHaveLength(4)

    const finishButton = screen.getByRole("button", {
      name: "Confirm",
    })

    await userEvent.click(finishButton)

    await waitFor(() => {
      expect(onSubmit).toBeCalled()
    })
  })

  test("Filters rows with unique errors", async () => {
    const NON_UNIQUE_NAME = "very unique name"
    const fields = [
      {
        label: "Name",
        key: "name",
        fieldType: {
          type: "input",
        },
        validations: [
          {
            rule: "unique",
            errorMessage: "Name must be unique",
          },
        ],
      },
    ] as const
    const initialData = await addErrorsAndRunHooks(
      [
        {
          name: NON_UNIQUE_NAME,
        },
        {
          name: NON_UNIQUE_NAME,
        },
        {
          name: "I am fine",
        },
      ],
      fields,
    )
    render(
      <Providers theme={defaultTheme} rsiValues={{ ...mockValues, fields }}>
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <ValidationStep<fieldKeys<typeof fields>> initialData={initialData} file={file} />
        </ModalWrapper>
      </Providers>,
    )

    const allRowsWithHeader = await screen.findAllByRole("row")
    expect(allRowsWithHeader).toHaveLength(4)

    await userEvent.click(getErrorsButton())

    const filteredRowsWithHeader = await screen.findAllByRole("row")
    expect(filteredRowsWithHeader).toHaveLength(3)
  })
  test("Composite unique: only flags rows where composite key is duplicated", async () => {
    const fields = [
      {
        label: "First Name",
        key: "firstName",
        fieldType: { type: "input" },
        validations: [
          {
            rule: "unique",
            errorMessage: "Full name must be unique",
            keys: ["firstName", "lastName"],
          },
        ],
      },
      {
        label: "Last Name",
        key: "lastName",
        fieldType: { type: "input" },
      },
    ] as const
    const result = await addErrorsAndRunHooks(
      [
        { __rownum: 2, firstName: "John", lastName: "Doe" }, // duplicate composite
        { __rownum: 3, firstName: "John", lastName: "Doe" }, // duplicate composite
        { __rownum: 4, firstName: "John", lastName: "Smith" }, // different composite — fine
        { __rownum: 5, firstName: "Jane", lastName: "Doe" }, // different composite — fine
      ] as any,
      fields,
    )
    expect(result[0].__errors).toBeTruthy()
    expect(result[1].__errors).toBeTruthy()
    expect(result[2].__errors).toBeFalsy()
    expect(result[3].__errors).toBeFalsy()
    expect(result[0].__errors!["firstName"].message).toBe("Full name must be unique (rows 2, 3)")
    expect(result[1].__errors!["firstName"].message).toBe("Full name must be unique (rows 2, 3)")
  })
  test("Unique error message includes duplicate row numbers", async () => {
    const fields = [
      {
        label: "Name",
        key: "name",
        fieldType: { type: "input" },
        validations: [{ rule: "unique", errorMessage: "Name must be unique" }],
      },
    ] as const
    const result = await addErrorsAndRunHooks(
      [
        { __rownum: 2, name: "Alice" },
        { __rownum: 3, name: "Bob" },
        { __rownum: 4, name: "Alice" },
      ] as any,
      fields,
    )
    expect(result[0].__errors!["name"].message).toBe("Name must be unique (rows 2, 4)")
    expect(result[2].__errors!["name"].message).toBe("Name must be unique (rows 2, 4)")
    expect(result[1].__errors).toBeFalsy()
  })
  test("Required errors on bystander rows survive when unique constraint resolves", async () => {
    const fields = [
      {
        label: "Phone",
        key: "phone",
        fieldType: { type: "input" },
        validations: [{ rule: "required", errorMessage: "Phone is required" }],
      },
      {
        label: "Name",
        key: "name",
        fieldType: { type: "input" },
        validations: [{ rule: "unique", errorMessage: "Name must be unique" }],
      },
    ] as const

    // Full initial validation: rows 1 and 2 are duplicate; all rows have empty phone.
    const initialData = await addErrorsAndRunHooks(
      [
        { __rownum: 2, phone: "", name: "UNIQUE" } as any,
        { __rownum: 3, phone: "", name: "DUP" } as any,
        { __rownum: 4, phone: "", name: "DUP" } as any,
      ],
      fields,
    )

    // Simulate fixing row at index 1 (give it a unique name, phone still empty).
    // Row at index 2 becomes non-duplicate and must have its unique error cleared,
    // but its required error must be preserved.
    const updatedData = initialData.map((row, i) => (i === 1 ? { ...row, name: "NOW_UNIQUE" } : row))
    const result = await addErrorsAndRunHooks(updatedData, fields, undefined, undefined, [1])

    expect(result[1].__errors!["phone"].message).toBe("Phone is required")
    expect(result[1].__errors!["name"]).toBeUndefined()
    expect(result[2].__errors!["phone"].message).toBe("Phone is required")
    expect(result[2].__errors!["name"]).toBeUndefined()
  })
  test("Filters rows with regex errors", async () => {
    const NOT_A_NUMBER = "not a number"
    const fields = [
      {
        label: "Name",
        key: "name",
        fieldType: {
          type: "input",
        },
        validations: [
          {
            rule: "regex",
            errorMessage: "Name must be unique",
            value: "^[0-9]*$",
          },
        ],
      },
    ] as const
    const initialData = await addErrorsAndRunHooks(
      [
        {
          name: NOT_A_NUMBER,
        },
        {
          name: "1234",
        },
        {
          name: "9999999",
        },
      ],
      fields,
    )
    render(
      <Providers theme={defaultTheme} rsiValues={{ ...mockValues, fields }}>
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <ValidationStep<fieldKeys<typeof fields>> initialData={initialData} file={file} />
        </ModalWrapper>
      </Providers>,
    )

    const allRowsWithHeader = await screen.findAllByRole("row")
    expect(allRowsWithHeader).toHaveLength(4)

    await userEvent.click(getErrorsButton())

    const filteredRowsWithHeader = await screen.findAllByRole("row")
    expect(filteredRowsWithHeader).toHaveLength(2)
  })

  describe("Numeric field type", () => {
    const numericField = {
      label: "Amount",
      key: "amount",
      fieldType: { type: "numeric" as const, decimalPlaces: 2 },
    } as const
    const fields = [numericField] as const

    test("normalizes valid input and displays with locale formatting", async () => {
      const initialData = await addErrorsAndRunHooks([{ amount: "1000" }], fields)
      render(
        <Providers theme={defaultTheme} rsiValues={{ ...mockValues, fields }}>
          <ModalWrapper isOpen={true} onClose={() => {}}>
            <ValidationStep<fieldKeys<typeof fields>> initialData={initialData} file={file} />
          </ModalWrapper>
        </Providers>,
      )
      expect(await screen.findByText("1,000.00")).toBeInTheDocument()
    })

    test("coerces currency-formatted input", async () => {
      const initialData = await addErrorsAndRunHooks([{ amount: "$1,000" }], fields)
      render(
        <Providers theme={defaultTheme} rsiValues={{ ...mockValues, fields }}>
          <ModalWrapper isOpen={true} onClose={() => {}}>
            <ValidationStep<fieldKeys<typeof fields>> initialData={initialData} file={file} />
          </ModalWrapper>
        </Providers>,
      )
      expect(await screen.findByText("1,000.00")).toBeInTheDocument()
    })

    test("respects decimalPlaces: 0 configuration", async () => {
      const zeroDecimalFields = [
        { label: "Amount", key: "amount", fieldType: { type: "numeric" as const, decimalPlaces: 0 } },
      ] as const
      const initialData = await addErrorsAndRunHooks([{ amount: "1000" }], zeroDecimalFields)
      render(
        <Providers theme={defaultTheme} rsiValues={{ ...mockValues, fields: zeroDecimalFields }}>
          <ModalWrapper isOpen={true} onClose={() => {}}>
            <ValidationStep<fieldKeys<typeof fields>> initialData={initialData} file={file} />
          </ModalWrapper>
        </Providers>,
      )
      expect(await screen.findByText("1,000")).toBeInTheDocument()
    })

    test("shows error and filters row for invalid numeric input", async () => {
      const initialData = await addErrorsAndRunHooks([{ amount: "100a0" }, { amount: "500" }], fields)
      render(
        <Providers theme={defaultTheme} rsiValues={{ ...mockValues, fields }}>
          <ModalWrapper isOpen={true} onClose={() => {}}>
            <ValidationStep<fieldKeys<typeof fields>> initialData={initialData} file={file} />
          </ModalWrapper>
        </Providers>,
      )
      const allRowsWithHeader = await screen.findAllByRole("row")
      expect(allRowsWithHeader).toHaveLength(3)

      await userEvent.click(getErrorsButton())
      const filteredRowsWithHeader = await screen.findAllByRole("row")
      expect(filteredRowsWithHeader).toHaveLength(2)
    })

    test("empty cell displays blank with no error", async () => {
      const initialData = await addErrorsAndRunHooks([{ amount: "" }, { amount: "100" }], fields)
      render(
        <Providers theme={defaultTheme} rsiValues={{ ...mockValues, fields }}>
          <ModalWrapper isOpen={true} onClose={() => {}}>
            <ValidationStep<fieldKeys<typeof fields>> initialData={initialData} file={file} />
          </ModalWrapper>
        </Providers>,
      )
      const allRowsWithHeader = await screen.findAllByRole("row")
      expect(allRowsWithHeader).toHaveLength(3)

      await userEvent.click(getErrorsButton())
      const filteredRowsWithHeader = await screen.findAllByRole("row")
      expect(filteredRowsWithHeader).toHaveLength(1)
    })

    test("required validation applies independently to empty numeric cell", async () => {
      const requiredNumericFields = [
        {
          label: "Amount",
          key: "amount",
          fieldType: { type: "numeric" as const, decimalPlaces: 2 },
          validations: [{ rule: "required" as const, errorMessage: "Amount is required" }],
        },
      ] as const
      const initialData = await addErrorsAndRunHooks([{ amount: "" }, { amount: "500" }], requiredNumericFields)
      render(
        <Providers theme={defaultTheme} rsiValues={{ ...mockValues, fields: requiredNumericFields }}>
          <ModalWrapper isOpen={true} onClose={() => {}}>
            <ValidationStep<fieldKeys<typeof fields>> initialData={initialData} file={file} />
          </ModalWrapper>
        </Providers>,
      )
      await userEvent.click(getErrorsButton())
      const filteredRowsWithHeader = await screen.findAllByRole("row")
      expect(filteredRowsWithHeader).toHaveLength(2)
    })

    test("zero displays as '0.00' not blank", async () => {
      const initialData = await addErrorsAndRunHooks([{ amount: "0" }], fields)
      render(
        <Providers theme={defaultTheme} rsiValues={{ ...mockValues, fields }}>
          <ModalWrapper isOpen={true} onClose={() => {}}>
            <ValidationStep<fieldKeys<typeof fields>> initialData={initialData} file={file} />
          </ModalWrapper>
        </Providers>,
      )
      expect(await screen.findByText("0.00")).toBeInTheDocument()
    })

    test("displays negative number correctly", async () => {
      const initialData = await addErrorsAndRunHooks([{ amount: "-100" }], fields)
      render(
        <Providers theme={defaultTheme} rsiValues={{ ...mockValues, fields }}>
          <ModalWrapper isOpen={true} onClose={() => {}}>
            <ValidationStep<fieldKeys<typeof fields>> initialData={initialData} file={file} />
          </ModalWrapper>
        </Providers>,
      )
      expect(await screen.findByText("-100.00")).toBeInTheDocument()
    })

    test("strips non-dollar currency symbols", async () => {
      const initialData = await addErrorsAndRunHooks([{ amount: "€500" }], fields)
      render(
        <Providers theme={defaultTheme} rsiValues={{ ...mockValues, fields }}>
          <ModalWrapper isOpen={true} onClose={() => {}}>
            <ValidationStep<fieldKeys<typeof fields>> initialData={initialData} file={file} />
          </ModalWrapper>
        </Providers>,
      )
      expect(await screen.findByText("500.00")).toBeInTheDocument()
    })
  })

  test("Filters rows with warnings", async () => {
    const WARNED_NAME = "warned"
    const FINE_NAME = "fine"
    const fields = [
      {
        label: "Name",
        key: "name",
        fieldType: {
          type: "input",
        },
      },
    ] as const
    const rowHook: RowHook<fieldKeys<typeof fields>> = (value, setError) => {
      if (value.name === WARNED_NAME) {
        setError(fields[0].key, { message: "Name has a warning", level: "warning" })
      }
      return value
    }
    const initialData = await addErrorsAndRunHooks([{ name: WARNED_NAME }, { name: FINE_NAME }], fields, rowHook)
    render(
      <Providers theme={defaultTheme} rsiValues={{ ...mockValues, fields, rowHook }}>
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <ValidationStep<fieldKeys<typeof fields>> initialData={initialData} file={file} />
        </ModalWrapper>
      </Providers>,
    )

    const allRowsWithHeader = await screen.findAllByRole("row")
    expect(allRowsWithHeader).toHaveLength(3)

    await userEvent.click(getWarningsButton())

    const filteredRowsWithHeader = await screen.findAllByRole("row")
    expect(filteredRowsWithHeader).toHaveLength(2)

    const warnedRow = screen.getByText(WARNED_NAME)
    expect(warnedRow).toBeInTheDocument()

    const fineRow = screen.queryByText(FINE_NAME)
    expect(fineRow).not.toBeInTheDocument()

    await userEvent.click(getAllRowsButton())

    const allRowsRestoredWithHeader = await screen.findAllByRole("row")
    expect(allRowsRestoredWithHeader).toHaveLength(3)
  })

  test("Deletes selected rows", async () => {
    const FIRST_DELETE = "first"
    const SECOND_DELETE = "second"
    const THIRD = "third"

    const fields = [
      {
        label: "Name",
        key: "name",
        fieldType: {
          type: "input",
        },
      },
    ] as const
    const initialData = await addErrorsAndRunHooks(
      [
        {
          name: FIRST_DELETE,
        },
        {
          name: SECOND_DELETE,
        },
        {
          name: THIRD,
        },
      ],
      fields,
    )
    render(
      <Providers theme={defaultTheme} rsiValues={{ ...mockValues, fields }}>
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <ValidationStep<fieldKeys<typeof fields>> initialData={initialData} file={file} />
        </ModalWrapper>
      </Providers>,
    )

    const allRowsWithHeader = await screen.findAllByRole("row")
    expect(allRowsWithHeader).toHaveLength(4)

    const switchFilters = screen.getAllByRole("checkbox", {
      name: "Select",
    })

    await userEvent.click(switchFilters[0])
    await userEvent.click(switchFilters[1])

    const discardButton = screen.getByRole("button", {
      name: "Discard selected rows",
    })

    await userEvent.click(discardButton)

    const filteredRowsWithHeader = await screen.findAllByRole("row")
    expect(filteredRowsWithHeader).toHaveLength(2)

    const validRow = screen.getByText(THIRD)
    expect(validRow).toBeInTheDocument()
  })

  test("Deletes selected rows, changes the last one", async () => {
    const FIRST_DELETE = "first"
    const SECOND_DELETE = "second"
    const THIRD = "third"
    const THIRD_CHANGED = "third_changed"

    const fields = [
      {
        label: "Name",
        key: "name",
        fieldType: {
          type: "input",
        },
      },
    ] as const
    const initialData = await addErrorsAndRunHooks(
      [
        {
          name: FIRST_DELETE,
        },
        {
          name: SECOND_DELETE,
        },
        {
          name: THIRD,
        },
      ],
      fields,
    )
    render(
      <Providers theme={defaultTheme} rsiValues={{ ...mockValues, fields }}>
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <ValidationStep<fieldKeys<typeof fields>> initialData={initialData} file={file} />
        </ModalWrapper>
      </Providers>,
    )

    const allRowsWithHeader = await screen.findAllByRole("row")
    expect(allRowsWithHeader).toHaveLength(4)

    const switchFilters = screen.getAllByRole("checkbox", {
      name: "Select",
    })

    await userEvent.click(switchFilters[0])
    await userEvent.click(switchFilters[1])

    const discardButton = screen.getByRole("button", {
      name: "Discard selected rows",
    })

    await userEvent.click(discardButton)

    const filteredRowsWithHeader = await screen.findAllByRole("row")
    expect(filteredRowsWithHeader).toHaveLength(2)

    const nameCell = screen.getByRole("gridcell", {
      name: THIRD,
    })

    await userEvent.click(nameCell)

    screen.getByRole<HTMLInputElement>("textbox")
    await userEvent.keyboard(THIRD_CHANGED + "{enter}")

    const validRow = screen.getByText(THIRD_CHANGED)
    expect(validRow).toBeInTheDocument()
  })

  test("All inputs change values", async () => {
    const NAME = "John"
    const NEW_NAME = "Johnny"
    const OPTIONS = [
      { value: "one", label: "ONE" },
      { value: "two", label: "TWO" },
    ] as const
    const fields = [
      {
        label: "Name",
        key: "name",
        fieldType: {
          type: "input",
        },
      },
      {
        label: "lastName",
        key: "lastName",
        fieldType: {
          type: "select",
          options: OPTIONS,
        },
      },
      {
        label: "is cool",
        key: "is_cool",
        fieldType: {
          type: "checkbox",
        },
      },
    ] as const
    const initialData = await addErrorsAndRunHooks(
      [
        {
          name: NAME,
          lastName: OPTIONS[0].value,
          is_cool: false,
        },
      ],
      fields,
    )
    render(
      <Providers
        theme={defaultTheme}
        rsiValues={{
          ...mockValues,
          fields,
        }}
      >
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <ValidationStep<fieldKeys<typeof fields>> initialData={initialData} file={file} />
        </ModalWrapper>
      </Providers>,
    )

    // input
    const nameCell = screen.getByRole("gridcell", {
      name: NAME,
    })

    await userEvent.click(nameCell)

    const input: HTMLInputElement | null = screen.getByRole<HTMLInputElement>("textbox")

    expect(input).toHaveValue(NAME)
    expect(input).toHaveFocus()
    expect(input.selectionStart).toBe(0)
    expect(input.selectionEnd).toBe(NAME.length)

    await userEvent.keyboard(NEW_NAME + "{enter}")
    expect(input).not.toBeInTheDocument()

    const newNameCell = screen.getByRole("gridcell", {
      name: NEW_NAME,
    })
    expect(newNameCell).toBeInTheDocument()

    // select
    const lastNameCell = screen.getByRole("gridcell", {
      name: OPTIONS[0].label,
    })
    await userEvent.click(lastNameCell)

    const newOption = screen.getByRole("button", {
      name: OPTIONS[1].label,
    })
    await userEvent.click(newOption)
    expect(newOption).not.toBeInTheDocument()

    const newLastName = screen.getByRole("gridcell", {
      name: OPTIONS[1].label,
    })
    expect(newLastName).toBeInTheDocument()

    // Boolean
    const checkbox = screen.getByRole("checkbox", {
      name: "",
    })

    expect(checkbox).not.toBeChecked()

    await userEvent.click(checkbox)

    expect(checkbox).toBeChecked()
  })

  test("Row hook transforms data", async () => {
    const NAME = "John"
    const LASTNAME = "Doe"
    const NEW_NAME = "Johnny"
    const NEW_LASTNAME = "CENA"

    const fields = [
      {
        label: "Name",
        key: "name",
        fieldType: {
          type: "input",
        },
      },
      {
        label: "lastName",
        key: "lastName",
        fieldType: {
          type: "input",
        },
      },
    ] as const
    const rowHook: RowHook<fieldKeys<typeof fields>> = (value) => ({
      name: value.name?.toString()?.split(/(\s+)/)[0],
      lastName: value.name?.toString()?.split(/(\s+)/)[2],
    })
    const initialData = await addErrorsAndRunHooks(
      [
        {
          name: NAME + " " + LASTNAME,
          lastName: undefined,
        },
      ],
      fields,
      rowHook,
    )
    await act(async () => {
      render(
        <Providers
          theme={defaultTheme}
          rsiValues={{
            ...mockValues,
            fields,
            rowHook,
          }}
        >
          <ModalWrapper isOpen={true} onClose={() => {}}>
            <ValidationStep<fieldKeys<typeof fields>> initialData={initialData} file={file} />
          </ModalWrapper>
        </Providers>,
      )
    })

    const nameCell = screen.getByRole("gridcell", {
      name: NAME,
    })
    expect(nameCell).toBeInTheDocument()
    const lastNameCell = screen.getByRole("gridcell", {
      name: LASTNAME,
    })
    expect(lastNameCell).toBeInTheDocument()

    // activate input
    await userEvent.click(nameCell)

    await userEvent.keyboard(NEW_NAME + " " + NEW_LASTNAME + "{enter}")

    const newNameCell = screen.getByRole("gridcell", {
      name: NEW_NAME,
    })
    expect(newNameCell).toBeInTheDocument()
    const newLastNameCell = screen.getByRole("gridcell", {
      name: NEW_LASTNAME,
    })
    expect(newLastNameCell).toBeInTheDocument()
  })

  test("Row hook only runs on a single row", async () => {
    const NAME = "John"
    const NEW_NAME = "Kate"
    const LAST_NAME = "Doe"
    const fields = [
      {
        label: "Name",
        key: "name",
        fieldType: {
          type: "input",
        },
      },
      {
        label: "lastName",
        key: "lastName",
        fieldType: {
          type: "input",
        },
      },
    ] as const
    const mockedHook = vi.fn((a) => a)
    const initialData = await addErrorsAndRunHooks(
      [
        {
          name: NAME,
          lastName: LAST_NAME,
        },
        {
          name: "Johnny",
          lastName: "Doeson",
        },
      ],
      fields,
      mockedHook,
    )
    await act(async () => {
      render(
        <Providers
          theme={defaultTheme}
          rsiValues={{
            ...mockValues,
            fields,
            rowHook: mockedHook,
          }}
        >
          <ModalWrapper isOpen={true} onClose={() => {}}>
            <ValidationStep<fieldKeys<typeof fields>> initialData={initialData} file={file} />
          </ModalWrapper>
        </Providers>,
      )
    })

    // initially row hook is called for each row
    expect(mockedHook.mock.calls.length).toBe(2)

    const nameCell = screen.getByRole("gridcell", {
      name: NAME,
    })
    expect(nameCell).toBeInTheDocument()

    // activate input
    await userEvent.click(nameCell)

    await userEvent.keyboard(NEW_NAME + "{enter}")

    expect(mockedHook.mock.calls[2][0]?.name).toBe(NEW_NAME)
    expect(mockedHook.mock.calls.length).toBe(3)
  })

  test("Row hook raises error", async () => {
    const WRONG_NAME = "Johnny"
    const RIGHT_NAME = "Jonathan"
    const fields = [
      {
        label: "Name",
        key: "name",
        fieldType: {
          type: "input",
        },
      },
    ] as const

    const rowHook: RowHook<fieldKeys<typeof fields>> = (value, setError) => {
      if (value.name === WRONG_NAME) {
        setError(fields[0].key, { message: "Wrong name", level: "error" })
      }
      return value
    }
    const initialData = await addErrorsAndRunHooks(
      [
        {
          name: WRONG_NAME,
        },
      ],
      fields,
      rowHook,
    )
    await act(async () =>
      render(
        <Providers
          theme={defaultTheme}
          rsiValues={{
            ...mockValues,
            fields,
            rowHook,
          }}
        >
          <ModalWrapper isOpen={true} onClose={() => {}}>
            <ValidationStep<fieldKeys<typeof fields>> initialData={initialData} file={file} />
          </ModalWrapper>
        </Providers>,
      ),
    )

    await expect(await screen.findAllByRole("row")).toHaveLength(2)

    await userEvent.click(getErrorsButton())

    await expect(await screen.findAllByRole("row")).toHaveLength(2)

    const nameCell = screen.getByRole("gridcell", {
      name: WRONG_NAME,
    })
    expect(nameCell).toBeInTheDocument()

    await userEvent.click(nameCell)
    screen.getByRole<HTMLInputElement>("textbox")

    await userEvent.keyboard(RIGHT_NAME + "{enter}")

    await expect(await screen.findAllByRole("row")).toHaveLength(1)
  })

  test("Table hook transforms data", async () => {
    const NAME = "John"
    const SECOND_NAME = "Doe"
    const NEW_NAME = "Jakee"
    const ADDITION = "last"
    const fields = [
      {
        label: "Name",
        key: "name",
        fieldType: {
          type: "input",
        },
      },
    ] as const
    const tableHook: TableHook<fieldKeys<typeof fields>> = (data) =>
      data.map((value) => ({
        name: value.name + ADDITION,
      }))
    const initialData = await addErrorsAndRunHooks(
      [
        {
          name: NAME,
        },
        {
          name: SECOND_NAME,
        },
      ],
      fields,
      undefined,
      tableHook,
    )
    await act(async () => {
      render(
        <Providers
          theme={defaultTheme}
          rsiValues={{
            ...mockValues,
            fields,
            tableHook,
          }}
        >
          <ModalWrapper isOpen={true} onClose={() => {}}>
            <ValidationStep<fieldKeys<typeof fields>> initialData={initialData} file={file} />
          </ModalWrapper>
        </Providers>,
      )
    })

    const nameCell = screen.getByRole("gridcell", {
      name: NAME + ADDITION,
    })
    expect(nameCell).toBeInTheDocument()
    const lastNameCell = screen.getByRole("gridcell", {
      name: SECOND_NAME + ADDITION,
    })
    expect(lastNameCell).toBeInTheDocument()

    // activate input
    await userEvent.click(nameCell)

    await userEvent.keyboard(NEW_NAME + "{enter}")

    const newNameCell = screen.getByRole("gridcell", {
      name: NEW_NAME + ADDITION,
    })
    expect(newNameCell).toBeInTheDocument()
  })
  test("Table hook raises error", async () => {
    const WRONG_NAME = "Johnny"
    const RIGHT_NAME = "Jonathan"
    const fields = [
      {
        label: "Name",
        key: "name",
        fieldType: {
          type: "input",
        },
      },
    ] as const
    const tableHook: TableHook<fieldKeys<typeof fields>> = (data, setError) => {
      data.forEach((value, index) => {
        if (value.name === WRONG_NAME) {
          setError(index, fields[0].key, { message: "Wrong name", level: "error" })
        }
        return value
      })
      return data
    }
    const initialData = await addErrorsAndRunHooks(
      [
        {
          name: WRONG_NAME,
        },
        {
          name: WRONG_NAME,
        },
      ],
      fields,
      undefined,
      tableHook,
    )
    render(
      <Providers
        theme={defaultTheme}
        rsiValues={{
          ...mockValues,
          fields,
          tableHook,
        }}
      >
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <ValidationStep<fieldKeys<typeof fields>> initialData={initialData} file={file} />
        </ModalWrapper>
      </Providers>,
    )

    await expect(await screen.findAllByRole("row")).toHaveLength(3)

    await userEvent.click(getErrorsButton())

    await expect(await screen.findAllByRole("row")).toHaveLength(3)

    const nameCell = await screen.getAllByRole("gridcell", {
      name: WRONG_NAME,
    })[0]

    await userEvent.click(nameCell)
    screen.getByRole<HTMLInputElement>("textbox")

    await userEvent.keyboard(RIGHT_NAME + "{enter}")

    await expect(await screen.findAllByRole("row")).toHaveLength(2)
  })

  describe("Multiselect", () => {
    const OPTIONS = [
      { value: "one", label: "ONE" },
      { value: "two", label: "TWO" },
      { value: "three", label: "THREE" },
    ] as const

    const fields = [
      {
        label: "Tags",
        key: "tags",
        fieldType: {
          type: "select" as const,
          multiSelect: true,
          options: OPTIONS,
        },
      },
    ] as const

    test("no error for a single valid value", async () => {
      const result = await addErrorsAndRunHooks([{ tags: "one" }], fields)
      expect(result[0].__errors).toBeFalsy()
    })

    test("no error for multiple valid comma-separated values", async () => {
      const result = await addErrorsAndRunHooks([{ tags: "one,two" }], fields)
      expect(result[0].__errors).toBeFalsy()
    })

    test("no error for an empty value", async () => {
      const result = await addErrorsAndRunHooks([{ tags: "" }], fields)
      expect(result[0].__errors).toBeFalsy()
    })

    test("error for a single invalid value", async () => {
      const result = await addErrorsAndRunHooks([{ tags: "invalid" }], fields)
      expect(result[0].__errors?.["tags"].message).toBe("'invalid' is not a valid option")
    })

    test("error lists all invalid values when multiple are invalid", async () => {
      const result = await addErrorsAndRunHooks([{ tags: "bad,worse" }], fields)
      expect(result[0].__errors?.["tags"].message).toContain("'bad'")
      expect(result[0].__errors?.["tags"].message).toContain("'worse'")
    })

    test("error only references the invalid part of a mixed valid/invalid value", async () => {
      const result = await addErrorsAndRunHooks([{ tags: "one,bad" }], fields)
      expect(result[0].__errors?.["tags"].message).toContain("'bad'")
      expect(result[0].__errors?.["tags"].message).not.toContain("'one'")
    })

    test("displays comma-separated labels in the validation table", async () => {
      const initialData = await addErrorsAndRunHooks([{ tags: "one,two" }], fields)
      render(
        <Providers theme={defaultTheme} rsiValues={{ ...mockValues, fields }}>
          <ModalWrapper isOpen={true} onClose={() => {}}>
            <ValidationStep<fieldKeys<typeof fields>> initialData={initialData} file={file} />
          </ModalWrapper>
        </Providers>,
      )
      const cell = await screen.findByRole("gridcell", { name: "ONE, TWO" })
      expect(cell).toBeInTheDocument()
    })

    test("shows error row in the validation table for an invalid multiselect value", async () => {
      const initialData = await addErrorsAndRunHooks([{ tags: "one,invalid" }], fields)
      render(
        <Providers theme={defaultTheme} rsiValues={{ ...mockValues, fields }}>
          <ModalWrapper isOpen={true} onClose={() => {}}>
            <ValidationStep<fieldKeys<typeof fields>> initialData={initialData} file={file} />
          </ModalWrapper>
        </Providers>,
      )
      await userEvent.click(getErrorsButton())
      const rows = await screen.findAllByRole("row")
      expect(rows).toHaveLength(2) // header + 1 error row
    })
  })
})
