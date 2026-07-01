import { Router } from 'express'
const router = Router();

import Auth from '../utils/auth.js';

import pool from '../utils/db.js';

import DedicatedServerController from '../controllers/DedicatedServerController.js';
import SignUpController from '../controllers/auth/SignUp.js';

const deps = { pool, logger: null, config: null };

router.get('/', (req, res) => {
    let response = {
        "ok": true,
        "data": "The Express server of the ANGULAR-CONCEPTS-RESEARCH application has been running!",
        "meta": null,
        "error": null
    }
    res.status(200).json(response);
})

router.get('/dedicated-server/:id', DedicatedServerController.getDedicatedServer(deps));

router.post('/sign-up', SignUpController.signUp(deps));

router.use((req, res, next) => {
    res.send('404 page');
    next();
});

export default router;