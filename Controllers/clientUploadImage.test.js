const { handleUploadImage } = require('./clientUploadImage');

describe('handleUploadImage', () => {
  let mockReq;
  let mockRes;
  let mockPool;
  let consoleLogSpy;

  beforeEach(() => {
    mockReq = {
      user: { client_id: 'test-client-123' },
      file: { originalname: 'test-image.jpg' }
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockPool = {
      query: jest.fn()
    };

    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleLogSpy.mockRestore();
  });

  it('should insert new image when client has no existing image', async () => {
    mockPool.query.mockImplementation((query, params, callback) => {
      if (query.includes('SELECT')) {
        const result = { rows: [] };
        callback(null, result);
        return Promise.resolve();
      }
      if (query.includes('INSERT')) {
        return Promise.resolve();
      }
    });

    await handleUploadImage(mockReq, mockRes, mockPool);

    await new Promise(resolve => setImmediate(resolve));

    expect(mockPool.query).toHaveBeenCalledWith(
      'SELECT * FROM images WHERE client_id = $1',
      ['test-client-123'],
      expect.any(Function)
    );

    expect(mockPool.query).toHaveBeenCalledWith(
      'INSERT INTO images(imageurl, client_id) VALUES($1,$2)',
      ['/uploads/test-image.jpg', 'test-client-123']
    );

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: true,
      msg: 'Inserted'
    });
  });

  it('should update existing image when client already has an image', async () => {
    mockPool.query.mockImplementation((query, params, callback) => {
      if (query.includes('SELECT')) {
        const result = { rows: [{ imageurl: '/uploads/old-image.jpg', client_id: 'test-client-123' }] };
        callback(null, result);
        return Promise.resolve();
      }
      if (query.includes('UPDATE')) {
        return Promise.resolve();
      }
    });

    await handleUploadImage(mockReq, mockRes, mockPool);

    await new Promise(resolve => setImmediate(resolve));

    expect(mockPool.query).toHaveBeenCalledWith(
      'SELECT * FROM images WHERE client_id = $1',
      ['test-client-123'],
      expect.any(Function)
    );

    expect(mockPool.query).toHaveBeenCalledWith(
      'UPDATE images SET imageurl = $1, WHERE client_id = $2',
      ['/uploads/test-image.jpg', 'test-client-123']
    );

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: true,
      msg: 'Updated'
    });
  });

  it('should return 401 and log response when SELECT query fails', async () => {
    const selectError = new Error('Database connection failed');
    mockPool.query.mockImplementation((query, params, callback) => {
      if (query.includes('SELECT')) {
        callback(selectError, null);
      }
    });

    await handleUploadImage(mockReq, mockRes, mockPool);

    await new Promise(resolve => setImmediate(resolve));

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false
    });
    expect(consoleLogSpy).toHaveBeenCalledWith(mockRes);
  });

  it('should handle INSERT query error and return error in response', async () => {
    const insertError = new Error('Insert failed');
    mockPool.query.mockImplementation((query, params, callback) => {
      if (query.includes('SELECT')) {
        const result = { rows: [] };
        callback(null, result);
        return Promise.resolve();
      }
      if (query.includes('INSERT')) {
        return Promise.reject(insertError);
      }
    });

    await handleUploadImage(mockReq, mockRes, mockPool);

    await new Promise(resolve => setImmediate(resolve));

    expect(consoleLogSpy).toHaveBeenCalledWith(insertError);
    expect(mockRes.json).toHaveBeenCalledWith(insertError);
  });

  it('should handle UPDATE query error and return error in response', async () => {
    const updateError = new Error('Update failed');
    mockPool.query.mockImplementation((query, params, callback) => {
      if (query.includes('SELECT')) {
        const result = { rows: [{ imageurl: '/uploads/old.jpg', client_id: 'test-client-123' }] };
        callback(null, result);
        return Promise.resolve();
      }
      if (query.includes('UPDATE')) {
        return Promise.reject(updateError);
      }
    });

    await handleUploadImage(mockReq, mockRes, mockPool);

    await new Promise(resolve => setImmediate(resolve));

    expect(consoleLogSpy).toHaveBeenCalledWith(updateError);
    expect(mockRes.json).toHaveBeenCalledWith(updateError);
  });

  it('should return 400 when outer try-catch catches an error', async () => {
    mockReq.user = null;

    await handleUploadImage(mockReq, mockRes, mockPool);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false
    });
  });

  it('should construct correct image URL from file originalname', async () => {
    mockReq.file.originalname = 'my-photo.png';
    mockPool.query.mockImplementation((query, params, callback) => {
      if (query.includes('SELECT')) {
        const result = { rows: [] };
        callback(null, result);
        return Promise.resolve();
      }
      if (query.includes('INSERT')) {
        return Promise.resolve();
      }
    });

    await handleUploadImage(mockReq, mockRes, mockPool);

    await new Promise(resolve => setImmediate(resolve));

    expect(mockPool.query).toHaveBeenCalledWith(
      'INSERT INTO images(imageurl, client_id) VALUES($1,$2)',
      ['/uploads/my-photo.png', 'test-client-123']
    );
  });

  it('should log url and client_id to console', async () => {
    mockPool.query.mockImplementation((query, params, callback) => {
      if (query.includes('SELECT')) {
        const result = { rows: [] };
        callback(null, result);
        return Promise.resolve();
      }
      if (query.includes('INSERT')) {
        return Promise.resolve();
      }
    });

    await handleUploadImage(mockReq, mockRes, mockPool);

    await new Promise(resolve => setImmediate(resolve));

    expect(consoleLogSpy).toHaveBeenCalledWith('url /uploads/test-image.jpg');
    expect(consoleLogSpy).toHaveBeenCalledWith('id test-client-123');
  });

  it('should handle missing file in request', async () => {
    mockReq.file = undefined;

    await handleUploadImage(mockReq, mockRes, mockPool);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false
    });
  });

  it('should handle different client_id values', async () => {
    mockReq.user.client_id = 'different-client-456';
    mockPool.query.mockImplementation((query, params, callback) => {
      if (query.includes('SELECT')) {
        const result = { rows: [] };
        callback(null, result);
        return Promise.resolve();
      }
      if (query.includes('INSERT')) {
        return Promise.resolve();
      }
    });

    await handleUploadImage(mockReq, mockRes, mockPool);

    await new Promise(resolve => setImmediate(resolve));

    expect(mockPool.query).toHaveBeenCalledWith(
      'SELECT * FROM images WHERE client_id = $1',
      ['different-client-456'],
      expect.any(Function)
    );

    expect(mockPool.query).toHaveBeenCalledWith(
      'INSERT INTO images(imageurl, client_id) VALUES($1,$2)',
      ['/uploads/test-image.jpg', 'different-client-456']
    );
  });
});