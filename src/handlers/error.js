const { logError } = require("logger");

function handleError(error, request, response, next) {
  logError(error);

  response.status(500).json({ message: "Server error" });
}

function notFound(request, response, next) {
  response.status(404).json({ message: "Endpoint not found" });
}

module.exports = {
  handleError,
  notFound,
};
