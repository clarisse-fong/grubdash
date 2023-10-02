const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");
const { log } = require("console");

// TODO: Implement the /dishes handlers needed to make the tests pass

// This function lists all existing dish data.
function list(req, res, next) {
  res.send({ data: dishes });
}

//This function checks if the dish exists. If it does, saves foundDish to res.locals.dish and moves onto the next tension. If it doesn't, sends a 404 error
const dishExists = (req, res, next) => {
  //checks if the dish exists
  const { dishId } = req.params;
  const foundDish = dishes.find((d) => {
    return d.id === dishId;
  });
  if (foundDish) {
    //if it exists, save dish to res.locals
    res.locals.dish = foundDish;
    next();
  } else {
    next({ status: 404, message: `No matching id is found for '${dishId}'` });
  }
};

//This function will respond with the dish where id === :dishId or return 404 if no matching dish is found.
function read(req, res, next) {
  const foundDish = res.locals.dish;
  res.send({ data: foundDish });
}

//This function validates dish price property.
const validatesPrice = (req, res, next) => {
  const input = req.body.data.price;

  //checks if the dish has a price
  if (!input) {
    next({ status: 400, message: "Dish must include a price" });
    //checks if the dish price is not 0 or less
  } else if (input <= 0) {
    next({
      status: 400,
      message: "Dish must have a price that is an integer greater than 0",
    });
  } else if (typeof input !== "number") {
    //checks that dish price is a number
    next({
      status: 400,
      message: "Dish must have a price that is an integer greater than 0",
    });
  } else {
    next();
  }
};

//This function validates for a given dish property if the dish property exists and is not empty.
const validateFor = (property) => {
  return function (req, res, next) {
    const input = req.body.data[property];
    if (!input) {
      next({ status: 400, message: `Dish must include a ${property}` });
    } else {
      next();
    }
  };
};

//This function will save the dish and respond with the newly created dish.
function create(req, res, next) {
  const {
    data: { name, description, price, image_url },
  } = req.body;

  let newDish = {
    id: nextId(),
    name,
    description,
    price,
    image_url,
  };
  dishes.push(newDish);
  res.status(201).send({ data: newDish });
}

function validatesCorrectIdToUpdate(req, res, next) {
  const { dishId: routeId } = req.params;
  const dishId = req.body.data.id;
  if (!dishId) {
    return next();
  } else if (routeId === dishId) {
    next();
  } else {
    next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${dishId}, Route: ${routeId}`,
    });
  }
}

//This function will update the dish where id === :dishId or return 404 if no matching dish is found.
function update(req, res, next) {
  const foundDish = res.locals.dish;
  const {
    data: { name, description, price, image_url },
  } = req.body;

  foundDish.name = name;
  foundDish.description = description;
  foundDish.price = price;
  foundDish.image_url = image_url;

  res.send({ data: foundDish });
}

module.exports = {
  list,
  read: [dishExists, read],
  create: [
    validatesPrice,
    validateFor("name"),
    validateFor("description"),
    validateFor("image_url"),
    create,
  ],
  update: [
    dishExists,
    validatesCorrectIdToUpdate,
    validatesPrice,
    validateFor("name"),
    validateFor("description"),
    validateFor("image_url"),
    update,
  ],
};
