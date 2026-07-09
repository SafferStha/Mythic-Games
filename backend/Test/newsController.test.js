const newsController = require('../controller/newsController');

// 🔥 MOCK MODEL
jest.mock('../model/newsModel');

const newsModel = require('../model/newsModel');

describe('News Controller Tests', () => {

  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      file: null
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ✅ TEST 1: getNews success
  test('should fetch all news', async () => {
    newsModel.getAllNews.mockResolvedValue([
      {
        id: 1,
        title: 'News 1',
        excerpt: 'Test',
        image_url: 'img.jpg',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    await newsController.getNews(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true
      })
    );
  });

  // ✅ TEST 2: getNews error
  test('should handle getNews error', async () => {
    newsModel.getAllNews.mockRejectedValue(new Error('DB error'));

    await newsController.getNews(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  // ✅ TEST 3: createNews - missing title
  test('should return 400 if title missing', async () => {
    req.body = { title: '' };

    await newsController.createNews(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  // ✅ TEST 4: createNews success
  test('should create news successfully', async () => {
    req.body = {
      title: 'New News',
      excerpt: 'Test news'
    };

    newsModel.createNews.mockResolvedValue({
      id: 1,
      title: 'New News',
      excerpt: 'Test news',
      image_url: 'img.jpg',
      created_at: new Date(),
      updated_at: new Date()
    });

    await newsController.createNews(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalled();
  });

  // ✅ TEST 5: createNews with file upload
  test('should create news with uploaded file', async () => {
    req.body = {
      title: 'File News'
    };

    req.file = {
      filename: 'upload.jpg'
    };

    newsModel.createNews.mockResolvedValue({
      id: 2,
      title: 'File News',
      image_url: '/uploads/upload.jpg',
      created_at: new Date(),
      updated_at: new Date()
    });

    await newsController.createNews(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  // ✅ TEST 6: updateNews - missing title
  test('should return 400 if update title missing', async () => {
    req.params = { id: 1 };
    req.body = { title: '' };

    await newsController.updateNews(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  // ✅ TEST 7: updateNews - not found
  test('should return 404 if news not found', async () => {
    req.params = { id: 1 };
    req.body = { title: 'Updated' };

    newsModel.updateNews.mockResolvedValue(null);

    await newsController.updateNews(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  // ✅ TEST 8: updateNews success
  test('should update news successfully', async () => {
    req.params = { id: 1 };
    req.body = { title: 'Updated News' };

    newsModel.updateNews.mockResolvedValue({
      id: 1,
      title: 'Updated News',
      excerpt: '',
      image_url: '',
      created_at: new Date(),
      updated_at: new Date()
    });

    await newsController.updateNews(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true
      })
    );
  });

  // ✅ TEST 9: deleteNews - not found
  test('should return 404 if delete fails', async () => {
    req.params = { id: 1 };

    newsModel.deleteNews.mockResolvedValue(false);

    await newsController.deleteNews(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  // ✅ TEST 10: deleteNews success
  test('should delete news successfully', async () => {
    req.params = { id: 1 };

    newsModel.deleteNews.mockResolvedValue(true);

    await newsController.deleteNews(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true
      })
    );
  });

});