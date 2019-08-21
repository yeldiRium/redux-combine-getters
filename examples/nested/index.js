const { combineGetters } = require("@yeldirium/redux-combine-getters");
const { combineReducers, createStore } = require("redux");

/*
 * Let's model some rpg characters in redux. Keep in mind that this is an
 * example, I am not a game developer and it is after midnight while I'm writing
 * this. Don't take anything but the concept seriously.
 */
const attributes = (state = { str: 5, dex: 5, int: 5 }, action) => {
  switch (action.type) {
    case "SET_STR":
      return {
        ...state,
        str: action.value
      };
    case "SET_DEX":
      return {
        ...state,
        dex: action.value
      };
    case "SET_INT":
      return {
        ...state,
        int: action.value
      };
    default:
      return state;
  }
};

const stats = (state = { hp: 100, mana: 50 }, action) => {
  switch (action.type) {
    case "TAKE_DAMAGE":
      return {
        ...state,
        hp: hp - action.damage
      };
    case "HEAL":
      return {
        ...state,
        hp: hp + action.healing
      };
    case "USE_MANA":
      return {
        ...state,
        mana: mana - action.manaCost
      };
    case "REGENERATE_MANA":
      return {
        ...state,
        mana: mana - action.regeneration
      };
    default:
      return state;
  }
};

/*
 * A player has attributes and stats and potentially more, but for now this will
 * be enough.
 */
const player = combineReducers({
  attributes,
  stats
});

/*
 * And now we build a party of multiple players. This is also our root reducer.
 */
const party = combineReducers({
  ana: player,
  bob: player,
  cheyenne: player
});

/*
 * Let's define some getters for the stores.
 */
const getStr = attributes => attributes.str;
const getDex = attributes => attributes.dex;
const getInt = attributes => attributes.int;

const getHp = stats => stats.hp;
const getMp = stats => stats.mp;
const isFullLife = stats => stats.hp === 100;

/*
 * Now we put the getters together. This is somewhat arbitrary to demonstrate
 * that we can put this together however we want.
 */
const getters = combineGetters({
  ana: {
    attributes: {
      getAnasStr: getStr
    },
    stats: {
      getAnasHp: getHp
    }
  },
  bob: {
    attributes: {
      getAnasDex: getDex
    },
    stats: {
      isBobFullLife: isFullLife
    }
  },
  cheyenne: {
    attributes: {
      getCheyennesInt: getInt
    },
    stats: {
      getCheyennesMp: getMp
    }
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
getters.getAnasStr(store); // => 5
getters.getCheyennesMp(store); // => 50
getters.isBobFullLife(store); // => true
