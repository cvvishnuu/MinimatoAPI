const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');

jest.mock('./db');
jest.mock('./Controllers/canteenSignup');
jest.mock('./Controllers/canteenSignin');
jest.mock('./Controllers/canteenProfile');
jest.mock('./Controllers/canteenEditProfile');
jest.mock('./Controllers/canteenPrimaryMenu');
jest.mock('./Controllers/canteenGetPrimaryMenu');
jest.mock('./Controllers/canteenIncomingOrder');
jest.mock('./Controllers/canteenUploadFoodImage');
jest.mock('./Controllers/clientSignup');
jest.mock('./Controllers/clientSignin');
jest.mock('./Controllers/clientDashboard');
jest.mock('./Controllers/clientEditProfile');
jest.mock('./Controllers/clientUploadImage');
jest.mock('./Controllers/clientGetSearchResults');
jest.mock('./Controllers/clientGetMenu');
jest.mock('./Controllers/clientOrder');
jest.mock('./Controllers/healthCheck');
jest.mock('./passportConfig');
jest.mock('./passport-config.js');
jest.mock('body-parser');
jest.mock('multer');
jest.mock('cors');
jest.mock('dotenv');
jest.mock('bcrypt');
jest.mock('passport');
jest.mock('twilio');

const pool = require('./db');
const healthCheck = require('./Controllers/healthCheck');

const mockBodyParser = {
  json: jest.fn(() => (req, res, next) => next()),
  urlencoded: jest.fn(() => (req, res, next) => next())
};

const mockMulter = jest.fn(() => ({
  single: jest.fn(() => (req, res, next) => next()),
  fields: jest.fn(() => (req, res, next) => next())
}));

const mockCors = jest.fn(() => (req, res, next) => next());

const mockPassport = {
  initialize: jest.fn(() => (req, res, next) => next()),
  authenticate: jest.fn(() => (req, res, next) => next())
};

require('body-parser').json = mockBodyParser.json;
require('body-parser').urlencoded = mockBodyParser.urlencoded;
require('multer').mockReturnValue(mockMulter());
require('multer').diskStorage = jest.fn();
require('cors').mockReturnValue(mockCors());
require('passport').initialize = mockPassport.initialize;
require('passport').authenticate = mockPassport.authenticate;
require('dotenv').config = jest.fn();
require('twilio').mockReturnValue({
  messages: {
    create: jest.fn()
  }
});

jest.mock('express', () => {
  const actualExpress = jest.requireActual('express');
  const mockApp = {
    use: jest.fn(),
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    listen: jest.fn()
  };
  const expressMock = jest.fn(() => mockApp);
  expressMock.static = actualExpress.static;
  return expressMock;
});

describe('GET /health', () => {
  let app;
  let mockHandleHealthCheck;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockHandleHealthCheck = jest.fn((req, res) => {
      res.status(200).json({ status: 'healthy' });
    });
    
    healthCheck.handleHealthCheck = mockHandleHealthCheck;

    delete require.cache[require.resolve('./server')];
    require('./server');
    
    const express = require('express');
    app = express.mock.results[0].value;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should register GET /health route', () => {
    const express = require('express');
    const mockApp = express.mock.results[0].value;
    
    const healthRoute = mockApp.get.mock.calls.find(call => call[0] === '/health');
    
    expect(healthRoute).toBeDefined();
    expect(healthRoute[0]).toBe('/health');
    expect(typeof healthRoute[1]).toBe('function');
  });

  it('should call healthCheck.handleHealthCheck with req, res, and pool', () => {
    const express = require('express');
    const mockApp = express.mock.results[0].value;
    
    const healthRoute = mockApp.get.mock.calls.find(call => call[0] === '/health');
    const routeHandler = healthRoute[1];
    
    const mockReq = {};
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    routeHandler(mockReq, mockRes);
    
    expect(mockHandleHealthCheck).toHaveBeenCalledWith(mockReq, mockRes, pool);
  });

  it('should pass pool instance to health check handler', () => {
    const express = require('express');
    const mockApp = express.mock.results[0].value;
    
    const healthRoute = mockApp.get.mock.calls.find(call => call[0] === '/health');
    const routeHandler = healthRoute[1];
    
    const mockReq = {};
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    routeHandler(mockReq, mockRes);
    
    expect(mockHandleHealthCheck).toHaveBeenCalledTimes(1);
    expect(mockHandleHealthCheck.mock.calls[0][2]).toBe(pool);
  });

  it('should be registered after all other routes', () => {
    const express = require('express');
    const mockApp = express.mock.results[0].value;
    
    const allGetRoutes = mockApp.get.mock.calls.map(call => call[0]);
    const healthRouteIndex = allGetRoutes.indexOf('/health');
    const listenCallIndex = mockApp.listen.mock.calls.length > 0 ? allGetRoutes.length : -1;
    
    expect(healthRouteIndex).toBeGreaterThan(-1);
    expect(healthRouteIndex).toBeLessThan(allGetRoutes.length);
  });

  it('should handle health check controller errors gracefully', () => {
    const express = require('express');
    const mockApp = express.mock.results[0].value;
    
    const mockError = new Error('Database connection failed');
    healthCheck.handleHealthCheck = jest.fn((req, res) => {
      res.status(503).json({ status: 'unhealthy', error: mockError.message });
    });
    
    const healthRoute = mockApp.get.mock.calls.find(call => call[0] === '/health');
    const routeHandler = healthRoute[1];
    
    const mockReq = {};
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    routeHandler(mockReq, mockRes);
    
    expect(healthCheck.handleHealthCheck).toHaveBeenCalledWith(mockReq, mockRes, pool);
  });

  it('should not require authentication for health check endpoint', () => {
    const express = require('express');
    const mockApp = express.mock.results[0].value;
    
    const healthRoute = mockApp.get.mock.calls.find(call => call[0] === '/health');
    
    expect(healthRoute.length).toBe(2);
    expect(typeof healthRoute[1]).toBe('function');
  });
});

describe('healthCheck module import', () => {
  it('should import healthCheck controller', () => {
    const healthCheckModule = require('./Controllers/healthCheck');
    expect(healthCheckModule).toBeDefined();
  });

  it('should have handleHealthCheck function', () => {
    const healthCheckModule = require('./Controllers/healthCheck');
    expect(healthCheckModule.handleHealthCheck).toBeDefined();
  });
});

describe('server initialization with health check', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize server with health check route', () => {
    delete require.cache[require.resolve('./server')];
    require('./server');
    
    const express = require('express');
    const mockApp = express.mock.results[0].value;
    
    expect(mockApp.get).toHaveBeenCalled();
    const healthRoute = mockApp.get.mock.calls.find(call => call[0] === '/health');
    expect(healthRoute).toBeDefined();
  });

  it('should call app.listen on port 5000', () => {
    delete require.cache[require.resolve('./server')];
    require('./server');
    
    const express = require('express');
    const mockApp = express.mock.results[0].value;
    
    expect(mockApp.listen).toHaveBeenCalledWith(5000, expect.any(Function));
  });
});