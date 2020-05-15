export const mapState = (options) => {
  let obj = Object.create(null);
  if (Array.isArray(options)) {
    options.forEach((stateName) => {
      obj[stateName] = function() {
        return this.$store.state[stateName];
      };
    });
  } else {
    Object.entries(options).forEach(([stateName, value]) => {
      obj[stateName] = function() {
        if (typeof value === "string") {
          return this.$store.state[stateName];
        }
        return value(this.$store.state);
      }
    });
  }
  return obj;
};

export function mapGetters(namespace, options) {
  let obj = Object.create(null);
  if (Array.isArray(namespace)) {
    options = namespace;
    namespace = '';
  } else {
    namespace += '/';
  }
  options.forEach(getterName => {
    console.log(getterName)
    obj[getterName] = function() {
      return this.$store.getters[namespace + getterName];
    }
  })
  return obj;
}

export function mapMutations(namespace, options) {
  let obj = Object.create(null);
  if (Array.isArray(namespace)) {
    options = namespace;
    namespace = '';
  } else {
    namespace += '/';
  }
  options.forEach(mutationName => {
    obj[mutationName] = function(payload) {
      return this.$store.commit(namespace + mutationName, payload)
    }
  })
  return obj;
}

export function mapActions(namespace, options) {
  let obj = Object.create(null);
  if (Array.isArray(namespace)) {
    options = namespace;
    namespace = '';
  } else {
    namespace += '/';
  }
  options.forEach(actionName => {
    obj[actionName] = function(payload) {
      return this.$store.dispatch(namespace + actionName, payload)
    }
  })
  return obj;
}
