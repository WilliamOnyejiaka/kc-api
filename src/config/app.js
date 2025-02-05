const auth = require("./../routes/auth.js");

function createApp() {
    const express = require('express');
    const app = express();
    const morgan = require('morgan');
    const cors = require('cors');
    const logger = require('./logger');
    const stream = {
        write: (message) => logger.http(message.trim()),
    };

    app.use(express.urlencoded({ extended: true }));
    app.use(cors());
    app.use(express.json());
    app.use(morgan("combined", { stream }));

    app.use("/api/v1/auth", auth);

    app.post("/test2", async (req, res) => {
        res.status(200).json({
            'error': false,
            'message': "result"
        });
    });

    // app.use(handleMulterErrors);
    app.use((req, res, next) => {
        console.warn(`Unmatched route: ${req.method} ${req.path}`);
        res.status(404).json({
            error: true,
            message: "Route not found. Please check the URL or refer to the API documentation.",
        })
    });
    return app;
}


module.exports = createApp;