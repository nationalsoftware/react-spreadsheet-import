import { act, render, waitFor, screen, within, fireEvent } from "@testing-library/react"
import { MatchColumnsStep, ColumnType } from "../MatchColumnsStep"
import type { Columns } from "../MatchColumnsStep"
import { defaultTheme, ReactSpreadsheetImport } from "../../../ReactSpreadsheetImport"
import { mockRsiValues } from "../../../stories/mockRsiValues"
import { Providers } from "../../../components/Providers"
import { ModalWrapper } from "../../../components/ModalWrapper"
import userEvent from "@testing-library/user-event"
import type { Fields } from "../../../types"
import { translations } from "../../../translationsRSIProps"
import { SELECT_DROPDOWN_ID } from "../../../components/Selects/MenuPortal"
import { StepType } from "../../UploadFlow"

const fields: Fields<any> = [
  {
    label: "Name",
    key: "name",
    fieldType: {
      type: "input",
    },
    example: "Stephanie",
  },
  {
    label: "Mobile Phone",
    key: "mobile",
    fieldType: {
      type: "input",
    },
    example: "+12323423",
  },
  {
    label: "Is cool",
    key: "is_cool",
    fieldType: {
      type: "checkbox",
    },
    example: "No",
  },
]

const CONTINUE_BUTTON = "Next"
const MUTATED_ENTRY = "mutated entry"
const ERROR_MESSAGE = "Something happened"

