const express = require("express");
const router = express.Router();

const articlesController = require("./controllers/articles");

router.get("/api/", articlesController.init);
router.get("/api/articles", articlesController.index);
router.get("/api/articles/search", articlesController.search);

module.exports = router;
