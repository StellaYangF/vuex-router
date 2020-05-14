export const mapState = stateArr => {
  let obj =  Object.create(null);
  stateArr.forEach(stateName => {
    obj[stateName] = function() {
      return this.$store.state[stateName];
    }
  });
  return obj;
}
export function mapGetters() {}
export function mapMutations() {}
export function mapActions() {}
