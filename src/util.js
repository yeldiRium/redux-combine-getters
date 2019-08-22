const atPath = (path = [], obj) => {
  for (const segment of path) {
    if (obj === undefined || !(segment in obj)) {
      return undefined;
    }
    obj = obj[segment];
  }
  return obj;
};

const atPathWithWildcards = (path = [], obj, _params = []) => {
  const params = [..._params];
  for (let segment of path) {
    if (segment === "*") {
      if (params.length === 0) {
        throw new Error("Encountered more wildcards than parameters.");
      }
      segment = params.pop();
    }
    if (obj === undefined || !(segment in obj)) {
      return undefined;
    }
    obj = obj[segment];
  }
  return obj;
};

module.exports = {
  atPath,
  atPathWithWildcards
};
