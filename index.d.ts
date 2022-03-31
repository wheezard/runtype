type BetterTypeof = (val: any) => "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function" | "null"

type StringTypeDef = 'string' | 'boolean' | 'object' | 'number' | 'function' | 'nullish' | 'infinite' | 'realnumber' | 'integer'

type SingleTypeDef = 'any' | '*' | StringTypeDef | `!${StringTypeDef}` | `"${string}"` | number |
  { [key: string]: TypeDef, "*"?: TypeDef } |
  TypeDef[] | null | undefined | ((val: any, betterTypeof: BetterTypeof) => any)

type TypeDef = SingleTypeDef[] | SingleTypeDef

export default function (target: any, typedef: TypeDef): true | string