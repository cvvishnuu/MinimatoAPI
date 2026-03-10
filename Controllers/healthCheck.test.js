const { handleHealthCheck } = require('./healthCheck');

describe('handleHealthCheck', () => {
  let mockReq;
  let mockRes;
  let mockPool;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockPool = {
      query: jest.fn()
    };
    jest.spyOn(process, 'uptime').mockReturnValue(12345.67);
    jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2024-01-15T10:30:00.000Z');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return 200 with healthy status when database is healthy', async () => {
    mockPool.query.mockResolvedValue({
      rows: [{ now: '2024-01-15 10:30:00' }]
    });

    await handleHealthCheck(mockReq, mockRes, mockPool);

    expect(mockPool.query).toHaveBeenCalledWith('SELECT NOW()');
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: true,
      payload: {
        status: 'ok',
        timestamp: '2024-01-15T10:30:00.000Z',
        uptime: 12345.67,
        service: 'minimato-api',
        checks: {
          server: 'healthy',
          database: 'healthy'
        }
      }
    });
  });

  it('should return 503 with degraded status when database query fails', async () => {
    mockPool.query.mockRejectedValue(new Error('Connection refused'));

    await handleHealthCheck(mockReq, mockRes, mockPool);

    expect(mockPool.query).toHaveBeenCalledWith('SELECT NOW()');
    expect(mockRes.status).toHaveBeenCalledWith(503);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      payload: {
        status: 'degraded',
        timestamp: '2024-01-15T10:30:00.000Z',
        uptime: 12345.67,
        service: 'minimato-api',
        checks: {
          server: 'healthy',
          database: 'unhealthy'
        }
      }
    });
  });

  it('should return 503 with degraded status when database returns empty rows', async () => {
    mockPool.query.mockResolvedValue({
      rows: []
    });

    await handleHealthCheck(mockReq, mockRes, mockPool);

    expect(mockRes.status).toHaveBeenCalledWith(503);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      payload: {
        status: 'degraded',
        timestamp: '2024-01-15T10:30:00.000Z',
        uptime: 12345.67,
        service: 'minimato-api',
        checks: {
          server: 'healthy',
          database: 'unknown'
        }
      }
    });
  });

  it('should return 503 with degraded status when database returns null rows', async () => {
    mockPool.query.mockResolvedValue({
      rows: null
    });

    await handleHealthCheck(mockReq, mockRes, mockPool);

    expect(mockRes.status).toHaveBeenCalledWith(503);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      payload: {
        status: 'degraded',
        timestamp: '2024-01-15T10:30:00.000Z',
        uptime: 12345.67,
        service: 'minimato-api',
        checks: {
          server: 'healthy',
          database: 'unknown'
        }
      }
    });
  });

  it('should include current timestamp in response', async () => {
    const fixedTime = '2024-06-20T14:22:33.456Z';
    jest.spyOn(Date.prototype, 'toISOString').mockReturnValue(fixedTime);
    mockPool.query.mockResolvedValue({
      rows: [{ now: '2024-06-20 14:22:33' }]
    });

    await handleHealthCheck(mockReq, mockRes, mockPool);

    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          timestamp: fixedTime
        })
      })
    );
  });

  it('should include process uptime in response', async () => {
    const mockUptime = 98765.43;
    jest.spyOn(process, 'uptime').mockReturnValue(mockUptime);
    mockPool.query.mockResolvedValue({
      rows: [{ now: '2024-01-15 10:30:00' }]
    });

    await handleHealthCheck(mockReq, mockRes, mockPool);

    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          uptime: mockUptime
        })
      })
    );
  });

  it('should include service name in response', async () => {
    mockPool.query.mockResolvedValue({
      rows: [{ now: '2024-01-15 10:30:00' }]
    });

    await handleHealthCheck(mockReq, mockRes, mockPool);

    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          service: 'minimato-api'
        })
      })
    );
  });

  it('should mark server as healthy regardless of database status', async () => {
    mockPool.query.mockRejectedValue(new Error('DB error'));

    await handleHealthCheck(mockReq, mockRes, mockPool);

    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          checks: expect.objectContaining({
            server: 'healthy'
          })
        })
      })
    );
  });

  it('should handle database timeout errors', async () => {
    mockPool.query.mockRejectedValue(new Error('Query timeout'));

    await handleHealthCheck(mockReq, mockRes, mockPool);

    expect(mockRes.status).toHaveBeenCalledWith(503);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      payload: expect.objectContaining({
        status: 'degraded',
        checks: {
          server: 'healthy',
          database: 'unhealthy'
        }
      })
    });
  });

  it('should handle database connection pool errors', async () => {
    mockPool.query.mockRejectedValue(new Error('Pool exhausted'));

    await handleHealthCheck(mockReq, mockRes, mockPool);

    expect(mockRes.status).toHaveBeenCalledWith(503);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      payload: expect.objectContaining({
        checks: {
          server: 'healthy',
          database: 'unhealthy'
        }
      })
    });
  });
});