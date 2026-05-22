import type { RsiProps } from "../types"
import { defaultRSIProps } from "../ReactSpreadsheetImport"

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
    label: "Team",
    key: "team",
    alternateMatches: ["department"],
    fieldType: {
      type: "select",
      options: [
        { label: "Team One", value: "one" },
        { label: "Team Two", value: "two" },
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

const fieldTypes = {
  input: {
    fieldType: {
      type: "input",
    },
  },
  checkbox: {
    fieldType: {
      type: "checkbox",
      booleanMatches: {
        1: true,
        x: true,
        y: true,
      },
    },
  },
  countryCd: {
    fieldType: {
      type: "select",
      options: [
        { label: "US", value: "US" },
        { label: "CA", value: "CA" },
        { label: "MX", value: "MX" },
      ],
    },
  },
} as const

const validations = {
  required: [
    {
      rule: "required",
      errorMessage: "Field is required",
      level: "error",
    },
  ],
  EmailType: [
    {
      rule: "regex",
      value: "^$|^[A-Za-z0-9._%+-]+@(?:[A-Za-z0-9-]+\\.)+[A-Za-z]{2,}$",
      errorMessage: "Invalid email format",
      level: "error",
    },
  ],
  TINSubmittedType: [
    {
      rule: "regex",
      value: "^(?i:EIN|SSN)$",
      errorMessage: "Value must be either 'SSN' or 'EIN'",
      level: "error",
    },
  ],
  TINType: [
    {
      rule: "regex",
      value: "^$|^\\d{9}$",
      errorMessage: "TIN must be exactly 9 digits in length.",
      level: "error",
    },
    {
      rule: "regex",
      value: "^(?!^123-45-6789$)(?!^12-3456789$)(?!^123456789$).*",
      errorMessage: "TIN cannot be 123456789",
      level: "error",
    },
    {
      rule: "regex",
      value: "^$|^(?!^(\\d)(?:-?\\1){8}$).*$",
      errorMessage: "TIN cannot consist of the same digit repeated",
      level: "error",
    },
  ],
  CityNm: [
    {
      rule: "regex",
      value: "^$|^[A-Za-z\\s'.\\-]+$",
      errorMessage: "City must contain only letters, spaces, hyphens, apostrophes, or periods",
      level: "error",
    },
  ],
  PhoneType: [
    {
      rule: "regex",
      value: "^$|^\\d{10,15}$",
      errorMessage: "Phone must be 10-15 digits",
      level: "error",
    },
  ],
  USDecimalAmountNNType: [
    {
      rule: "regex",
      value: "^^$|^\\$?\\d{1,3}(,\\d{3})*(\\.\\d{1,2})?$|^\\$?\\d+(\\.\\d{1,2})?$",
      errorMessage: "Must be a non-negative US currency format",
      level: "error",
    },
    {
      rule: "regex",
      value: "^$|^[^.]*$|^[^.]*\\.[^.]{1,2}$",
      errorMessage: "Must not have more than 2 decimal places",
      level: "error",
    },
  ],
  MaxLength: (max: number) => [
    {
      rule: "regex" as const,
      value: `^.{0,${max}}$`,
      errorMessage: `Must be ${max} characters or fewer`,
      level: "error" as const,
    },
  ],
} as const

export const f1099nec = [
  /* IssuerDetail */
  {
    key: "IssuerDetail.TINSubmittedTypeCd",
    label: "Payer TIN Type",
    alternateMatches: ["Payer TIN Type"],
    example: "EIN",
    description: "SSN or EIN",
    //...fieldTypes.input,
    fieldType: {
      type: "select",
      options: [
        { label: "SSN", value: "SSN" },
        { label: "EIN", value: "EIN" },
      ],
    },
    validations: [
      //...validations.TINSubmittedType,
      ...validations.required,
    ],
  },
  {
    key: "IssuerDetail.TIN",
    label: "Payer Taxpayer ID Number",
    alternateMatches: ["Payer Taxpayer ID Number"],
    example: "123456789",
    description: "Enter the 9-digit TIN without dashes.",
    ...fieldTypes.input,
    validations: [...validations.TINType, ...validations.required],
  },
  /* IssuerDetail.BusinessName */
  {
    key: "IssuerDetail.BusinessName.BusinessNameLine1Txt",
    label: "Payer Business Name Line 1",
    alternateMatches: ["Payer Business Name Line 1", "Payer Business or Entity Name Line 1"],
    description: "Only fill out this field if you have selected EIN for Payer TIN Type",
    example: "",
    ...fieldTypes.input,
    validations: [...validations.MaxLength(75)],
  },
  {
    key: "IssuerDetail.BusinessName.BusinessNameLine2Txt",
    label: "Payer Business Name Line 2",
    alternateMatches: ["Payer Business Name Line 2", "Payer Business or Entity Name Line 2"],
    description: "Only fill out this field if you have selected EIN for Payer TIN Type",
    example: "",
    ...fieldTypes.input,
    validations: [...validations.MaxLength(75)],
  },
  /* IssuerDetail.PersonName */
  {
    key: "IssuerDetail.PersonName.PersonFirstNm",
    label: "Payer First Name",
    alternateMatches: ["Payer First Name"],
    description: "",
    example: "",
    ...fieldTypes.input,
    validations: [...validations.MaxLength(20)],
  },
  {
    key: "IssuerDetail.PersonName.PersonMiddleNm",
    label: "Payer Middle Name",
    alternateMatches: ["Payer Middle Name"],
    description: "",
    example: "",
    ...fieldTypes.input,
    validations: [...validations.MaxLength(20)],
  },
  {
    key: "IssuerDetail.PersonName.PersonLastNm",
    label: "Payer Last Name",
    alternateMatches: ["Payer Last Name", "Payer Last Name (Surname)"],
    description: "",
    example: "",
    ...fieldTypes.input,
    validations: [...validations.MaxLength(20)],
  },
  {
    key: "IssuerDetail.PersonName.SuffixNm",
    label: "Payer Suffix",
    alternateMatches: ["Payer Suffix"],
    description: "",
    example: "",
    ...fieldTypes.input,
    validations: [...validations.MaxLength(20)],
  },
  /* IssuerDetail.Address */
  {
    key: "IssuerDetail.Address.CountryCd",
    label: "Payer Country",
    alternateMatches: ["Payer Country"],
    example: "US",
    ...fieldTypes.input,
    //...fieldTypes.countryCd,
    validations: [...validations.MaxLength(2), ...validations.required],
  },
  {
    key: "IssuerDetail.Address.AddressLine1Txt",
    label: "Payer Address Line 1",
    alternateMatches: ["Payer Address Line 1"],
    example: "123 Business Rd",
    ...fieldTypes.input,
  },
  {
    key: "IssuerDetail.Address.AddressLine2Txt",
    label: "Payer Address Line 2",
    alternateMatches: ["Payer Address Line 2"],
    example: "Suite 100",
    ...fieldTypes.input,
  },
  {
    key: "IssuerDetail.Address.CityNm",
    label: "Payer City/Town",
    alternateMatches: ["Payer City/Town"],
    example: "New York",
    ...fieldTypes.input,
    validations: [...validations.CityNm],
  },
  {
    key: "IssuerDetail.Address.StateCd",
    label: "Payer State/Province/Territory",
    alternateMatches: ["Payer State/Province/Territory"],
    example: "NY",
    ...fieldTypes.input,
  },
  {
    key: "IssuerDetail.Address.PostalCd",
    label: "Payer ZIP/Postal Code",
    alternateMatches: ["Payer ZIP/Postal Code"],
    example: "10001",
    ...fieldTypes.input,
  },
  /* IssuerDetail.PhoneNum */
  {
    key: "IssuerDetail.PhoneNum",
    label: "Payer Phone",
    alternateMatches: ["Payer Phone"],
    example: "(212) 555-7890",
    ...fieldTypes.input,
    validations: [
      ...validations.PhoneType,
      {
        rule: "required",
        errorMessage: `Submitting a Payer without a phone number result in an 'Accepted with Errors' status`,
        level: "error",
      },
    ],
  },
  /* RecipientDetail */
  {
    key: "RecipientDetail.TINSubmittedTypeCd",
    label: "Recipient TIN Type",
    alternateMatches: ["Recipient TIN Type"],
    example: "SSN",
    description: "SSN or EIN",
    ...fieldTypes.input,
    validations: [...validations.TINSubmittedType, ...validations.required],
  },
  {
    key: "RecipientDetail.TIN",
    label: "Recipient Taxpayer ID Number",
    alternateMatches: ["Recipient Taxpayer ID Number"],
    example: "123456789",
    description: "Enter the 9-digit TIN without dashes.",
    ...fieldTypes.input,
    validations: [
      ...validations.TINType,
      ...validations.required,
      {
        rule: "unique",
        keys: ["RecipientAccountNum", "RecipientDetail.TIN"],
        errorMessage: "The composite Recipient TIN + Account Number must be unique",
        level: "warning",
      },
    ],
  },
  {
    key: "RecipientAccountNum",
    label: "Recipient Account Number",
    alternateMatches: ["Recipient Account Number", "Form Account Number"],
    example: "987654321",
    ...fieldTypes.input,
    description:
      "The account number is required if you have multiple accounts for a recipient for whom you are filing more than one Form 1099-NEC.",
    validations: [
      ...validations.MaxLength(30),
      {
        rule: "regex",
        value:
          "^$|^[\\x20-\\x7E\\u00A3\\u00A7\\u00C1\\u00C9\\u00CD\\u00D1\\u00D3\\u00D7\\u00DA\\u00DC\\u00E1\\u00E9\\u00ED\\u00F1\\u00F3\\u00FA\\u00FC]+$",
        errorMessage: "Invalid characters",
        level: "error",
      },
      {
        rule: "unique",
        keys: ["RecipientAccountNum", "RecipientDetail.TIN"],
        errorMessage: "Duplicate combination of Recipient TIN and Account Number",
        level: "warning",
      },
    ],
  },
  /* RecipientDetail.BusinessName */
  {
    key: "RecipientDetail.BusinessName.BusinessNameLine1Txt",
    label: "Recipient Business Name Line 1",
    alternateMatches: ["Recipient Business Name Line 1", "Recipient Business or Entity Name Line 1"],
    description: "Only fill out this field if you have selected EIN for Recipient TIN Type",
    example: "",
    ...fieldTypes.input,
    validations: [...validations.MaxLength(75)],
  },
  {
    key: "RecipientDetail.BusinessName.BusinessNameLine2Txt",
    label: "Recipient Business Name Line 2",
    alternateMatches: ["Recipient Business Name Line 2", "Recipient Business or Entity Name Line 2"],
    description: "Only fill out this field if you have selected EIN for Recipient TIN Type",
    example: "",
    ...fieldTypes.input,
    validations: [...validations.MaxLength(75)],
  },
  /* RecipientDetail.PersonName */
  {
    key: "RecipientDetail.PersonName.PersonFirstNm",
    label: "Recipient First Name",
    alternateMatches: ["Recipient First Name"],
    description: "",
    example: "",
    ...fieldTypes.input,
    validations: [...validations.MaxLength(20)],
  },
  {
    key: "RecipientDetail.PersonName.PersonMiddleNm",
    label: "Recipient Middle Name",
    alternateMatches: ["Recipient Middle Name"],
    description: "",
    example: "",
    ...fieldTypes.input,
    validations: [...validations.MaxLength(20)],
  },
  {
    key: "RecipientDetail.PersonName.PersonLastNm",
    label: "Recipient Last Name",
    alternateMatches: ["Recipient Last Name", "Recipient Last Name (Surname)"],
    description: "",
    example: "",
    ...fieldTypes.input,
    validations: [...validations.MaxLength(20)],
  },
  {
    key: "RecipientDetail.PersonName.SuffixNm",
    label: "Recipient Suffix",
    alternateMatches: ["Recipient Suffix"],
    description: "",
    example: "",
    ...fieldTypes.input,
    validations: [...validations.MaxLength(20)],
  },
  /* RecipientDetail.Address */
  {
    key: "RecipientDetail.Address.CountryCd",
    label: "Recipient Country",
    alternateMatches: ["Recipient Country"],
    example: "US",
    ...fieldTypes.input,
    validations: [...validations.MaxLength(2), ...validations.required],
  },
  {
    key: "RecipientDetail.Address.AddressLine1Txt",
    label: "Recipient Address Line 1",
    alternateMatches: ["Recipient Address Line 1"],
    example: "123 Business Rd",
    ...fieldTypes.input,
  },
  {
    key: "RecipientDetail.Address.AddressLine2Txt",
    label: "Recipient Address Line 2",
    alternateMatches: ["Recipient Address Line 2"],
    example: "Suite 100",
    ...fieldTypes.input,
  },
  {
    key: "RecipientDetail.Address.CityNm",
    label: "Recipient City/Town",
    alternateMatches: ["Recipient City/Town"],
    example: "New York",
    ...fieldTypes.input,
    validations: [...validations.CityNm],
  },
  {
    key: "RecipientDetail.Address.StateCd",
    label: "Recipient State/Province/Territory",
    alternateMatches: ["Recipient State/Province/Territory"],
    example: "NY",
    ...fieldTypes.input,
  },
  {
    key: "RecipientDetail.Address.PostalCd",
    label: "Recipient ZIP/Postal Code",
    alternateMatches: ["Recipient ZIP/Postal Code"],
    example: "10001",
    ...fieldTypes.input,
  },
  {
    key: "RecipientDetail.EmailAddress",
    label: "Recipient Email Address",
    alternateMatches: ["Recipient Email Address"],
    example: "person@company.com",
    ...fieldTypes.input,
    validations: [...validations.EmailType],
  },
  /* Form Details */
  {
    key: "IssuerOfficeCd",
    label: "Office Code",
    alternateMatches: ["Office Code"],
    ...fieldTypes.input,
    validations: [...validations.MaxLength(4)],
  },
  {
    key: "SecondTINNoticeInd",
    label: "2nd TIN Notice",
    alternateMatches: ["2nd TIN Notice"],
    example: "TRUE",
    description:
      "Indicator that payer was notified by the IRS twice within 3 calendar years that the payee provided an incorrect TIN.",
    ...fieldTypes.checkbox,
  },
  {
    key: "NonemployeeCompensationAmt",
    label: "Box 1 - Nonemployee compensation",
    alternateMatches: ["Box 1", "Box 1 - Nonemployee compensation", "Box 1 - Nonemployee Compensation"],
    example: "$12,500.00",
    fieldType: { type: "numeric", decimalPlaces: 2 },
    columnStyle: { textAlign: "right", prefix: "$" },
    validations: [...validations.USDecimalAmountNNType, ...validations.MaxLength(12)],
  },
  {
    key: "DirectSaleAboveThresholdInd",
    label: "Box 2 - Payer made direct sales totaling $5000 or more of consumer products to a recipient for resale",
    alternateMatches: [
      "Box 2",
      "Box 2 - Payer made direct sales totaling $5000 or more of consumer products to a recipient for resale",
      "Box 2 - Payer made direct sales totaling $5,000 or more of consumer products to a recipient for resale",
    ],
    example: "TRUE",
    description: "Valid checked values: TRUE, YES, 1, or X",
    ...fieldTypes.checkbox,
  },
  {
    key: "ExcessParachutePaymentAmt",
    label: "Box 3 - Excess golden parachute payments",
    alternateMatches: ["Box 3 - Excess golden parachute payments"],
    example: "$500.00",
    fieldType: { type: "numeric", decimalPlaces: 2 },
    columnStyle: { textAlign: "right", prefix: "$" },
    validations: [...validations.USDecimalAmountNNType, ...validations.MaxLength(12)],
  },
  {
    key: "FederalIncomeTaxWithheldAmt",
    label: "Box 4 - Federal income tax withheld",
    alternateMatches: ["Box 4 - Federal income tax withheld"],
    example: "$500.00",
    fieldType: { type: "numeric", decimalPlaces: 2, min: 0, max: 2000 },
    columnStyle: { textAlign: "right", prefix: "$" },
    validations: [...validations.USDecimalAmountNNType, ...validations.MaxLength(12)],
  },
  /* State Details */
  {
    key: "StateLocalTaxGrps.1.StateAbbreviationCd",
    label: "State 1 - State Code",
    alternateMatches: ["State 1 - State Code", "State 1"],
    example: "NY",
    ...fieldTypes.input,
    validations: [...validations.MaxLength(2)],
  },
  {
    key: "StateLocalTaxGrps.1.StateTaxGrp.IssuerStateNumber",
    label: "State 1 - State/Payer state number",
    alternateMatches: ["State 1 - State/Payer state number", "State 1 - Payer State Number"],
    example: "NY-998877",
    ...fieldTypes.input,
  },
  {
    key: "StateLocalTaxGrps.1.StateTaxGrp.StateTaxWithheldAmt",
    label: "State 1 - State Tax Withheld",
    alternateMatches: ["State 1 - State Tax Withheld"],
    example: "$150.00",
    fieldType: { type: "numeric", decimalPlaces: 2 },
    columnStyle: { textAlign: "right", prefix: "$" },
    validations: [...validations.USDecimalAmountNNType, ...validations.MaxLength(12)],
  },
  {
    key: "StateLocalTaxGrps.1.StateTaxGrp.StateIncomeAmt",
    label: "State 1 - State Income",
    alternateMatches: ["State 1 - State Income"],
    example: "$12,000.00",
    fieldType: { type: "numeric", decimalPlaces: 2 },
    columnStyle: { textAlign: "right", prefix: "$" },
    validations: [...validations.USDecimalAmountNNType, ...validations.MaxLength(12)],
  },
  {
    key: "StateLocalTaxGrps.2.StateAbbreviationCd",
    label: "State 2 - State Code",
    alternateMatches: ["State 2 - State Code", "State 2"],
    example: "",
    ...fieldTypes.input,
    validations: [...validations.MaxLength(2)],
  },
  {
    key: "StateLocalTaxGrps.2.StateTaxGrp.IssuerStateNumber",
    label: "State 2 - State/Payer state number",
    alternateMatches: ["State 2 - State/Payer state number", "State 2 - Payer State Number"],
    example: "",
    ...fieldTypes.input,
  },
  {
    key: "StateLocalTaxGrps.2.StateTaxGrp.StateTaxWithheldAmt",
    label: "State 2 - State Tax Withheld",
    alternateMatches: ["State 2 - State Tax Withheld"],
    example: "",
    fieldType: { type: "numeric", decimalPlaces: 2 },
    columnStyle: { textAlign: "right", prefix: "$" },
    validations: [...validations.USDecimalAmountNNType, ...validations.MaxLength(12)],
  },
  {
    key: "StateLocalTaxGrps.2.StateTaxGrp.StateIncomeAmt",
    label: "State 2 - State Income",
    alternateMatches: ["State 2 - State Income"],
    example: "",
    fieldType: { type: "numeric", decimalPlaces: 2 },
    columnStyle: { textAlign: "right", prefix: "$" },
    validations: [...validations.USDecimalAmountNNType, ...validations.MaxLength(12)],
  },
] as const

const ignoredSheetNames = ["Instructions"]

const mockComponentBehaviourForTypes = <T extends string>(props: RsiProps<T>) => props

export const mockRsiValues = mockComponentBehaviourForTypes({
  ...defaultRSIProps,
  fields: fields,
  ignoredSheetNames,
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
  ignoredSheetNames,
  numberedRows: true,
  allowDiscard: false,
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

export const editableTableInitialData = [
  {
    __rownum: 2,
    name: "Hello",
    surname: "Hello",
    age: "123123",
    team: "one",
    is_manager: true,
  },
  {
    __rownum: 3,
    name: "Hello",
    surname: "Hello",
    age: "12312zsas3",
    team: "two",
    is_manager: true,
  },
  {
    __rownum: 4,
    name: "Whooaasdasdawdawdawdiouasdiuasdisdhasd",
    surname: "Hello",
    age: "123123",
    team: undefined,
    is_manager: false,
  },
  {
    __rownum: 5,
    name: "Goodbye",
    surname: "Goodbye",
    age: "111",
    team: "two",
    is_manager: true,
  },
]

export const headerSelectionTableFields = [
  ["text", "num", "select", "bool"],
  ["second", "123", "one", "true"],
  ["third", "123", "one", "true"],
  ["fourth", "123", "one", "true"],
]
