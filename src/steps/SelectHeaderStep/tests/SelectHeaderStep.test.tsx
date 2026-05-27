import { render, waitFor, screen, fireEvent } from "@testing-library/react"
import { SelectHeaderStep } from "../SelectHeaderStep"
import { defaultTheme, ReactSpreadsheetImport } from "../../../ReactSpreadsheetImport"
import { mockRsiValues } from "../../../stories/mockRsiValues"
import { Providers } from "../../../components/Providers"
import { ModalWrapper } from "../../../components/ModalWrapper"
import userEvent from "@testing-library/user-event"
import { readFileSync } from "fs"
import { StepType } from "../../UploadFlow"
import { shouldAutoSelectHeader } from "../utils/autoSelectHeader"

const MUTATED_HEADER = "mutated header"
const CONTINUE_BUTTON = "Next"
const ERROR_MESSAGE = "Something happened"
const RAW_DATE = "2020-03-03"
const FORMATTED_DATE = "2020/03/03"
const TRAILING_CELL = "trailingcell"

describe("Select header step tests", () => {
  test("Select header row and click next", async () => {
    const data = [
      ["Some random header"],
      ["2030"],
      ["Name", "Phone", "Email"],
      ["John", "123", "j@j.com"],
      ["Dane", "333", "dane@bane.com"],
    ]
    const selectRowIndex = 2

    const onContinue = vi.fn()
    const onBack = vi.fn()
    render(
      <Providers theme={defaultTheme} rsiValues={mockRsiValues}>
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <SelectHeaderStep data={data} onContinue={onContinue} onBack={onBack} />
        </ModalWrapper>
      </Providers>,
    )

    const radioButtons = screen.getAllByRole("radio")

    await userEvent.click(radioButtons[selectRowIndex])

    const nextButton = screen.getByRole("button", {
      name: "Next",
    })

    await userEvent.click(nextButton)

    await waitFor(() => {
      expect(onContinue).toBeCalled()
    })
    expect(onContinue.mock.calls[0][0]).toEqual(data[selectRowIndex])
    expect(onContinue.mock.calls[0][1]).toEqual(data.slice(selectRowIndex + 1))
  })

  test("selectHeaderStepHook should be called after header is selected", async () => {
    const selectHeaderStepHook = vi.fn(async (headerValues, data) => {
      return { headerValues, data }
    })
    render(<ReactSpreadsheetImport {...mockRsiValues} selectHeaderStepHook={selectHeaderStepHook} />)
    const uploader = screen.getByTestId("rsi-dropzone")
    const data = readFileSync(__dirname + "/../../../../static/Workbook2.xlsx")
    fireEvent.drop(uploader, {
      target: {
        files: [
          new File([data], "testFile.xlsx", {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          }),
        ],
      },
    })
    const continueButton = await screen.findByText(CONTINUE_BUTTON, undefined, { timeout: 10000 })
    fireEvent.click(continueButton)
    await waitFor(() => {
      expect(selectHeaderStepHook).toBeCalledWith(
        ["name", "age", "date"],
        [
          ["Josh", "2", "2020-03-03"],
          ["Charlie", "3", "2010-04-04"],
          ["Lena", "50", "1994-02-27"],
        ],
      )
    })
  })
  test("selectHeaderStepHook should be able to modify raw data", async () => {
    const selectHeaderStepHook = vi.fn(async ([val, ...headerValues], data) => {
      return { headerValues: [MUTATED_HEADER, ...headerValues], data }
    })
    render(
      <ReactSpreadsheetImport
        {...mockRsiValues}
        selectHeaderStepHook={selectHeaderStepHook}
        initialStepState={{
          type: StepType.selectHeader,
          data: [
            ["name", "age"],
            ["Josh", "2"],
            ["Charlie", "3"],
            ["Lena", "50"],
          ],
        }}
      />,
    )
    const continueButton = screen.getByText(CONTINUE_BUTTON)
    fireEvent.click(continueButton)

    // Wait for MatchColumnsStep to render — comboboxes appear once field rows are mounted
    const selects = await screen.findAllByRole("combobox", undefined, { timeout: 5000 })

    // Open the first field's select so CSV column names become visible as options
    await userEvent.click(selects[0])

    const mutatedHeader = await screen.findByText(MUTATED_HEADER)
    await waitFor(() => {
      expect(mutatedHeader).toBeInTheDocument()
    })
  })

  test("Should show error toast if error is thrown in selectHeaderStepHook", async () => {
    const selectHeaderStepHook = vi.fn(async () => {
      throw new Error(ERROR_MESSAGE)
      return undefined as any
    })
    render(
      <ReactSpreadsheetImport
        {...mockRsiValues}
        selectHeaderStepHook={selectHeaderStepHook}
        initialStepState={{
          type: StepType.selectHeader,
          data: [
            ["name", "age"],
            ["Josh", "2"],
            ["Charlie", "3"],
            ["Lena", "50"],
          ],
        }}
      />,
    )
    const continueButton = screen.getByText(CONTINUE_BUTTON)
    await userEvent.click(continueButton)

    const errorToast = await screen.findAllByText(ERROR_MESSAGE, undefined, { timeout: 5000 })
    expect(errorToast?.[0]).toBeInTheDocument()
  })

  test("dateFormat property should NOT be applied to dates read from csv files IF parseRaw=true", async () => {
    const file = new File([RAW_DATE], "test.csv", {
      type: "text/csv",
    })
    render(<ReactSpreadsheetImport {...mockRsiValues} dateFormat="yyyy/mm/dd" parseRaw={true} />)

    const uploader = screen.getByTestId("rsi-dropzone")
    fireEvent.drop(uploader, {
      target: { files: [file] },
    })

    const el = await screen.findByText(RAW_DATE, undefined, { timeout: 5000 })
    expect(el).toBeInTheDocument()
  })

  test("dateFormat property should be applied to dates read from csv files IF parseRaw=false", async () => {
    const file = new File([RAW_DATE], "test.csv", {
      type: "text/csv",
    })
    render(<ReactSpreadsheetImport {...mockRsiValues} dateFormat="yyyy/mm/dd" parseRaw={false} />)

    const uploader = screen.getByTestId("rsi-dropzone")
    fireEvent.drop(uploader, {
      target: { files: [file] },
    })

    const el = await screen.findByText(FORMATTED_DATE, undefined, { timeout: 5000 })
    expect(el).toBeInTheDocument()
  })

  test("dateFormat property should be applied to dates read from xlsx files", async () => {
    render(<ReactSpreadsheetImport {...mockRsiValues} dateFormat="yyyy/mm/dd" />)
    const uploader = screen.getByTestId("rsi-dropzone")
    const data = readFileSync(__dirname + "/../../../../static/Workbook2.xlsx")
    fireEvent.drop(uploader, {
      target: {
        files: [
          new File([data], "testFile.xlsx", {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          }),
        ],
      },
    })
    const el = await screen.findByText(FORMATTED_DATE, undefined, { timeout: 10000 })
    expect(el).toBeInTheDocument()
  })

  test(
    "trailing (not under a header) cells should be rendered in SelectHeaderStep table, " +
      "but not in MatchColumnStep if a shorter row is selected as a header",
    async () => {
      const selectHeaderStepHook = vi.fn(async (headerValues, data) => {
        return { headerValues, data }
      })
      render(<ReactSpreadsheetImport {...mockRsiValues} selectHeaderStepHook={selectHeaderStepHook} />)
      const uploader = screen.getByTestId("rsi-dropzone")
      const data = readFileSync(__dirname + "/../../../../static/TrailingCellsWorkbook.xlsx")
      fireEvent.drop(uploader, {
        target: {
          files: [
            new File([data], "testFile.xlsx", {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            }),
          ],
        },
      })
      const trailingCell = await screen.findByText(TRAILING_CELL, undefined, { timeout: 10000 })
      expect(trailingCell).toBeInTheDocument()
      const nextButton = screen.getByRole("button", {
        name: "Next",
      })
      await userEvent.click(nextButton)
      await waitFor(
        () => {
          expect(screen.queryByText(TRAILING_CELL)).not.toBeInTheDocument()
        },
        { timeout: 10000 },
      )
    },
  )
})