describe("Match Columns automatic matching", () => {
  test("AutoMatch column and click next", async () => {
    const header = ["namezz", "Phone", "Email"]
    const data = [
      ["John", "123", "j@j.com"],
      ["Dane", "333", "dane@bane.com"],
      ["Kane", "534", "kane@linch.com"],
    ]
    // finds only names with automatic matching
    const result = [
      { __rownum: 2, name: data[0][0] },
      { __rownum: 3, name: data[1][0] },
      { __rownum: 4, name: data[2][0] },
    ]

    const onContinue = vi.fn()
    render(
      <Providers theme={defaultTheme} rsiValues={{ ...mockRsiValues, fields }}>
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <MatchColumnsStep headerValues={header} data={data} onContinue={onContinue} />
        </ModalWrapper>
      </Providers>,
    )

    const nextButton = screen.getByRole("button", {
      name: "Next",
    })

    await userEvent.click(nextButton)

    await waitFor(() => {
      expect(onContinue).toBeCalled()
    })
    expect(onContinue.mock.calls[0][0]).toEqual(result)
  })

  test("AutoMatching disabled does not match any columns", async () => {
    const header = ["Name", "Phone", "Email"]
    const data = [
      ["John", "123", "j@j.com"],
      ["Dane", "333", "dane@bane.com"],
      ["Kane", "534", "kane@linch.com"],
    ]
    // finds only names with automatic matching
    const result = [{ __rownum: 2 }, { __rownum: 3 }, { __rownum: 4 }]

    const onContinue = vi.fn()
    render(
      <Providers theme={defaultTheme} rsiValues={{ ...mockRsiValues, fields, autoMapHeaders: false }}>
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <MatchColumnsStep headerValues={header} data={data} onContinue={onContinue} />
        </ModalWrapper>
      </Providers>,
    )

    const nextButton = screen.getByRole("button", {
      name: "Next",
    })

    await userEvent.click(nextButton)

    await waitFor(() => {
      expect(onContinue).toBeCalled()
    })
    expect(onContinue.mock.calls[0][0]).toEqual(result)
  })

  test("AutoMatching exact values", async () => {
    const header = ["Name", "Phone", "Email"]
    const data = [
      ["John", "123", "j@j.com"],
      ["Dane", "333", "dane@bane.com"],
      ["Kane", "534", "kane@linch.com"],
    ]
    // finds only names with automatic matching
    const result = [
      { __rownum: 2, name: data[0][0] },
      { __rownum: 3, name: data[1][0] },
      { __rownum: 4, name: data[2][0] },
    ]

    const onContinue = vi.fn()
    render(
      <Providers theme={defaultTheme} rsiValues={{ ...mockRsiValues, fields, autoMapDistance: 1 }}>
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <MatchColumnsStep headerValues={header} data={data} onContinue={onContinue} />
        </ModalWrapper>
      </Providers>,
    )

    const nextButton = screen.getByRole("button", {
      name: "Next",
    })

    await userEvent.click(nextButton)

    await waitFor(() => {
      expect(onContinue).toBeCalled()
    })
    expect(onContinue.mock.calls[0][0]).toEqual(result)
  })

  test("AutoMatches only one value", async () => {
    const header = ["first name", "name", "Email"]
    const data = [
      ["John", "123", "j@j.com"],
      ["Dane", "333", "dane@bane.com"],
      ["Kane", "534", "kane@linch.com"],
    ]
    // finds only names with automatic matching
    const result = [
      { __rownum: 2, name: data[0][1] },
      { __rownum: 3, name: data[1][1] },
      { __rownum: 4, name: data[2][1] },
    ]

    const alternativeFields = [
      {
        label: "Name",
        key: "name",
        alternateMatches: ["first name"],
        fieldType: {
          type: "input",
        },
        example: "Stephanie",
      },
    ] as const

    const onContinue = vi.fn()
    render(
      <Providers theme={defaultTheme} rsiValues={{ ...mockRsiValues, fields: alternativeFields }}>
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <MatchColumnsStep headerValues={header} data={data} onContinue={onContinue} />
        </ModalWrapper>
      </Providers>,
    )

    const nextButton = screen.getByRole("button", {
      name: "Next",
    })

    await userEvent.click(nextButton)

    await waitFor(() => {
      expect(onContinue).toBeCalled()
    })
    expect(onContinue.mock.calls[0][0]).toEqual(result)
  })

  test("Boolean-like values are returned as Booleans", async () => {
    const header = ["namezz", "is_cool", "Email"]
    const data = [
      ["John", "yes", "j@j.com"],
      ["Dane", "TRUE", "dane@bane.com"],
      ["Kane", "false", "kane@linch.com"],
      ["Kaney", "no", "kane@linch.com"],
      ["Kanye", "maybe", "kane@linch.com"],
    ]

    const result = [
      { __rownum: 2, name: data[0][0], is_cool: true },
      { __rownum: 3, name: data[1][0], is_cool: true },
      { __rownum: 4, name: data[2][0], is_cool: false },
      { __rownum: 5, name: data[3][0], is_cool: false },
      { __rownum: 6, name: data[4][0], is_cool: false },
    ]

    const onContinue = vi.fn()
    render(
      <Providers theme={defaultTheme} rsiValues={{ ...mockRsiValues, fields }}>
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <MatchColumnsStep headerValues={header} data={data} onContinue={onContinue} />
        </ModalWrapper>
      </Providers>,
    )

    const nextButton = screen.getByRole("button", {
      name: "Next",
    })

    await userEvent.click(nextButton)

    await waitFor(() => {
      expect(onContinue).toBeCalled()
    })
    expect(onContinue.mock.calls[0][0]).toEqual(result)
  })

  test("Boolean-like values are returned as Booleans for 'booleanMatches' props", async () => {
    const BOOLEAN_MATCHES_VALUE = "definitely"
    const header = ["is_cool"]
    const data = [["true"], ["false"], [BOOLEAN_MATCHES_VALUE]]

    const fields = [
      {
        label: "Is cool",
        key: "is_cool",
        fieldType: {
          type: "checkbox",
          booleanMatches: { [BOOLEAN_MATCHES_VALUE]: true },
        },
        example: "No",
      },
    ] as const

    const result = [
      { __rownum: 2, is_cool: true },
      { __rownum: 3, is_cool: false },
      { __rownum: 4, is_cool: true },
    ]

    const onContinue = vi.fn()
    render(
      <Providers theme={defaultTheme} rsiValues={{ ...mockRsiValues, fields }}>
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <MatchColumnsStep headerValues={header} data={data} onContinue={onContinue} />
        </ModalWrapper>
      </Providers>,
    )

    const nextButton = screen.getByRole("button", {
      name: "Next",
    })

    await userEvent.click(nextButton)

    await waitFor(() => {
      expect(onContinue).toBeCalled()
    })
    expect(onContinue.mock.calls[0][0]).toEqual(result)
  })
})

