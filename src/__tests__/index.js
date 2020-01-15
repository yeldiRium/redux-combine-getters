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
        thing: {
          BThingG1: state => state.thang
        },
        BG1: state => state.thing
      },
      CG1: state => state.A
    };

    const combinedGetters = combineGetters(getters);

    expect(Object.keys(combinedGetters)).toEqual([
      "AG1",
      "AG2",
      "BThingG1",
      "BG1",
      "CG1"
    ]);
  });

  describe("debugging", () => {
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

      const A = () => {
        return { id: "A-Id" };
      };
      const B = () => {
        return { id: "B-Id" };
      };
      const store = createStore(combineReducers({ A, B }));

      expect(AG1(store)).toBe("A-Id");
      expect(BG1(store)).toBe("B-Id");
    });
  });

  describe("getters", () => {
    it("supports getters on the same level as stores", () => {
      const getters = {
        A: {
          GA1: state => state.id
        },
        G1: state => state.A.id
      };

      const { GA1, G1 } = combineGetters(getters);

      const state = {
        A: {
          id: "aID"
        }
      };

      expect(GA1(state)).toBe("aID");
      expect(G1(state)).toBe("aID");
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

    it("supports getters that take parameters", () => {
      const getters = {
        A: {
          AG1: (value, state) => state.number + value
        }
      };

      const { AG1 } = combineGetters(getters);

      const state = {
        A: {
          number: 3
        }
      };

      expect(AG1(5, state)).toBe(8);
    });

    it("supports getters that take multiple parameters", () => {
      const getters = {
        A: {
          AG1: (valueA, valueB, state) => state.number + valueA + valueB
        }
      };

      const { AG1 } = combineGetters(getters);

      const state = {
        A: {
          number: 3
        }
      };

      expect(AG1(5, 7, state)).toBe(15);
    });

    describe("nesting", () => {
      it("can be nested", () => {
        const getters = {
          AB: {
            A: {
              AG1: state => state.id
            },
            B: {
              BG1: state => state.id
            }
          },
          C: {
            CG1: state => state.id
          }
        };
        const { AG1, BG1, CG1 } = combineGetters(getters);

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

      it("can be nested by using combineGetters multiple times", () => {
        const getters = {
          AB: combineGetters({
            A: {
              AG1: state => state.id
            },
            B: {
              BG1: state => state.id
            }
          }),
          C: {
            CG1: state => state.id
          }
        };
        const { AG1, BG1, CG1 } = combineGetters(getters);

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

      it("can speard combined getters into new combined getter", () => {
        const getters = {
          ...combineGetters({
            A: {
              AG1: state => state.id
            },
            B: {
              BG1: state => state.id
            }
          }),
          C: {
            CG1: state => state.id
          }
        };
        const { AG1, BG1, CG1 } = combineGetters(getters);

        const state = {
          A: {
            id: "A-Id"
          },
          B: {
            id: "B-Id"
          },
          C: {
            id: "C-Id"
          }
        };

        expect(AG1(state)).toBe("A-Id");
        expect(BG1(state)).toBe("B-Id");
        expect(CG1(state)).toBe("C-Id");
      });

      it("can be nested multiple layers", () => {
        const getters = {
          A: {
            aWhole: state => state,
            GA1: state => state.id,
            B: {
              bWhole: state => state,
              GAB1: state => state.id,
              C: {
                cWhole: state => state,
                GABC1: state => state.id
              }
            }
          },
          whole: state => state
        };

        const {
          aWhole,
          GA1,
          bWhole,
          GAB1,
          cWhole,
          GABC1,
          whole
        } = combineGetters(getters);

        const state = {
          A: {
            id: "A-Id",
            B: {
              id: "B-Id",
              C: {
                id: "C-Id"
              }
            }
          }
        };

        expect(aWhole(state)).toEqual(state.A);
        expect(GA1(state)).toBe(state.A.id);
        expect(bWhole(state)).toEqual(state.A.B);
        expect(GAB1(state)).toBe(state.A.B.id);
        expect(cWhole(state)).toEqual(state.A.B.C);
        expect(GABC1(state)).toBe(state.A.B.C.id);
        expect(whole(state)).toEqual(state);
      });

      it("gives undefined to the getter if a layer in the state is undefined", () => {
        const getters = {
          outer: {
            "*": {
              inner: {
                language: state => state,
                languageOrDefault: state => (state === undefined ? "de" : state)
              }
            }
          }
        };

        const { language, languageOrDefault } = combineGetters(getters);

        const state = {
          outer: {
            wrong: {
              inner: "en"
            },
            right: undefined
          }
        };

        expect(language("right", state)).toBe(undefined);
        expect(languageOrDefault("right", state)).toBe("de");
      });

      it("gives undefined to the getter if a layer in the state is undefined when nesting combining", () => {
        const getters = {
          outer: {
            "*": combineGetters({
              inner: {
                language: state => state,
                languageOrDefault: state => (state === undefined ? "de" : state)
              }
            })
          }
        };

        const { language, languageOrDefault } = combineGetters(getters);

        const state = {
          outer: {
            wrong: {
              inner: "en"
            },
            right: undefined
          }
        };

        expect(language("right", state)).toBe(undefined);
        expect(languageOrDefault("right", state)).toBe("de");
      });
    });
  });

  describe("error handling", () => {
    it("getters throw an error if no store is given", () => {
      const getters = {
        G1: state => state
      };

      const { G1 } = combineGetters(getters);

      expect(() => G1()).toThrow("Store/state is missing.");
    });

    it("throws an error if the given getters are not an object", () => {
      expect(() => combineGetters()).toThrow(
        "Expected getters to be a plain object."
      );
      expect(() => combineGetters(null)).toThrow(
        "Expected getters to be a plain object."
      );
      expect(() => combineGetters(false)).toThrow(
        "Expected getters to be a plain object."
      );
      expect(() => combineGetters(true)).toThrow(
        "Expected getters to be a plain object."
      );
      expect(() => combineGetters(5)).toThrow(
        "Expected getters to be a plain object."
      );
      expect(() => combineGetters("uiae")).toThrow(
        "Expected getters to be a plain object."
      );
      expect(() => combineGetters(NaN)).toThrow(
        "Expected getters to be a plain object."
      );
      expect(() => combineGetters([])).toThrow(
        "Expected getters to be a plain object."
      );
    });

    it("throws an error if a getter is neither a plain object nor a function", () => {
      expect(() => combineGetters({ G1: 5 })).toThrow(
        "Expected 'getters.G1' to be a plain object or a function."
      );
      expect(() => combineGetters({ G1: "uiae" })).toThrow(
        "Expected 'getters.G1' to be a plain object or a function."
      );
      expect(() => combineGetters({ G1: false })).toThrow(
        "Expected 'getters.G1' to be a plain object or a function."
      );
      expect(() => combineGetters({ G1: true })).toThrow(
        "Expected 'getters.G1' to be a plain object or a function."
      );
      expect(() => combineGetters({ G1: NaN })).toThrow(
        "Expected 'getters.G1' to be a plain object or a function."
      );
      expect(() => combineGetters({ G1: undefined })).toThrow(
        "Expected 'getters.G1' to be a plain object or a function."
      );
      expect(() => combineGetters({ G1: null })).toThrow(
        "Expected 'getters.G1' to be a plain object or a function."
      );
      expect(() => combineGetters({ G1: Symbol("uiae") })).toThrow(
        "Expected 'getters.G1' to be a plain object or a function."
      );
      expect(() => combineGetters({ G1: new (class {})() })).toThrow(
        "Expected 'getters.G1' to be a plain object or a function."
      );
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

  describe("wildcard", () => {
    it("supports wildcards as store names and assumes the second to last getter parameter to be the store name", () => {
      const getters = {
        "*": {
          AG1: state => state.id
        }
      };

      const { AG1 } = combineGetters(getters);

      const state = {
        A: {
          id: "A-Id"
        },
        B: {
          id: "B-Id"
        }
      };

      expect(AG1("A", state)).toBe("A-Id");
      expect(AG1("B", state)).toBe("B-Id");
    });

    it("returns undefined for access to wildcards with no entry in the state", () => {
      const getters = {
        "*": {
          GA1: state => state
        }
      };

      const { GA1 } = combineGetters(getters);

      const state = {
        A: "A",
        B: "B"
      };

      expect(GA1("C", state)).toBe(undefined);
    });

    it("returns undefined for access to multi-level wildcards with no entry in the state", () => {
      const getters = {
        "*": {
          "*": {
            GA1: state => state
          }
        }
      };

      const { GA1 } = combineGetters(getters);

      const state = {};

      expect(GA1("A", "B", state)).toBe(undefined);
    });

    it("allows nesting wildcards and uses parameters from the right of the getter", () => {
      const getters = {
        "*": {
          "*": {
            AG1: state => state.id
          }
        }
      };

      const { AG1 } = combineGetters(getters);

      const state = {
        outer: {
          inner: {
            id: "outer-inner-Id"
          }
        }
      };

      expect(AG1("inner", "outer", state)).toBe("outer-inner-Id");
    });

    it("allows nesting wildcards with layers in between", () => {
      const getters = {
        "*": {
          A: {
            "*": {
              AG1: state => state.id
            }
          }
        }
      };

      const { AG1 } = combineGetters(getters);

      const state = {
        outer: {
          A: {
            inner: {
              id: "outer-A-inner-Id"
            },
            innerTwo: {
              id: "outer-A-innerTwo-Id"
            }
          }
        }
      };

      expect(AG1("inner", "outer", state)).toBe("outer-A-inner-Id");
      expect(AG1("innerTwo", "outer", state)).toBe("outer-A-innerTwo-Id");
    });

    it("allows wildcards on the same level as other getters", () => {
      const getters = {
        "*": {
          AG1: state => state.id
        },
        AG2: (name, state) => state[name].id
      };

      const { AG1, AG2 } = combineGetters(getters);

      const state = {
        someThing: {
          id: "someThingID"
        }
      };

      expect(AG1("someThing", state)).toBe("someThingID");
      expect(AG2("someThing", state)).toBe("someThingID");
    });

    it("throws an error if less parameters than wildcards are given", () => {
      const getters = {
        "*": {
          G1: state => state
        }
      };

      const { G1 } = combineGetters(getters);

      const state = {
        A: {}
      };

      expect(() => G1(state)).toThrow(
        "Less parameters than wildcard segments supplied."
      );
    });
  });
});
