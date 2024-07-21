const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const validate = require('../middleware/validateRequest');
const { createNewsSchema, updateNewsSchema } = require('../Validations/newsValidator');
const {Auth} = require('../middleware/auth')
// Create a news
router.post('/news', validate(createNewsSchema), newsController.createNews);

// Get all news
router.get('/news',Auth , newsController.getAllNews);

// Get news by ID
router.get('/news/:id', newsController.getNewsById);

// Update a news
router.put('/news/:id', validate(updateNewsSchema), newsController.updateNews);

// Delete a news
router.delete('/news/:id', newsController.deleteNews);

module.exports = router;
