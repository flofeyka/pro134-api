
const ctrlWrapper = (controller) => {
    return async (req, res, next) => {
        try {
            await controller(req, res, next);
        } catch(e) {
            console.log(e);
            next(e);
        }
    }
}

export default ctrlWrapper;