/**
 *
 * @param millisecond
 * @returns {Promise}
 */
const wait = (millisecond = 1000) => (
  new Promise((resolve) => {
    setTimeout(() => {
      console.log('wait...');
      resolve();
    }, millisecond);
  })
);

export default wait;
