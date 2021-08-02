const router = require('express').Router();
const filecontr = require('../controller/files.controller')

router.post('/',filecontr.fileadd)

module.exports = router;