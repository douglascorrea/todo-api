class AppError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.status = status;
        // This is to ensure the instanceof check works when transpiled to JavaScript
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
export default AppError