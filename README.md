# Redux Combine Getters

**This library is no longer maintained**

I've abandoned this library because its entire premise was misguided. I tried to create a method of composing getters analogous to reducers, and it made things much more complicated. For anyone interested in getter composition I recommend taking a look at [reselect](https://github.com/reduxjs/reselect).

If anyone really likes this library and would like to revive it, feel free to send me an e-mail.

---

A small utility for combining and namespacing getters for redux stores analogous to [`combineReducers`](https://redux.js.org/api/combinereducers).

Now with [wildcards](./examples/wildcards)! For stores where the keys are part of the data.

```sh
npm install @yeldirium/redux-combine-getters
# or
yarn install @yeldirium/redux-combine-getters
```

## Status

| Category         | Status                                                                                                                                  |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Version          | [![npm](https://img.shields.io/npm/v/@yeldirium/redux-combine-getters)](https://www.npmjs.com/package/@yeldirium/redux-combine-getters) |
| Dependencies     | ![David](https://img.shields.io/david/yeldirium/redux-combine-getters)                                                                  |
| Dev dependencies | ![David](https://img.shields.io/david/dev/yeldirium/redux-combine-getters)                                                              |
| Build            | ![GitHub Actions](https://github.com/yeldiRium/redux-combine-getters/workflows/Release/badge.svg?branch=master)                         |
| License          | ![GitHub](https://img.shields.io/github/license/yeldiRium/redux-combine-getters)                                                        |

## Why use this?

Redux' `combineReducers` is a wonderful tool for breaking a store into multiple
smaller stores. This makes the whole store much more testable. If you're like me
and write getters for your sub-stores to make accessing the data easier,
maintining said getters can become tedious at some point. The reducers don't
know about their place in the store, since they are encapsulated components.
However, the getters have to query the store across all layers. That is tight
coupling and annoying. You don't want to mock your entire store structure to
test a getter, right?

If you move your reducers around and change your store's overall structure, you
don't have to adjust the individual reducers or their tests, because they are
completely independent of the overall store structure. With `combineGetters`
your getters are also independent of the overall structure and only query the
smaller sub-stores.

TL;DR: Make getters independent of store structure. It's easier to comprehend
and test.

## How it works

You pass it a bundle of getters namespaced with the names of their stores:

```js
const resolvedGetters = combineGetters({
  todos: { getTodoCount, getOpenTodoCount },
  visibilityFilter: { getCurrentVisibility }
});
```

Where your corresponding `rootReducer` looks like this:

```js
const rootReducer = combineReducers({
  todos,
  visibilityFilter
});
```

`resolvedGetters` will then be an object containing all resolved getter functions:

```js
const getTodoCount = resolvedGetters.getTodoCount;
```

And each of these getters now takes the outer redux store:

```js
const store = createStore(rootReducer);
getTodoCount(store);
```

But only has access to its corresponding sub-store.

> **Careful**: `combineGetters` assumes all getters to be [data-last](https://www.javierchavarri.com/data-first-and-data-last-a-comparison/), i.e. to take the store/state as their last parameter. This is mainly because I like [ramda](https://github.com/ramda/ramda) and [pipeline operators](https://github.com/tc39/proposal-pipeline-operator) are not mainstream in js yet.

Since all getters are collected in a single object you must make sure that no
getter name is duplicated. E.g. there can not be a `getId` getter for multiple
sub-stores. Call them getStoreAId and getStoreBId or something like that. This
is the only limitation.

Also: You can nest structures passed to `combineGetters`:

```js
const resolvedGetters = combineGetters({
    AB: {
        A: { ... },
        B: { ... }
    },
    C: { ... }
})
```

## Example

See the [examples directory](./examples).
