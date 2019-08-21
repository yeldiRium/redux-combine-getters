const isPlainObject = require("is-plain-object");

const { atPath, atPathWithWildcards } = require("./util");

/**
 * Combines a bundle of namespaced getter analogous to redux' combineReducers
 * (but more powerful).
 *
 * Expects input of the form:
 * ```js
 * {
 *   storeName: {
 *     getterName: state => state.id // retrieve some value from the state
 *   },
 *   anotherStoreName: {
 *     '*': state => ...
 *   },
 *   aGetter: state => ...
 * }
 * ```
 *
 * Transforms the getter functions so that they can later be called with the
 * entire redux store (or a state object) and are then applied to their respec-
 * tive sub-store. So `getterName` as seen above when given a `state` would re-
 * turn `state.storeName.id`.
 *
 * @param {*} getters A bundle of namespaced getter functions.
 */
const combineGetters = getters => {
  if (!isPlainObject(getters)) {
    throw new Error("Expected getters to be a plain object.");
  }

  const pathStack = Object.keys(getters)
    .map(key => [key])
    .reverse();
  const resolvedGetters = {};

  while (pathStack.length > 0) {
    const path = pathStack.pop();

    const getter = atPath(path, getters);

    if (typeof getter !== "function") {
      if (!isPlainObject(getter)) {
        throw new Error(
          `Expected 'getters.${path.join(
            "."
          )}' to be a plain object or a function.`
        );
      }

      Object.keys(getter)
        .reverse()
        .forEach(key => {
          pathStack.push([...path, key]);
        });

      continue;
    }

    const fullyQualifiedGetterName = getter.originalName
      ? [...path.slice(0, -1), getter.originalName].join(".")
      : path.join(".");
    const getterName = path[path.length - 1];
    if (getterName in resolvedGetters) {
      throw new Error(
        `Duplicate getter name. '${resolvedGetters[getterName].originalName}' and '${fullyQualifiedGetterName}' conflict.`
      );
    }

    const newGetter = transformGetter(getter, path, fullyQualifiedGetterName);
    newGetter.originalName = fullyQualifiedGetterName;
    resolvedGetters[getterName] = newGetter;
  }

  return resolvedGetters;
};

const transformGetter = (getter, path) => {
  if (!getter) {
    throw new Error("Getter is missing");
  }
  if (typeof getter !== "function") {
    throw new Error("Expected getter to be a function.");
  }
  if (!path) {
    throw new Error("Path is missing.");
  }

  const newGetter = (...args) => {
    if (args.length === 0) {
      throw new Error("Store/state is missing.");
    }
    const store = args.pop();
    let state;
    if ("getState" in store && typeof store.getState === "function") {
      // If the given store is an actual redux store, retrieve its state.
      state = store.getState();
    } else {
      // Otherwise treat it as a state object.
      state = store;
    }

    const wildcardParams = [];
    for (const segment of path) {
      if (segment === "*") {
        if (args.length === 0) {
          throw new Error("Less parameters than wildcard segments supplied.");
        }
        wildcardParams.unshift(args.pop());
      }
    }

    return getter(
      ...args,
      atPathWithWildcards(path.slice(0, -1), state, wildcardParams)
    );
  };

  return newGetter;
};

module.exports = {
  combineGetters
};
