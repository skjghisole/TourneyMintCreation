import contractService from './contractService';

function setupService() {
    return function service() {
        const app = this;
        app.configure(contractService());
    }
}

export default setupService;
