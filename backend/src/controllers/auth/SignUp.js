

export default class SignUpController {

    static signUp(deps) {
        return async (request, res) => {
            // to test the application's error handling system
            // throw new Error('backend error in backend/src/controllers/DedicatedServerController.js');

            let result = {
                "ok": true,
                "data": request.body,
                "meta": null,
                "error": null
            }
            res.status(200).json(result);
            return;
        }
    }
}