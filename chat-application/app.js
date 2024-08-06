const express = require("express");
//Acquire the dotenv package. Details in .env
const dotenv = require("dotenv");

//a function in the dotenv package. it loads the environment variables from the .env file.
dotenv.config();

const app = express();
