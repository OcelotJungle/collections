# @ocelotjungle/collections
This package contains 7 collections that are subtypes of a standard Set and Map, and one complex collection DataPond, which can be used to manage some micro-lakes of data, relating entities to each other.

---

## Collections
### ComplexSet<K - key, I - item>
This collection acts like a common Set except ComplexSet allows to use object values. It compares equality not of items, but of something returned by selector (keys). Actually, this is just a map with selector.
Creating a ComplexSet with item type `{ foo: number, bar: string }` and key type `number`. First argument is a selector, that selects foo from item type. In this case, `foo` is a key and it will refleсt equality of items, so if a.foo == b.foo, then a == b. If `updateExisting` is true, then adding an item with already existing key will replace the existing item.
```ts
new ComplexSet<number, { foo: number, bar: string }>(({ foo }) => foo, [updateExisting])
  .add({ foo: 42, bar: "question" })
  .add({ foo: 42, bar: "not question" }) // replaces previous if updateExisting
  .add({ foo: 100, bar: "IOO" })
```
---
### EnsuredMap<K - key, V - value>
Does nothing except `get` returns `X` instead of `X | undefined`. No real checking, no safety, only types. Use it only when you are absolutely sure here is a value for key.
```ts
new EnsuredMap<number, string>([entries])
  .set(42, "question") // { 42 => "question" }
  .get(42) // "question"
  .get(43) // undefined as V
```
---
### ArrayEnsuredMap<K - key, V - value>
The same as EnsuredMap, but stores V[]. Also allows to push/clear array by a key. Other array functions are not implemented.
```ts
new ArrayEnsuredMap<number, string>([entries])
  .set(42, []) // { 42 => [] }
  .push(42, "question") // { 42 => ["question"] }
  .clear(42) // { 42 => [] }
  .clear() // { }
```
---
### StrongMap<K - key, V - value>
This collection is a map that guarantees an existence of required key by using a callback that creates some default V.
```ts
new StrongMap<number, string>(() => "default value", [entries])
  .set(42, "question") // { 42 => "question" }
  .get(42) // "question"
  .get(43) // "default value"
```
---
### ArrayStrongMap<K - key, V - value>
The same as StrongMap, but stores V[] and default value is always an empty array. Also allows to push/clear array by a key. Other array functions are not implemented.
```ts
new ArrayStrongMap<number, string>([entries])
  .push(42, "foo") // { 42 => ["foo"] }
  .get(42) // ["foo"]
  .get(43) // []
```
---
### ComplexKeyMap<K - key, V - value>
This collection is a Map that allows to correctly use complex objects. When you use `get`, it won't compare object's reference equality, but its structure. Also, likely StrongMap, guarantees that `get` returns a defined value. Requires passing default value callback.
```ts
new ComplexKeyMap<{ foo: number, bar: string }, boolean>(() => false, [entries])
  .set({ foo: 42, bar: "question" }, true) // { { foo: 42, bar: "question" } => true }
  .get({ foo: 42, bar: "question" }) // true
  .get(43) // false
```
---
### ArrayComplexKeyMap<K - key, V - value>
The same as ComplexKeyMap, but stores V[] and default value is always an empty array. Also allows to push/clear array by a key. Other array functions are not implemented.
```ts
new ArrayComplexKeyMap<{ foo: number, bar: string }, boolean>([entries])
  .push({ foo: 42, bar: "question" }, true) // { { foo: 42, bar: "question" } => [true] }
  .get({ foo: 42, bar: "question" }) // [true]
  .get({ foo: 43, bar: "no value" }) // []
```
---
### DataPond<P - pond scheme>
This collection is like a micro-database with preconfigured JOINs. It realizes a crude state machine on types for user's convenience (that makes impossible to correctly extend this class, preserving the state machine).
#### Creating
```ts
DataPond.create<P>(idExtractors)
```
- `P` is a scheme of data, it looks like `{ [name]: object }`
- `idExtractors` is an object like `{ [name]: extractor }`
- `extractor` is a selector function that accepts corresponding type object and returns some identifier

Example:
```ts
DataPond.create<{ foo: { bar: number, baz: Date } }>({ foo: ({ bar }) => bar })
```
- `foo` is a pond entity, it's type `{ bar: number, baz: Date }`
- `({ bar }) => bar` is an `extractor`, it selects `bar` from `foo`

#### Using
##### Add entities (`add(name, entity)`)
Initially the pond has state `0` (next `DataPond<0>`), that means no cache.
Adding one entity returns `DataPond<1>`, that means there's `owner` in the cache.
Adding one more entity returns `DataPond<2>`, that means there're `owner` and `item` in the cache.
Adding more entities won't affect state of the pond. The pond "remembers" only last 2 added entities.

##### Relate entities (`relate(item, owner)` or `relate({ owner, item })`)
`owner` and `item` can be either pointers to the entity ([entity_name, entity_id]) or arrays of pointers or even `undefined`, if applicable (depending on cache size).

`DataPond<0>`.`relate`:
- requires both `owner` and `item`;
- returns `DataPond<0>`;

`DataPond<1>`.`relate`:
- requires either:
  - passing `item` in `relate(item, owner)` and in this case `owner` is optional (if pass no `owner`, will be used `owner` from cache)
  - or passing `owner` or `item` in `relate({ owner, item })` and in this case the second argument will be optional (will be used from cache);
- returns `DataPond<1>`, that allows add one entity and then call multiple `relate` in chain with different arguments;

`DataPond<2>`.`relate`:
- requires no arguments and if called without them, will use `owner` and `item` from cache;
- passing one or both arguments will lead to using them instead of cache;
- returns `DataPond<0>`;

##### Fetching entities (`fetch(name, id)` or `fetch(name, id, array_of_names)`)
`fetch(name, id)` returns entity with corresponding name and id.
`fetch(name, id, array_of_names)` acts like `fetch(name, id)`, but augments the result with related entities, which names are in `array_of_names`: `{ _[name]: related_entity[] }`

#### Examples
```ts
type Foo = { id: number, value: string };
type Bar = { name: string };
type Schema = { foo: Foo, bar: Bar };

// Creating
const dp = new DataPond<Schema>({
    foo: ({ id }) => id,
    bar: ({ name }) => name,
});

// Adding

dp.add("foo", { id: 42, value: "question" });
dp.add("bar", { name: "baz" });
dp.relate(["bar", "baz"], ["foo", 42]); // relating item to owner, foo-42 owns bar-baz

dp
    .add("foo", { id: 43, value: "not question" }) // state 1, owner in cache
    .relate(["bar", "baz"]) // relates item to cached owner, foo-43 also owns bar-baz

dp
    .add("foo", { id: 44, value: "idk" }) // state 1, owner in cache
    .add("bar", { name: "buzz" }) // state 2, owner and item in cache
    .relate() // relates cached item to cached owner, foo-44 owns bar-buzz

// Fetching

dp.fetch("foo", 42) // { id: 42, value: "question" }
dp.fetch("foo", 44, ["bar"]) // { id: 44, value: "idk", _bar: [{ name: "buzz" }] }
```
