const router = require("express").Router();
const controller = require("./dishes.controller");

// TODO: Implement the /dishes routes needed to make the tests pass

// "/dishes route"
router.route("/").get(controller.list).post(controller.update);

// "dishes/:dishId route"
router.route("/:dishId").get(controller.read);

module.exports = router;
