const { combineGetters } = require("@yeldirium/redux-combine-getters");
const { combineReducers, createStore } = require("redux");

/*
 * Let's first define two simple, independent reducers.
 * One that counts up and down and remembers its previous value and one that
 * stores a language.
 */
const counter = (state = { value: 0, previousValue: undefined }, action) => {
  switch (action.type) {
    case "INCREMENT":
      return {
        value: state.value + 1,
        previousValue: state.value
      };
    case "DECREMENT":
      return {
        value: state.value - 1,
        previousValue: state.value
      };
    default:
      return state;
  }
};

const language = (state = "german", action) => {
  switch (action.type) {
    case "SET_LANGUAGE":
      return action.newLanguage;
    default:
      return state;
  }
};

/*
 * Now we build a store from the two reducers using redux' built in
 * `combineReducers` function.
 */
const rootReducer = combineReducers({
  counter,
  language
});

/*
 * Now we write simple getters that retrieve the values from the stores.
 * Note that we write these getters independently from the rootReducer. They
 * each only know about their own parts of the store.
 */
const getPreviousCounterValue = counter => counter.previousValue;

const getCounterValue = counter => counter.value;

/*
 * This getter is very simple, since the store only consists of a primitive
 * value. Quite a few getters become trivial when removing the store navigation
 * logic.
 */
const getCurrentLanguage = language => language;

/*
 * Now we put the getters together. The structure of the parameter should be
 * the same of that given to `combineReducers`.
 */
const getters = combineGetters({
  counter: {
    getPreviousCounterValue,
    getCounterValue
  },
  language: {
    getCurrentLanguage
  }
});

/*
 * As the last preparation, let's build the actual redux store.
 */
const store = createStore(rootReducer);

/*
 * Finally we can use the getters constructed above by passing them the store
 * and they will act as if they were passed only the part of the store they
 * care about.
 */
getters.getPreviousCounterValue(store); // => undefined
getters.getCounterValue(store); // => 0
getters.getCurrentLanguage(store); // => 'german'

store.dispatch({ type: "INCREMENT" });

getters.getCounterValue(store); // => 1
