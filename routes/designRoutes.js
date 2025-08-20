const express = require('express');
const router = express.Router();
const designController = require('../controllers/designController');
const auth = require('../middlewares/middleware');

// Wrap async controller calls to handle errors
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Routes with proper error handling
router.post('/create-user-design', auth, asyncHandler(designController.create_user_design));
router.get('/user-design/:design_id', auth, asyncHandler(designController.get_user_design));
router.put('/update-user-design/:design_id', auth, asyncHandler(designController.update_user_design));

router.post('/add-user-image', auth, asyncHandler(designController.add_user_image));
router.get('/get-user-image', auth, asyncHandler(designController.get_user_image));

router.get('/design-images', auth, asyncHandler(designController.get_initial_image));
router.get('/background-images', auth, asyncHandler(designController.get_background_image));

router.get('/user-designs', auth, asyncHandler(designController.get_user_designs));

router.put('/delete-user-image/:design_id', auth, asyncHandler(designController.delete_user_image));

router.get('/templates', auth, asyncHandler(designController.get_templates));
router.get('/add-user-template/:template_id', auth, asyncHandler(designController.add_user_template));

// Global error handler
router.use((err, req, res, next) => {
  console.error('🚨 Backend Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

module.exports = router;
