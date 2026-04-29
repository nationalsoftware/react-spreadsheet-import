import "@testing-library/jest-dom"
import { render, waitFor, screen } from "@testing-library/react"
import { MatchColumnsStep } from "../MatchColumnsStep"
import { defaultTheme, ReactSpreadsheetImport } from "../../../ReactSpreadsheetImport"
import { mockRsiValues } from "../../../stories/mockRsiValues"
import { Providers } from "../../../components/Providers"
import { ModalWrapper } from "../../../components/ModalWrapper"
import userEvent from "@testing-library/user-event"
import type { Fields } from "../../../types"
import selectEvent from "react-select-event"
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

    const onContinue = jest.fn()
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

    const onContinue = jest.fn()
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

    const onContinue = jest.fn()
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

    const onContinue = jest.fn()
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

    const onContinue = jest.fn()
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

    const result = [{ __rownum: 2, is_cool: true }, { __rownum: 3, is_cool: false }, { __rownum: 4, is_cool: true }]

    const onContinue = jest.fn()
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

    const onContinue = jest.fn()
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

  test("Displays example data from first row for matched columns", async () => {
    // Use exact field keys as headers so all three auto-match
    const header = ["name", "mobile", "is_cool"]
    const data = [
      ["John", "123", "j@j.com"],
      ["Dane", "333", "dane@bane.com"],
      ["Kane", "534", "kane@linch.com"],
    ]

    const onContinue = jest.fn()
    render(
      <Providers theme={defaultTheme} rsiValues={{ ...mockRsiValues, fields }}>
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <MatchColumnsStep headerValues={header} data={data} onContinue={onContinue} />
        </ModalWrapper>
      </Providers>,
    )

    // First row sample data is shown for all auto-matched columns
    expect(screen.queryByText(data[0][0])).toBeInTheDocument()
    expect(screen.queryByText(data[0][1])).toBeInTheDocument()
    expect(screen.queryByText(data[0][2])).toBeInTheDocument()

    // Second and third rows are not shown (only first row as sample)
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

    const onContinue = jest.fn()
    render(
      <Providers theme={defaultTheme} rsiValues={{ ...mockRsiValues, fields }}>
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <MatchColumnsStep headerValues={header} data={data} onContinue={onContinue} />
        </ModalWrapper>
      </Providers>,
    )

    // Open dropdown for the first field (Name)
    const firstFieldSelect = screen.getByLabelText(fields[0].label)
    await userEvent.click(firstFieldSelect)

    // All CSV column headers should appear as options
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

    const onContinue = jest.fn()
    render(
      <Providers theme={defaultTheme} rsiValues={{ ...mockRsiValues, fields }}>
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <MatchColumnsStep headerValues={header} data={data} onContinue={onContinue} />
          <div id={SELECT_DROPDOWN_ID} />
        </ModalWrapper>
      </Providers>,
    )

    // Select CSV column "Something random" for schema field "Name"
    await selectEvent.select(screen.getByLabelText(fields[0].label), header[0], {
      container: document.getElementById(SELECT_DROPDOWN_ID)!,
    })

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

    const onContinue = jest.fn()
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

    // Select a CSV column for the first field (Name)
    await selectEvent.select(screen.getByLabelText(fields[0].label), header[0], {
      container: document.getElementById(SELECT_DROPDOWN_ID)!,
    })

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

    const onContinue = jest.fn()
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

    const onContinue = jest.fn()
    render(
      <Providers theme={defaultTheme} rsiValues={{ ...mockRsiValues, fields }}>
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <MatchColumnsStep headerValues={header} data={data} onContinue={onContinue} />
          <div id={SELECT_DROPDOWN_ID} />
        </ModalWrapper>
      </Providers>,
    )

    // Map "Something random" to "Name"
    await selectEvent.select(screen.getByLabelText(fields[0].label), header[0], {
      container: document.getElementById(SELECT_DROPDOWN_ID)!,
    })
    // Map "Something random" (same column) to "Mobile Phone" — should trigger duplicate warning
    await selectEvent.select(screen.getByLabelText(fields[1].label), header[0], {
      container: document.getElementById(SELECT_DROPDOWN_ID)!,
    })

    const toasts = await screen.queryAllByText(translations.matchColumnsStep.duplicateColumnWarningDescription)

    expect(toasts?.[0]).toBeInTheDocument()
  })

  test("matchColumnsStepHook should be called after columns are matched", async () => {
    const matchColumnsStepHook = jest.fn(async (values) => values)
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
    const matchColumnsStepHook = jest.fn(async ([firstEntry, ...values]) => {
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
    const matchColumnsStepHook = jest.fn(async () => {
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
