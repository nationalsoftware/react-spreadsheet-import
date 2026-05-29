import type { RsiProps, Field } from "../types"
import { defaultRSIProps } from "../ReactSpreadsheetImport"
import f1099necFields from "./static/F1099NEC.config.json"

const fields = [
  {
    label: "Name",
    key: "name",
    alternateMatches: ["first name", "first"],
    fieldType: {
      type: "input",
    },
    example: "Stephanie",
    validations: [
      {
        rule: "required",
        errorMessage: "Name is required",
      },
    ],
  },
  {
    label: "Surname",
    key: "surname",
    alternateMatches: ["second name", "last name", "last"],
    fieldType: {
      type: "input",
    },
    example: "McDonald",
    validations: [
      {
        rule: "unique",
        errorMessage: "Last name must be unique",
        level: "info",
      },
    ],
    description: "Family / Last name",
  },
  {
    label: "Age",
    key: "age",
    alternateMatches: ["years"],
    fieldType: {
      type: "input",
    },
    example: "23",
    validations: [
      {
        rule: "regex",
        value: "^\\d+$",
        errorMessage: "Age must be a number",
        level: "warning",
      },
    ],
  },
  {
    label: "Birthday",
    key: "birthday",
    alternateMatches: ["birth day", "bday"],
    description: "MM/DD/YYYY",
    fieldType: {
      type: "date",
      dateFormat: "MM/dd/yyyy",
      min: "1920-01-01",
      max: "2020-12-31",
    },
    example: "04/23/2014",
  },
  {
    label: "Team",
    key: "team",
    alternateMatches: ["department"],
    fieldType: {
      type: "select",
      options: [
        {
          label: "Team One",
          value: "one",
          alternateMatches: ["Developer", "Worker"],
        },
        {
          label: "Team Two",
          value: "two",
          alternateMatches: ["HR", "Recruitment"],
        },
      ],
    },
    example: "Team one",
    validations: [
      {
        rule: "required",
        errorMessage: "Team is required",
      },
    ],
  },
  {
    label: "Skills",
    key: "skills",
    alternateMatches: ["skill", "competencies"],
    fieldType: {
      type: "select",
      multiSelect: true,
      options: [
        { label: "JavaScript", value: "js" },
        { label: "TypeScript", value: "ts" },
        { label: "Python", value: "py" },
        { label: "React", value: "react" },
      ],
    },
    example: "js,ts",
  },
  {
    label: "Is manager",
    key: "is_manager",
    alternateMatches: ["manages"],
    fieldType: {
      type: "checkbox",
      booleanMatches: {},
    },
    example: "true",
  },
] as const

const f1099nec = f1099necFields as unknown as Field<string>[]

const mockComponentBehaviourForTypes = <T extends string>(props: RsiProps<T>) => props

export const mockRsiValues = mockComponentBehaviourForTypes({
  ...defaultRSIProps,
  fields: fields,
  isNavigationEnabled: true,
  onSubmit: (data) => {
    console.log(data.all.map((value) => value))
  },
  isOpen: true,
  onClose: () => {},
  // uploadStepHook: async (data) => {
  //   await new Promise((resolve) => {
  //     setTimeout(() => resolve(data), 4000)
  //   })
  //   return data
  // },
  // selectHeaderStepHook: async (hData, data) => {
  //   await new Promise((resolve) => {
  //     setTimeout(
  //       () =>
  //         resolve({
  //           headerValues: hData,
  //           data,
  //         }),
  //       4000,
  //     )
  //   })
  //   return {
  //     headerValues: hData,
  //     data,
  //   }
  // },
  // // Runs after column matching and on entry change, more performant
  // matchColumnsStepHook: async (data) => {
  //   await new Promise((resolve) => {
  //     setTimeout(() => resolve(data), 4000)
  //   })
  //   return data
  // },
})

export const mock1099NECValues = mockComponentBehaviourForTypes({
  ...defaultRSIProps,
  fields: f1099nec,
  ignoredSheetNames: ["Instructions"],
  numberedRows: true,
  allowDiscard: false,
  isNavigationEnabled: true,
  onSubmit: (data) => {
    console.log(data.all.map((value) => value))
  },
  isOpen: true,
  onClose: () => {},
  rowHook: (row, _addError, _table, setSelectOptions) => {
    const country = row["IssuerDetail.Address.CountryCd"]
    setSelectOptions("IssuerDetail.Address.StateCd", country !== "US" ? [] : undefined)
    return row
  },
})

export const editableTableInitialData = [
  {
    __rownum: 2,
    name: "Hello",
    surname: "Hello",
    age: "123123",
    birthday: "2015-01-22",
    team: "one",
    skills: "js",
    is_manager: true,
  },
  {
    __rownum: 3,
    name: "Hello",
    surname: "Hello",
    age: "12312zsas3",
    team: "two",
    birthday: undefined,
    skills: "js,py",
    is_manager: true,
  },
  {
    __rownum: 4,
    name: "Whooaasdasdawdawdawdiouasdiuasdisdhasd",
    surname: "Hello",
    age: "123123",
    team: undefined,
    birthday: "01-29-2001",
    skills: "py",
    is_manager: false,
  },
  {
    __rownum: 5,
    name: "Goodbye",
    surname: "Goodbye",
    age: "111",
    team: "two",
    birthday: "02/28/2008",
    skills: undefined,
    is_manager: true,
  },
]

export const headerSelectionTableFields = [
  ["text", "num", "select", "bool"],
  ["second", "123", "one", "true"],
  ["third", "123", "one", "true"],
  ["fourth", "123", "one", "true"],
]
