# Runtype

A zero-dependency library to check any javascript type with error messages pointing to mistakes.

## Example

```js
const runType = require('runtype');

// somehow obtain an object
let person = {
  name: 'Actual Human',
  relativeLocation: '21 km away',
  age: 19,
  picture: 'some/picture.png',
  description: `Hello, I am real human.
I enjoy normal activities such as breathing air and walking with my leg`
}

let badPerson = {
  name: 'no',
  relativeLocation: 50,
  age: '61 y.o.',
  picture: { url: '/404.html' }
}

const schema = {
  name: 'string',
  relativeLocation: 'string',
  age: 'number',
  picture: 'string',
  description: 'string'
}

runType(person, schema) // -> true
runType(badPerson, schema)
// Returns a string:
/*
There were multiple problems with this object:
    - Key "relativeLocation" is not valid:
        Value "50" (type number) is not assignable to type string.
    - Key "age" is not valid:
        Value "61 y.o." (type string) is not assignable to type number.
    - Key "picture" is not valid:
        Value "[object Object]" (type object) is not assignable to type string.
    - The key "description" is required but missing from this object.
*/
```

## Usage

`runType(value: any, schema: Schema): true | string`

Checks the `value` against the `schema` and returns either `true` if `value` matches all types, or `string` with an error, that points to a mismatch.

### Schema

Schema is always an array of different types, if schema is not an array, it is assumed to be an array with one value. If any of the items of the schema array matches the value, the value is considered valid. That means that schema's array works like an "or".

```js
runType({
  nice: 'a string, but could be a number'
}, {
  nice: ['string', 'number']
})
// NOTE:
runType('valid', 'string'); /* is the same as */ runType('valid', ['string'])
```

For each of schema's items:

If it's a `string`:

- If it is one of the following, it is assumed that schema is a type:
  
  - `any` or `*` - Always returns `true`.
  
  - `string`, `boolean`, `number`, `object`, `function`, `bigint`, `symbol`, `undefined` - self-explanatory, but `object` does not match `null`
  
  - `nullish` - Matches `null`, `undefined`, `false`, `""`, `0`, `NaN` 
  
  - `infinite` - Positive and negative infinity
  
  - `realnumber` - Number that is not `NaN` or `infinite`.
  
  - `integer` - Matches any integer (not `NaN` or `infinite`)
  
  A type can also be inverted if you put a bang (!) before its name.
  
  Inverted types are the opposite of their normal counterpart, except for `realnumber` and `integer` - these two still only match numbers.

- If it is not one of the following, it is a literal string and runtype just checks for equality.

- If the string is wrapped in double quotes ("), they are stripped and the string is literal

```js
// To match with "string"
runType({
  a_key: 'string'
}, {
  a_key: `"string"` // <-- notice the quotes
}) // -> true
```

> The best practice is to always wrap literal strings with double quotes

If it's an array:

- If it has no items, matches any kind of array

- If it has items, tries to match at least one of these items to each element in the target array.

```js
// This matches an array with either strings or objects with key "value"
runType([
  'a string',
  { value: 'string in an object' }
], [[
  'string', { value: 'string' } // Notice the double brackets
]])
```

> Keep in mind that `[ ['string'], [{ value: 'string' }] ]` is invalid, because it will first try to check if **both** elements of the array are strings and then try to check if **both** elements are objects with a "value" key.

If it's an object:

- Matches an object with the same set of keys. Keys can be marked as optional by appending a question mark (?) to them.

- If there is a generic key type (*), runtype will try to match the unknown keys to it.

```js
runType({
  required_value: 'some string',
  another_value: 1_000,
  obj: {
    any_key: 'but the value is string'
  }
}, {
  required_value: 'string',
  another_value: 'realnumber',
  obj: {
    '*': 'string'
  },
  'optional?': 'any'
}) // -> true
```
