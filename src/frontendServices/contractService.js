function setupService() {
  return function service() {
    const app = this;
    const path = '/api/contracts';

    app.service(path).hooks({
      before: {

      },
      after: {

      },
    });
  };
}

export default setupService;
