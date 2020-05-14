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

export function mapGetters(options) {
  
}

export function mapMutations(namespace, options) {
  let obj = Object.create(null);
  if (Array.isArray(namespace)) options = namespace;
  namespace = '';
  options.forEach(mutationName => {
    obj[mutationName] = function() {
      debugger;
      return function(payload) {
        this.$store.commit(mutationName, payload)
      }
    }
  })
  return obj;
}

export function mapActions() {}
