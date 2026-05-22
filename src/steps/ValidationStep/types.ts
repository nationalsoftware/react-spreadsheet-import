import { InfoWithSource } from "../../types"

export type Meta = { __index: string; __rownum?: number; __errors?: Error | null }
export type Error = { [key: string]: InfoWithSource }
export type Errors = { [id: string]: Error }