describe("Match Columns general tests", () => {
  test("Displays all schema field labels", async () => {
    const header = ["namezz", "Phone", "Email"]
    const data = [
      ["John", "123", "j@j.com"],
      ["Dane", "333", "dane@bane.com"],
      ["Kane", "534", "kane@linch.com"],
    ]

    const onContinue = vi.fn()
    render(
      <Providers theme={defaultTheme} rsiValues={{ ...mockRsiValues, fields }}>
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <MatchColumnsStep headerValues={header} data={data} onContinue={onContinue} />
        </ModalWrapper>
      </Providers>,
    )

    fields.forEach((field) => {
      expect(screen.getByText(field.label)).toBeInTheDocument()
    })
  })

  test("Displays sample data from first row for matched columns", async () => {
    // Use exact field keys as headers so all three auto-match
    const header = ["name", "mobile", "is_cool"]
    const data = [
      ["John", "123", "j@j.com"],
      ["Dane", "333", "dane@bane.com"],
      ["Kane", "534", "kane@linch.com"],
    ]

    const onContinue = vi.fn()
    render(
      <Providers theme={defaultTheme} rsiValues={{ ...mockRsiValues, fields }}>
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <MatchColumnsStep headerValues={header} data={data} onContinue={onContinue} />
        </ModalWrapper>
      </Providers>,
    )

    // First row sample data shown for matched columns
    expect(screen.queryByText(data[0][0])).toBeInTheDocument()
    expect(screen.queryByText(data[0][1])).toBeInTheDocument()
    expect(screen.queryByText(data[0][2])).toBeInTheDocument()
    // Second and third rows are not shown
    expect(screen.queryByText(data[1][0])).not.toBeInTheDocument()
    expect(screen.queryByText(data[2][0])).not.toBeInTheDocument()
  })

  test("Displays all csv columns in field select dropdown", async () => {
    const header = ["Something random", "Phone", "Email"]
    const data = [
      ["John", "123", "j@j.com"],
      ["Dane", "333", "dane@bane.com"],
      ["Kane", "534", "kane@linch.com"],
    ]

    const onContinue = vi.fn()
    render(
      <Providers theme={defaultTheme} rsiValues={{ ...mockRsiValues, fields }}>
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <MatchColumnsStep headerValues={header} data={data} onContinue={onContinue} />
        </ModalWrapper>
      </Providers>,
    )

    // Open dropdown for the first schema field
    const firstFieldSelect = screen.getByLabelText(fields[0].label)
    await userEvent.click(firstFieldSelect)

    // All CSV column headers should be listed as options
    header.forEach((h) => {
      expect(screen.queryByText(h)).toBeInTheDocument()
    })
  })

  test("Manually matches first column", async () => {
    const header = ["Something random", "Phone", "Email"]
    const data = [
      ["John", "123", "j@j.com"],
      ["Dane", "333", "dane@bane.com"],
      ["Kane", "534", "kane@linch.com"],
    ]
    const result = [
      { __rownum: 2, name: data[0][0] },
      { __rownum: 3, name: data[1][0] },
      { __rownum: 4, name: data[2][0] },
    ]

    const onContinue = vi.fn()
    render(
      <Providers theme={defaultTheme} rsiValues={{ ...mockRsiValues, fields }}>
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <MatchColumnsStep headerValues={header} data={data} onContinue={onContinue} />
          <div id={SELECT_DROPDOWN_ID} />
        </ModalWrapper>
      </Providers>,
    )

    // Select csv column "Something random" for schema field "Name"
    await userEvent.click(screen.getByLabelText(fields[0].label))
    act(() => fireEvent.click(within(document.getElementById(SELECT_DROPDOWN_ID)!).getByText(header[0])))

    const nextButton = screen.getByRole("button", {
      name: "Next",
    })

    await userEvent.click(nextButton)

    await waitFor(() => {
      expect(onContinue).toBeCalled()
    })
    expect(onContinue.mock.calls[0][0]).toEqual(result)
  })

  test("Checkmark changes when field is matched", async () => {
    const header = ["Something random", "Phone", "Email"]
    const data = [
      ["John", "123", "j@j.com"],
      ["Dane", "333", "dane@bane.com"],
      ["Kane", "534", "kane@linch.com"],
    ]

    const onContinue = vi.fn()
    render(
      <Providers theme={defaultTheme} rsiValues={{ ...mockRsiValues, fields }}>
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <MatchColumnsStep headerValues={header} data={data} onContinue={onContinue} />
          <div id={SELECT_DROPDOWN_ID} />
        </ModalWrapper>
      </Providers>,
    )

    const checkmark = screen.getAllByTestId("column-checkmark")[0]
    expect(checkmark).toBeEmptyDOMElement()

    // Select a csv column for the first schema field
    await userEvent.click(screen.getByLabelText(fields[0].label))
    act(() => fireEvent.click(within(document.getElementById(SELECT_DROPDOWN_ID)!).getByText(header[0])))

    expect(checkmark).not.toBeEmptyDOMElement()
  })

  test("Required unselected fields show warning alert on submit", async () => {
    const header = ["Something random", "Phone", "Email"]
    const data = [
      ["John", "123", "j@j.com"],
      ["Dane", "333", "dane@bane.com"],
      ["Kane", "534", "kane@linch.com"],
    ]

    const requiredFields = [
      {
        label: "Name",
        key: "name",
        fieldType: {
          type: "input",
        },
        example: "Stephanie",
        validations: [
          {
            rule: "required",
            errorMessage: "Hello",
          },
        ],
      },
    ] as const

    const onContinue = vi.fn()
    render(
      <Providers theme={defaultTheme} rsiValues={{ ...mockRsiValues, fields: requiredFields }}>
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <MatchColumnsStep headerValues={header} data={data} onContinue={onContinue} />
        </ModalWrapper>
      </Providers>,
    )

    const nextButton = screen.getByRole("button", {
      name: "Next",
    })

    await userEvent.click(nextButton)

    expect(onContinue).not.toBeCalled()
    expect(screen.queryByText(translations.alerts.unmatchedRequiredFields.bodyText)).toBeInTheDocument()

    const continueButton = screen.getByRole("button", {
      name: "Continue",
    })

    await userEvent.click(continueButton)

    await waitFor(() => {
      expect(onContinue).toBeCalled()
    })
  })

  test("Selecting the same csv column for two fields shows toast", async () => {
    const header = ["Something random", "Phone", "Email"]
    const data = [
      ["John", "123", "j@j.com"],
      ["Dane", "333", "dane@bane.com"],
      ["Kane", "534", "kane@linch.com"],
    ]

    const onContinue = vi.fn()
    render(
      <Providers theme={defaultTheme} rsiValues={{ ...mockRsiValues, fields }}>
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <MatchColumnsStep headerValues={header} data={data} onContinue={onContinue} />
          <div id={SELECT_DROPDOWN_ID} />
        </ModalWrapper>
      </Providers>,
    )

    // Map "Something random" to "Name", then map "Something random" to "Mobile Phone" — duplicate triggers toast
    await userEvent.click(screen.getByLabelText(fields[0].label))
    act(() => fireEvent.click(within(document.getElementById(SELECT_DROPDOWN_ID)!).getByText(header[0])))
    await userEvent.click(screen.getByLabelText(fields[1].label))
    act(() => fireEvent.click(within(document.getElementById(SELECT_DROPDOWN_ID)!).getByText(header[0])))

    const toasts = await screen.queryAllByText(translations.matchColumnsStep.duplicateColumnWarningDescription)

    expect(toasts?.[0]).toBeInTheDocument()
  })

  test("matchColumnsStepHook should be called after columns are matched", async () => {
    const matchColumnsStepHook = vi.fn(async (values) => values)
    const mockValues = {
      ...mockRsiValues,
      fields: mockRsiValues.fields.filter((field) => field.key === "name" || field.key === "age"),
    }
    render(
      <ReactSpreadsheetImport
        {...mockValues}
        matchColumnsStepHook={matchColumnsStepHook}
        initialStepState={{
          type: StepType.matchColumns,
          data: [
            ["Josh", "2"],
            ["Charlie", "3"],
            ["Lena", "50"],
          ],
          headerValues: ["name", "age"],
        }}
      />,
    )

    const continueButton = screen.getByText(CONTINUE_BUTTON)
    await userEvent.click(continueButton)

    await waitFor(() => {
      expect(matchColumnsStepHook).toBeCalled()
    })
  })

  test("matchColumnsStepHook mutations to rawData should show up in ValidationStep", async () => {
    const matchColumnsStepHook = vi.fn(async ([firstEntry, ...values]) => {
      return [{ ...firstEntry, name: MUTATED_ENTRY }, ...values]
    })
    const mockValues = {
      ...mockRsiValues,
      fields: mockRsiValues.fields.filter((field) => field.key === "name" || field.key === "age"),
    }
    render(
      <ReactSpreadsheetImport
        {...mockValues}
        matchColumnsStepHook={matchColumnsStepHook}
        initialStepState={{
          type: StepType.matchColumns,
          data: [
            ["Josh", "2"],
            ["Charlie", "3"],
            ["Lena", "50"],
          ],
          headerValues: ["name", "age"],
        }}
      />,
    )

    const continueButton = screen.getByText(CONTINUE_BUTTON)
    await userEvent.click(continueButton)

    const mutatedEntry = await screen.findByText(MUTATED_ENTRY)
    expect(mutatedEntry).toBeInTheDocument()
  })

  test("Should show error toast if error is thrown in matchColumnsStepHook", async () => {
    const matchColumnsStepHook = vi.fn(async () => {
      throw new Error(ERROR_MESSAGE)
      return undefined as any
    })

    const mockValues = {
      ...mockRsiValues,
      fields: mockRsiValues.fields.filter((field) => field.key === "name" || field.key === "age"),
    }

    render(
      <ReactSpreadsheetImport
        {...mockValues}
        matchColumnsStepHook={matchColumnsStepHook}
        initialStepState={{
          type: StepType.matchColumns,
          data: [
            ["Josh", "2"],
            ["Charlie", "3"],
            ["Lena", "50"],
          ],
          headerValues: ["name", "age"],
        }}
      />,
    )

    const continueButton = screen.getByText(CONTINUE_BUTTON)
    await userEvent.click(continueButton)

    const errorToast = await screen.findAllByText(ERROR_MESSAGE, undefined, { timeout: 5000 })
    expect(errorToast?.[0]).toBeInTheDocument()
  })
})

