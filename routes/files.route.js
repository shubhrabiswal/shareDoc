const router = require('express').Router();
const filecontr = require('../controller/files.controller')

router.post('/',filecontr.fileadd)
router.post('/send',filecontr.sendViaEmail)

module.exports = router;