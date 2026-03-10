const handleHealthCheck = async (req, res, pool) => {
    const healthStatus = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        service: 'minimato-api',
        checks: {
            server: 'healthy',
            database: 'unknown'
        }
    };

    try {
        const dbResult = await pool.query('SELECT NOW()');
        if (dbResult.rows[0]) {
            healthStatus.checks.database = 'healthy';
        }
    } catch (error) {
        healthStatus.status = 'degraded';
        healthStatus.checks.database = 'unhealthy';
    }

    const statusCode = healthStatus.status === 'ok' ? 200 : 503;
    res.status(statusCode).json({
        success: healthStatus.status === 'ok',
        payload: healthStatus
    });
};

module.exports = { handleHealthCheck };