describe("Match Columns select alternateMatches", () => {
  const selectOptions = [
    { value: "CA", label: "(CA) Canada", alternateMatches: ["Canada"] },
    { value: "US", label: "(US) United States", alternateMatches: ["United States", "United States of America"] },
  ] as const

  const selectFields = [
    {
      label: "Country",
      key: "country",
      fieldType: {
        type: "select" as const,
        options: selectOptions,
      },
    },
  ] as const

  const multiSelectFields = [
    {
      label: "Countries",
      key: "countries",
      fieldType: {
        type: "select" as const,
        multiSelect: true,
        options: selectOptions,
      },
    },
  ] as const

  test("alternateMatches entry is converted to canonical value", async () => {
    const header = ["country"]
    const data = [["Canada"], ["United States of America"]]
    const result = [
      { __rownum: 2, country: "CA" },
      { __rownum: 3, country: "US" },
    ]

    const onContinue = vi.fn()
    render(
      <Providers theme={defaultTheme} rsiValues={{ ...mockRsiValues, fields: selectFields }}>
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <MatchColumnsStep headerValues={header} data={data} onContinue={onContinue} />
        </ModalWrapper>
      </Providers>,
    )

    await userEvent.click(screen.getByRole("button", { name: "Next" }))

    await waitFor(() => {
      expect(onContinue).toHaveBeenCalled()
    })
    expect(onContinue.mock.calls[0][0]).toEqual(result)
  })

  test("option label is implicitly treated as an alternate match", async () => {
    const header = ["country"]
    const data = [["(CA) Canada"], ["(US) United States"]]
    const result = [
      { __rownum: 2, country: "CA" },
      { __rownum: 3, country: "US" },
    ]

    const onContinue = vi.fn()
    render(
      <Providers theme={defaultTheme} rsiValues={{ ...mockRsiValues, fields: selectFields }}>
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <MatchColumnsStep headerValues={header} data={data} onContinue={onContinue} />
        </ModalWrapper>
      </Providers>,
    )

    await userEvent.click(screen.getByRole("button", { name: "Next" }))

    await waitFor(() => {
      expect(onContinue).toHaveBeenCalled()
    })
    expect(onContinue.mock.calls[0][0]).toEqual(result)
  })

  test("matching is case-insensitive for label, alternateMatches, and value", async () => {
    const header = ["country"]
    const data = [["CANADA"], ["united states"], ["ca"]]
    const result = [
      { __rownum: 2, country: "CA" },
      { __rownum: 3, country: "US" },
      { __rownum: 4, country: "CA" },
    ]

    const onContinue = vi.fn()
    render(
      <Providers theme={defaultTheme} rsiValues={{ ...mockRsiValues, fields: selectFields }}>
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <MatchColumnsStep headerValues={header} data={data} onContinue={onContinue} />
        </ModalWrapper>
      </Providers>,
    )

    await userEvent.click(screen.getByRole("button", { name: "Next" }))

    await waitFor(() => {
      expect(onContinue).toHaveBeenCalled()
    })
    expect(onContinue.mock.calls[0][0]).toEqual(result)
  })

  test("non-matching value passes through unchanged", async () => {
    const header = ["country"]
    const data = [["Deutschland"]]
    const result = [{ __rownum: 2, country: "Deutschland" }]

    const onContinue = vi.fn()
    render(
      <Providers theme={defaultTheme} rsiValues={{ ...mockRsiValues, fields: selectFields }}>
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <MatchColumnsStep headerValues={header} data={data} onContinue={onContinue} />
        </ModalWrapper>
      </Providers>,
    )

    await userEvent.click(screen.getByRole("button", { name: "Next" }))

    await waitFor(() => {
      expect(onContinue).toHaveBeenCalled()
    })
    expect(onContinue.mock.calls[0][0]).toEqual(result)
  })

  test("multiSelect: each comma-separated part is normalized via alternateMatches", async () => {
    const header = ["countries"]
    const data = [["Canada, United States"], ["(CA) Canada,(US) United States"]]
    const result = [
      { __rownum: 2, countries: "CA,US" },
      { __rownum: 3, countries: "CA,US" },
    ]

    const onContinue = vi.fn()
    render(
      <Providers theme={defaultTheme} rsiValues={{ ...mockRsiValues, fields: multiSelectFields }}>
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <MatchColumnsStep headerValues={header} data={data} onContinue={onContinue} />
        </ModalWrapper>
      </Providers>,
    )

    await userEvent.click(screen.getByRole("button", { name: "Next" }))

    await waitFor(() => {
      expect(onContinue).toHaveBeenCalled()
    })
    expect(onContinue.mock.calls[0][0]).toEqual(result)
  })
})

