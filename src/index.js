/**
 * Combines a bundle of namespaced getter analogous to redux' combineReducers.
 *
 * Expects input of the form:
 * ```js
 * {
 *   storeName: {
 *     getterName: state => state.id // retrieve some value from the state
 *   },
 *   anotherStoreName: {
 *     anotherGetterName: state => ...
 *   }
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
  const resolvedGetters = {};

  for (const storeName in getters) {
    const storeGetters = getters[storeName];
    for (const getterName in storeGetters) {
      if (getterName in resolvedGetters) {
        throw new Error(
          `Duplicate getter name. '${resolvedGetters[getterName].originalName}' and '${storeName}.${getterName}' conflict.`
        );
      }
      const getterFunction = storeGetters[getterName];

      // Construct new getter that gets subStore as state
      const newGetter = (...args) => {
        const store = args.pop();
        let state;
        if ("getState" in store && typeof store.getState === "function") {
          // If the given store is an actual redux store, retrieve its state.
          state = store.getState();
        } else {
          // Otherwise treat it as a state object.
          state = store;
        }
        return getterFunction(...args, state[storeName]);
      };

      // Check if the getterFunction is already namespaced. This is the case
      //when nesting combineGetters
      if ("originalName" in getterFunction) {
        // Append namespaced getterName for duplicate checking
        newGetter.originalName = `${storeName}.${getterFunction.originalName}`;
      } else {
        newGetter.originalName = `${storeName}.${getterName}`;
      }

      resolvedGetters[getterName] = newGetter;
    }
  }
  return resolvedGetters;
};

module.exports = {
  combineGetters
};
