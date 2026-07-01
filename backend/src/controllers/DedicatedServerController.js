import DedicatedServerService from "../services/DedicatedServerService.js";

export default class DedicatedServerController {

    static test_fild = 12;

    static getDedicatedServer(deps) {
        return async (req, res) => {
            // to test the application's error handling system
            // throw new Error('backend error in backend/src/controllers/DedicatedServerController.js');
            
            let server = DedicatedServerService.getDedicatedServer(req.params.id);

            let data = {
                ...server
            }

            let response = {
                "ok": true,
                "data": data,
                "meta": null,
                "error": null
            }
            res.status(200).json(response);
        }
    }
}