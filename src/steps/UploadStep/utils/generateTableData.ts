import type { Field, Fields } from "../../../types";

const titleMap: Record<Field<string>["fieldType"]["type"], string> = {
  checkbox: "Boolean",
  select: "Options",
  input: "Text",
};

export const generateTableData = <T extends string>(fields: Fields<T>) => {
  const row = fields.reduce<Record<T, string>>((acc, field) => {
    acc[field.key as T] = field.example || titleMap[field.fieldType.type];
    return acc;
  }, {} as Record<T, string>);

  return fields.map((field) => ({
    label: field.label,
    description: field.description,
    value: row[field.key as T],
  }));
};
