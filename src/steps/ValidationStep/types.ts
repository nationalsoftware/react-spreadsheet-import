import type { InfoWithSource, SelectOption } from "../../types"

export type SelectOptionsMap = { [fieldKey: string]: SelectOption[] }
export type Meta = { __index: string; __rownum?: number; __errors?: Error | null; __selectOptions?: SelectOptionsMap }
export type Error = { [key: string]: InfoWithSource }
export type Errors = { [id: string]: Error }
