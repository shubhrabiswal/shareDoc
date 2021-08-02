const router = require('express').Router();
const filecontr = require('../controller/files.controller')

router.get('/:uuid',filecontr.showfile)

module.exports = router