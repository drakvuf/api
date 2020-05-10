require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const { stream } = require("logger");
const cors = require("cors");
const { handleError, notFound } = require("./src/handlers/error");

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(morgan("dev"));
app.use(helmet());
app.use(morgan(":method :url :response-time ms", { stream }));
app.use("/", require("./src/router"));
app.get("*", notFound);
app.use(handleError);

app.listen(port, function () {
  console.log(`App is running on port ${port}`);
});
