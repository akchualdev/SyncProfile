const express = require('express');
const cluster = require('cluster');
const os = require('os');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const profileRoutes = require('./routes/profile');
const BackgroundService = require('./services/backgroundService');
const { PORT, NODE_ENV } = require('./config/constants');

const app = express();

// Security and Performance Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Initialize Background Service
BackgroundService.initialize();

// Routes
app.use('/api/v1', profileRoutes);


// Error Handler
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({
        error: 'Internal Server Error',
        message: NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// 404 Handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Cluster Setup for Production
if (cluster.isMaster && NODE_ENV === 'production') {
    const numCPUs = Math.min(os.cpus().length, 4); // Limit to 4 workers
    console.log(`🚀 Starting ${numCPUs} workers...`);

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker) => {
        console.log(`Worker ${worker.process.pid} died, restarting...`);
        cluster.fork();
    });
} else {
    app.listen(PORT, () => {
        console.log(`⚡ ULTRA-FAST Enhanced server running on port ${PORT}`);
        console.log(`🎯 Endpoint: http://localhost:${PORT}/api/v1/profile?uid=YOUR_UID&bg=1`);
    });
}

module.exports = app;