describe("shouldAutoSelectHeader", () => {
  const fields = [
    { key: "name", label: "Name", fieldType: { type: "input" as const } },
    { key: "age", label: "Age", fieldType: { type: "input" as const } },
    { key: "email", label: "Email", fieldType: { type: "input" as const } },
    { key: "team", label: "Team", fieldType: { type: "input" as const } },
  ]

  it("returns true when matched fields meet threshold", () => {
    expect(shouldAutoSelectHeader(["name", "age", "email", "extra"], fields, 2, 0.75)).toBe(true)
  })

  it("returns false when matched fields fall below threshold", () => {
    expect(shouldAutoSelectHeader(["name", "foo", "bar", "baz"], fields, 2, 0.75)).toBe(false)
  })

  it("returns false for an empty row", () => {
    expect(shouldAutoSelectHeader([], fields, 2, 0.75)).toBe(false)
  })

  it("returns false when fields array is empty", () => {
    expect(shouldAutoSelectHeader(["name", "age"], [], 2, 0.75)).toBe(false)
  })

  it("does not count the same field twice from duplicate header cells", () => {
    expect(shouldAutoSelectHeader(["name", "name", "name", "foo"], fields, 2, 0.75)).toBe(false)
  })
})

describe("autoSelectHeaderThreshold integration", () => {
  it("skips SelectHeaderStep when first row matches schema above threshold", async () => {
    const csvContent = "name,surname,age,birthday,team,skills,is_manager\nJosh,Smith,25,1990-01-01,one,js,true"
    const file = new File([csvContent], "test.csv", { type: "text/csv" })

    render(<ReactSpreadsheetImport {...mockRsiValues} autoSelectHeaderThreshold={0.75} />)

    const uploader = screen.getByTestId("rsi-dropzone")
    fireEvent.drop(uploader, { target: { files: [file] } })

    // MatchColumnsStep shows field-mapping comboboxes; SelectHeaderStep shows radio buttons
    const comboboxes = await screen.findAllByRole("combobox", undefined, { timeout: 10000 })
    expect(comboboxes.length).toBeGreaterThan(0)
    expect(screen.queryAllByRole("radio")).toHaveLength(0)
  })

  it("does NOT skip SelectHeaderStep when first row does not match schema above threshold", async () => {
    const csvContent = "foo,bar,baz\n1,2,3"
    const file = new File([csvContent], "test.csv", { type: "text/csv" })

    render(<ReactSpreadsheetImport {...mockRsiValues} autoSelectHeaderThreshold={0.75} />)

    const uploader = screen.getByTestId("rsi-dropzone")
    fireEvent.drop(uploader, { target: { files: [file] } })

    // SelectHeaderStep shows radio buttons for row selection
    const radioButtons = await screen.findAllByRole("radio", undefined, { timeout: 10000 })
    expect(radioButtons.length).toBeGreaterThan(0)
  })
})
