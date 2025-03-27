const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const routes = require("./routes");
const helmet = require('helmet');

const app = express();
app.use(cors());
app.use(helmet());
app.use(bodyParser.json());
app.use("/", routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
