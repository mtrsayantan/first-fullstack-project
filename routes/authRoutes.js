const { Router } = require('express');
const authcontroller = require('../controllers/authController');
const upload = require('../middleware/upload');
const { requireAuth, checkUser } = require('../middleware/authMiddleware');
const router = Router();

router.get('/signup', authcontroller.signup_get);
router.post('/signup', upload, authcontroller.signup_post);
router.get('/signin', authcontroller.signin_get);
router.post('/signin', authcontroller.signin_post);
router.get('/signout', authcontroller.signout);
router.get('/profile', authcontroller.profile);
router.get('/editUser', authcontroller.editUser_get);
router.post('/editUser', upload, authcontroller.editUser_post);
router.get('/course', requireAuth, authcontroller.course_get);
router.post('/course', authcontroller.lsn_status)
router.get('/task', authcontroller.task_get);
router.post('/task', authcontroller.task_post);
router.get('/editTask/:id', authcontroller.taskEdit_pg);
router.put('/editTask/:id', authcontroller.task_edit);
router.delete('/task/:id', authcontroller.task_delete);
module.exports = router;