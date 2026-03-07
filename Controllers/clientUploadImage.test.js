const { handleUploadImage } = require('../Controllers/clientUploadImage');

describe('handleUploadImage', () => {
  let mockReq;
  let mockRes;
  let mockPool;

  beforeEach(() => {
    mockReq = {
      user: {
        client_id: 'test-client-123'
      },
      file: {
        originalname: 'test-image.jpg'
      }
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockPool = {
      query: jest.fn()
    };

    console.log = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should insert new image when client has no existing image', (done) => {
    mockPool.query.mockImplementation((query, params, callback) => {
      if (query.includes('SELECT')) {
        callback(null, { rows: [] });
      }
      return Promise.resolve();
    });

    handleUploadImage(mockReq, mockRes, mockPool);

    setTimeout(() => {
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
      done();
    }, 100);
  });

  it('should update existing image when client already has an image', (done) => {
    mockPool.query.mockImplementation((query, params, callback) => {
      if (query.includes('SELECT')) {
        callback(null, { rows: [{ imageurl: '/uploads/old-image.jpg', client_id: 'test-client-123' }] });
      }
      return Promise.resolve();
    });

    handleUploadImage(mockReq, mockRes, mockPool);

    setTimeout(() => {
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
      done();
    }, 100);
  });

  it('should return 401 when SELECT query fails', (done) => {
    mockPool.query.mockImplementation((query, params, callback) => {
      callback(new Error('Database connection failed'), null);
    });

    handleUploadImage(mockReq, mockRes, mockPool);

    setTimeout(() => {
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false
      });
      done();
    }, 100);
  });

  it('should handle INSERT query error and log error', (done) => {
    const insertError = new Error('Insert failed');
    mockPool.query.mockImplementation((query, params, callback) => {
      if (query.includes('SELECT')) {
        callback(null, { rows: [] });
      } else if (query.includes('INSERT')) {
        return Promise.reject(insertError);
      }
    });

    handleUploadImage(mockReq, mockRes, mockPool);

    setTimeout(() => {
      expect(console.log).toHaveBeenCalledWith(insertError);
      expect(mockRes.json).toHaveBeenCalledWith(insertError);
      done();
    }, 100);
  });

  it('should handle UPDATE query error and log error', (done) => {
    const updateError = new Error('Update failed');
    mockPool.query.mockImplementation((query, params, callback) => {
      if (query.includes('SELECT')) {
        callback(null, { rows: [{ imageurl: '/uploads/old.jpg' }] });
      } else if (query.includes('UPDATE')) {
        return Promise.reject(updateError);
      }
    });

    handleUploadImage(mockReq, mockRes, mockPool);

    setTimeout(() => {
      expect(console.log).toHaveBeenCalledWith(updateError);
      expect(mockRes.json).toHaveBeenCalledWith(updateError);
      done();
    }, 100);
  });

  it('should return 400 when outer try-catch catches error', async () => {
    mockReq.user = null;

    await handleUploadImage(mockReq, mockRes, mockPool);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false
    });
  });

  it('should construct correct image URL from file originalname', (done) => {
    mockReq.file.originalname = 'profile-pic.png';

    mockPool.query.mockImplementation((query, params, callback) => {
      if (query.includes('SELECT')) {
        callback(null, { rows: [] });
      }
      return Promise.resolve();
    });

    handleUploadImage(mockReq, mockRes, mockPool);

    setTimeout(() => {
      expect(mockPool.query).toHaveBeenCalledWith(
        'INSERT INTO images(imageurl, client_id) VALUES($1,$2)',
        ['/uploads/profile-pic.png', 'test-client-123']
      );
      done();
    }, 100);
  });

  it('should log url, client_id, and test message', (done) => {
    mockPool.query.mockImplementation((query, params, callback) => {
      callback(null, { rows: [] });
      return Promise.resolve();
    });

    handleUploadImage(mockReq, mockRes, mockPool);

    setTimeout(() => {
      expect(console.log).toHaveBeenCalledWith('url /uploads/test-image.jpg');
      expect(console.log).toHaveBeenCalledWith('id test-client-123');
      expect(console.log).toHaveBeenCalledWith('test');
      done();
    }, 100);
  });

  it('should handle missing file in request', async () => {
    mockReq.file = undefined;

    await handleUploadImage(mockReq, mockRes, mockPool);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false
    });
  });

  it('should handle missing user in request', async () => {
    mockReq.user = undefined;

    await handleUploadImage(mockReq, mockRes, mockPool);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false
    });
  });

  it('should handle file with special characters in name', (done) => {
    mockReq.file.originalname = 'my image (1).jpg';

    mockPool.query.mockImplementation((query, params, callback) => {
      if (query.includes('SELECT')) {
        callback(null, { rows: [] });
      }
      return Promise.resolve();
    });

    handleUploadImage(mockReq, mockRes, mockPool);

    setTimeout(() => {
      expect(mockPool.query).toHaveBeenCalledWith(
        'INSERT INTO images(imageurl, client_id) VALUES($1,$2)',
        ['/uploads/my image (1).jpg', 'test-client-123']
      );
      done();
    }, 100);
  });

  it('should log outer catch error when exception occurs', async () => {
    const outerError = new Error('Outer error');
    mockReq.user = {
      client_id: 'test-client-123'
    };
    mockReq.file = {
      originalname: 'test.jpg'
    };

    mockPool.query.mockImplementation(() => {
      throw outerError;
    });

    await handleUploadImage(mockReq, mockRes, mockPool);

    expect(console.log).toHaveBeenCalledWith(outerError);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false
    });
  });
});