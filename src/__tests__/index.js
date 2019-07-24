const { createStore, combineReducers } = require("redux");

const { combineGetters } = require("../");

describe("combineGetters", () => {
  it("is a function", () => {
    expect(typeof combineGetters).toBe("function");
  });

  it("returns an empty object for an empty object", () => {
    expect(combineGetters({})).toEqual({});
  });

  it("returns an object containing a function for each getter passed into it", () => {
    const getters = {
      A: {
        AG1: state => state.id,
        AG2: state => state.name
      },
      B: {
        BG1: state => state.thing
      }
    };

    const combinedGetters = combineGetters(getters);

    expect(Object.keys(combinedGetters)).toEqual(["AG1", "AG2", "BG1"]);
  });

  it("attaches original names to the getters", () => {
    const getters = {
      A: {
        AG1: state => state.id,
        AG2: state => state.name
      },
      B: {
        BG1: state => state.thing
      }
    };

    const combinedGetters = combineGetters(getters);

    expect(combinedGetters.AG1.originalName).toBe("A.AG1");
    expect(combinedGetters.AG2.originalName).toBe("A.AG2");
    expect(combinedGetters.BG1.originalName).toBe("B.BG1");
  });

  it("namespaces the getters so they can be applied to a combined store", () => {
    const getters = {
      A: {
        AG1: state => state.id
      },
      B: {
        BG1: state => state.id
      }
    };

    const { AG1, BG1 } = combineGetters(getters);

    const A = (state = null, action) => {
      return { id: "A-Id" };
    };
    const B = (state = null, action) => {
      return { id: "B-Id" };
    };
    const store = createStore(combineReducers({ A, B }));

    expect(AG1(store)).toBe("A-Id");
    expect(BG1(store)).toBe("B-Id");
  });

  it("can handle either an actual store or a state object as parameter to the resolved getters", () => {
    const getters = {
      A: {
        AG1: state => state.id
      },
      B: {
        BG1: state => state.id
      }
    };

    const { AG1, BG1 } = combineGetters(getters);
    const state = {
      A: {
        id: "A-Id"
      },
      B: {
        id: "B-Id"
      }
    };

    expect(AG1(state)).toBe("A-Id");
    expect(BG1(state)).toBe("B-Id");
  });

  it("can be nested", () => {
    const getters = {
      A: {
        AG1: state => state.id
      },
      B: {
        BG1: state => state.id
      }
    };
    const { AG1, BG1, CG1 } = combineGetters({
      AB: combineGetters(getters),
      C: {
        CG1: state => state.id
      }
    });

    const state = {
      AB: {
        A: {
          id: "AB-A-Id"
        },
        B: {
          id: "AB-B-Id"
        }
      },
      C: {
        id: "C-Id"
      }
    };

    expect(AG1(state)).toBe("AB-A-Id");
    expect(BG1(state)).toBe("AB-B-Id");
    expect(CG1(state)).toBe("C-Id");
  });

  it("throws a descriptive error if the names of getters conflict", () => {
    const getters = {
      someStore: {
        someGetter: state => state.id
      },
      otherStore: {
        someGetter: state => state.id
      }
    };
    expect(() => combineGetters(getters)).toThrowError(
      "Duplicate getter name. 'someStore.someGetter' and 'otherStore.someGetter' conflict."
    );
  });

  it("throws a descriptive error when nesting", () => {
    const getters = {
      A: {
        AG1: state => state.id
      },
      B: {
        BG1: state => state.id
      }
    };
    const getters2 = {
      AB: combineGetters(getters),
      C: {
        AG1: state => state.id
      }
    };

    expect(() => combineGetters(getters2)).toThrowError(
      "Duplicate getter name. 'AB.A.AG1' and 'C.AG1' conflict."
    );
  });
});