describe("Match Columns initialColumns prop", () => {
  test("uses initialColumns as initial state without requiring manual mapping", async () => {
    const header = ["Something random", "Phone", "Email"]
    const data = [
      ["John", "123", "j@j.com"],
      ["Dane", "333", "dane@bane.com"],
      ["Kane", "534", "kane@linch.com"],
    ]
    const result = [
      { __rownum: 2, name: data[0][0] },
      { __rownum: 3, name: data[1][0] },
      { __rownum: 4, name: data[2][0] },
    ]

    const initialColumns: Columns<string> = [
      { type: ColumnType.matched, index: 0, header: "Something random", value: "name" },
      { type: ColumnType.empty, index: 1, header: "Phone" },
      { type: ColumnType.empty, index: 2, header: "Email" },
    ]

    const onContinue = vi.fn()
    render(
      <Providers theme={defaultTheme} rsiValues={{ ...mockRsiValues, fields, autoMapHeaders: false }}>
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <MatchColumnsStep headerValues={header} data={data} initialColumns={initialColumns} onContinue={onContinue} />
        </ModalWrapper>
      </Providers>,
    )

    await userEvent.click(screen.getByRole("button", { name: "Next" }))

    await waitFor(() => {
      expect(onContinue).toHaveBeenCalled()
    })
    expect(onContinue.mock.calls[0][0]).toEqual(result)
  })

  test("skips auto-matching when initialColumns is provided", async () => {
    // "Name" header would normally auto-match to the "name" field,
    // but initialColumns maps "Phone" → "name" instead
    const header = ["Name", "Phone", "Email"]
    const data = [
      ["John", "123", "j@j.com"],
      ["Dane", "333", "dane@bane.com"],
      ["Kane", "534", "kane@linch.com"],
    ]
    // Expect Phone column values (index 1), not Name column values (index 0)
    const result = [
      { __rownum: 2, name: data[0][1] },
      { __rownum: 3, name: data[1][1] },
      { __rownum: 4, name: data[2][1] },
    ]

    const initialColumns: Columns<string> = [
      { type: ColumnType.empty, index: 0, header: "Name" },
      { type: ColumnType.matched, index: 1, header: "Phone", value: "name" },
      { type: ColumnType.empty, index: 2, header: "Email" },
    ]

    const onContinue = vi.fn()
    render(
      <Providers theme={defaultTheme} rsiValues={{ ...mockRsiValues, fields }}>
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <MatchColumnsStep headerValues={header} data={data} initialColumns={initialColumns} onContinue={onContinue} />
        </ModalWrapper>
      </Providers>,
    )

    await userEvent.click(screen.getByRole("button", { name: "Next" }))

    await waitFor(() => {
      expect(onContinue).toHaveBeenCalled()
    })
    expect(onContinue.mock.calls[0][0]).toEqual(result)
  })
})
