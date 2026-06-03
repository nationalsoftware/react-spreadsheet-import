import type { Fields, FlatFields, Field, FieldGroup } from "../types"
import { isFieldGroup } from "../types"
import type { DeepReadonly } from "ts-essentials"

export const flattenFields = <T extends string>(fields: Fields<T>): FlatFields<T> =>
  fields.flatMap((item: DeepReadonly<Field<T> | FieldGroup<T>>) =>
    isFieldGroup(item) ? (item.fields as DeepReadonly<Field<T>[]>) : ([item] as DeepReadonly<Field<T>[]>),
  ) as FlatFields<T>
