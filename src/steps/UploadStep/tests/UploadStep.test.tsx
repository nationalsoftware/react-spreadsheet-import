import { render, fireEvent, waitFor, screen } from "@testing-library/react"
import { UploadStep } from "../UploadStep"
import { defaultTheme, ReactSpreadsheetImport } from "../../../ReactSpreadsheetImport"
import { mockRsiValues } from "../../../stories/mockRsiValues"
import { Providers } from "../../../components/Providers"
import { ModalWrapper } from "../../../components/ModalWrapper"

const MUTATED_RAW_DATA = "Bye"
const ERROR_MESSAGE = "Something happened while uploading"

test("Upload a file", async () => {
  const file = new File(["Hello, Hello, Hello, Hello"], "test.csv", { type: "text/csv" })

  const onContinue = vi.fn()
  render(
    <Providers theme={defaultTheme} rsiValues={mockRsiValues}>
      <ModalWrapper isOpen={true} onClose={() => {}}>
        <UploadStep onContinue={onContinue} />
      </ModalWrapper>
    </Providers>,
  )

  const uploader = screen.getByTestId("rsi-dropzone")
  fireEvent.drop(uploader, {
    target: { files: [file] },
  })
  await waitFor(
    () => {
      expect(onContinue).toBeCalled()
    },
    { timeout: 5000 },
  )
})

test("Should call uploadStepHook on file upload", async () => {
  const file = new File(["Hello, Hello, Hello, Hello"], "test.csv", { type: "text/csv" })
  const uploadStepHook = vi.fn(async (values) => {
    return values
  })
  render(<ReactSpreadsheetImport {...mockRsiValues} uploadStepHook={uploadStepHook} />)
  const uploader = screen.getByTestId("rsi-dropzone")
  fireEvent.drop(uploader, {
    target: { files: [file] },
  })

  await waitFor(
    () => {
      expect(uploadStepHook).toBeCalled()
    },
    { timeout: 5000 },
  )
})

test("uploadStepHook should be able to mutate raw upload data", async () => {
  const file = new File(["Hello, Hello, Hello, Hello"], "test.csv", { type: "text/csv" })
  const uploadStepHook = vi.fn(async ([[, ...values]]) => {
    return [[MUTATED_RAW_DATA, ...values]]
  })
  render(<ReactSpreadsheetImport {...mockRsiValues} uploadStepHook={uploadStepHook} />)

  const uploader = screen.getByTestId("rsi-dropzone")
  fireEvent.drop(uploader, {
    target: { files: [file] },
  })

  const el = await screen.findByText(MUTATED_RAW_DATA, undefined, { timeout: 5000 })
  expect(el).toBeInTheDocument()
})

test("Should call maxRecordsExceeded with (maxRecords, count) when a sheet exceeds the limit", async () => {
  // 1 header + 3 data rows -> count = 3 (header row excluded)
  const file = new File(["name\nAlice\nBob\nCarol"], "test.csv", { type: "text/csv" })
  const maxRecordsExceeded = vi.fn((maxRecords: number, _count: number) => `Too many: ${maxRecords}`)
  render(
    <ReactSpreadsheetImport {...mockRsiValues} maxRecords={1} translations={{ uploadStep: { maxRecordsExceeded } }} />,
  )

  const uploader = screen.getByTestId("rsi-dropzone")
  fireEvent.drop(uploader, {
    target: { files: [file] },
  })

  await waitFor(
    () => {
      expect(maxRecordsExceeded).toBeCalledWith(1, 3)
    },
    { timeout: 5000 },
  )
})

test("Should ignore trailing empty rows when enforcing maxRecords", async () => {
  // 1 header + 3 data rows + 4 empty rows. Only the 3 non-empty rows should count.
  const file = new File(["name\nAlice\nBob\nCarol\n,\n,\n,\n,"], "test.csv", { type: "text/csv" })
  const maxRecordsExceeded = vi.fn((maxRecords: number, _count: number) => `Too many: ${maxRecords}`)
  const uploadStepHook = vi.fn(async (values) => values)
  render(
    <ReactSpreadsheetImport
      {...mockRsiValues}
      maxRecords={3}
      uploadStepHook={uploadStepHook}
      translations={{ uploadStep: { maxRecordsExceeded } }}
    />,
  )

  const uploader = screen.getByTestId("rsi-dropzone")
  fireEvent.drop(uploader, {
    target: { files: [file] },
  })

  // Upload proceeds (hook fires) and the limit is not tripped by empty rows.
  await waitFor(
    () => {
      expect(uploadStepHook).toBeCalled()
    },
    { timeout: 5000 },
  )
  expect(maxRecordsExceeded).not.toBeCalled()
})

test("Should count only non-empty rows when a file with empty rows exceeds maxRecords", async () => {
  // 3 non-empty rows exceed maxRecords=2; the 4 empty rows must not inflate the count.
  const file = new File(["name\nAlice\nBob\nCarol\n,\n,\n,\n,"], "test.csv", { type: "text/csv" })
  const maxRecordsExceeded = vi.fn((maxRecords: number, _count: number) => `Too many: ${maxRecords}`)
  render(
    <ReactSpreadsheetImport {...mockRsiValues} maxRecords={2} translations={{ uploadStep: { maxRecordsExceeded } }} />,
  )

  const uploader = screen.getByTestId("rsi-dropzone")
  fireEvent.drop(uploader, {
    target: { files: [file] },
  })

  await waitFor(
    () => {
      expect(maxRecordsExceeded).toBeCalledWith(2, 3)
    },
    { timeout: 5000 },
  )
})

test("Should show error toast if error is thrown in uploadStepHook", async () => {
  const file = new File(["Hello, Hello, Hello, Hello"], "test.csv", { type: "text/csv" })
  const uploadStepHook = vi.fn(async () => {
    throw new Error(ERROR_MESSAGE)
    return undefined as any
  })
  render(<ReactSpreadsheetImport {...mockRsiValues} uploadStepHook={uploadStepHook} />)

  const uploader = screen.getByTestId("rsi-dropzone")
  fireEvent.drop(uploader, {
    target: { files: [file] },
  })

  const errorToast = await screen.findAllByText(ERROR_MESSAGE, undefined, { timeout: 5000 })
  expect(errorToast?.[0]).toBeInTheDocument()
})
