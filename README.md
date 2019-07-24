# Redux Combine Getters

A small utility for combining and namespacing getters for redux stores analogous to [`combineReducers`](https://redux.js.org/api/combinereducers).

## Why use this?

Redux' `combineReducers` is a wonderful tool for breaking a store into multiple
smaller stores. This makes the whole store much more testable. If you're like me
and also write getters for your sub-stores to make accessing the data easier,
maintining said getters can become tedious at some point. The reducers don't
know about their place in the store, since they are encapsulated components.
However, the getters have to query the store across all layers. That is tight
coupling and annoying. You don't want to mock your entire store structure to
test a getter, right?

If you move your reducers around and change your store's overall structure, you
don't have to adjust the individual reducers or their tests, because they are
completely independent from the overall store structure. With `combineGetters`
your getters are also independent from the overall structure and only query the
smaller sub-stores.

TL;DR: Make getters independent from store structure. It's easier to comprehend
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

Since all getters are collected in a single object you must make sure that no
getter name is duplicated. E.g. there can not be a `getId` getter for multiple
sub-stores. Call them getStoreAId and getStoreBId or something like that. This
is the only limitation.

Also: You can nest calls to `combineGetters`:

```js
const resolvedGetters = combineGetters({
    AB: combineGetters({
        A: { ... },
        B: { ... }
    }),
    C: { ... }
})
```

## Example

Partly taken from [the Redux documentation](https://redux.js.org/basics/reducers#splitting-reducers)
and expanded.

```js
// reducers.js
const { combineReducers } = require("redux");
// First define several reducers (and actions for them somewhere else)
const todos = (state = [], action) => {
  switch (action.type) {
    case "ADD_TODO":
      return [
        ...state,
        {
          text: action.text,
          completed: false
        }
      ];
    case "TOGGLE_TODO":
      return state.map((todo, index) => {
        if (index === action.index) {
          return Object.assign({}, todo, {
            completed: !todo.completed
          });
        }
        return todo;
      });
    default:
      return state;
  }
};

const visibilityFilter = (state = "SHOW_ALL", action) => {
  switch (action.type) {
    case "SET_VISIBILITY_FILTER":
      return action.filter;
    default:
      return state;
  }
};

// Then combine these reducers into one
module.exports = combineReducers({
  visibilityFilter,
  todos
});

// getters.js
const { combineGetters } = require("@yeldirium/redux-combine-getters");
// Define some getters for each of the sub stores
const getTodoCount = state => state.length;
const getOpenTodoCount = state => state.filter(todo => !todo.compled).length;

// This one is very basic, since it returns the entire sub-store's content
const getCurrentVisibility = state => state;

// Then resolve these getters
module.exports = combineGetters({
  todos: { getTodoCount, getOpenTodoCount },
  visibilityFilter: { getCurrentVisibility }
});

// index.js
// Now put it all together:
const { createStore } = require("redux");
const app = require("./reducer");
const { getTodoCount, getCurrentVisibity } = require("./getters");

const store = createStore(app);

console.log(getTodoCount(store)) // 0, since there are no todos yet
console.log(getCurrentVisibility)) // SHOW_ALL, the initial value
```
