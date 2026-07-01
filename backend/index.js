import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

import router from './src/router/index.js';

const app = express();

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.disable('x-powered-by');
app.disable('etag'); 

app.use(router);

// Handling application errors within Express (START) 
const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        ok: false,
        error: {
            message: err.message || 'Internal Server Error',
            // The call stack is shown only in development mode.
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
            code: err.name // Useful for typing errors on the front end.
        }
    });
};
app.use(errorHandler);
// Handling application errors within Express (END) 


const server = app.listen(process.env.PORT, () => {
    console.log(`⚡ Express server running on port ${process.env.PORT}`);
});

// Handling application errors outside of Express (START)
// Catches promises that don't have .catch()
process.on('unhandledRejection', (reason, promise) => {
    console.error('Необработанный промис:', reason);
    // There will be error logging here 
    // ... 

    // 1. Give the server 10 seconds to gracefully shut down.
    server.close(() => {
        console.log('Все соединения закрыты.');
        process.exit(1);
    });

    // 2. If it doesn't close within 10 seconds, we force exit.
    setTimeout(() => {
        process.exit(1);
    }, 10000).unref();
});

// Intercepting errors that weren't handled by try/catch. How can I check this?

// This handles errors that weren't caught by the handler within Express (app.use(errorHandler))
// for example, an error in a third-party library or a system crash
// Errors in database initialization code
// Errors within callbacks that aren't directly related to the HTTP request
// Errors in timers (setTimeout, setInterval)
process.on('uncaughtException', (err) => {
    console.error('Критическая ошибка (uncaughtException):', err);
    // There will be error logging here 
    // ... 

    // 1. Give the server 10 seconds to gracefully shut down.
    server.close(() => {
        console.log('Все соединения закрыты.');
        process.exit(1);
    });

    // 2. If it doesn't close within 10 seconds, we force exit.
    setTimeout(() => {
        process.exit(1);
    }, 10000).unref();
});
// Handling application errors outside of Express (END)     