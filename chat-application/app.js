const express = require("express");
//Acquire the dotenv package. Details in .env
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");
const cookieParser = require("cookie-parser");
// const loginRouter = require("./router/loginRouter");
// const usersRouter = require("./router/usersRouter");
// const inboxRouter = require("./router/inboxRouter");

const app = express();
//a function in the dotenv package. it loads the environment variables from the .env file.
dotenv.config();

// database connection. establishes a connection to a MongoDB database.
mongoose
  .connect(process.env.MONGO_CONNECTION_STRING)
  .then(() => console.log("database connection successful!"))
  .catch((err) => console.log(err));


// request parsers. app.use() is a method in Express to register middleware functions. Middleware functions are functions that have access to the request and response objects.
// to parse json
app.use(express.json());
// A built-in middleware function in Express that parses incoming request bodies containing URL-encoded data. This is crucial for handling form data submitted from HTML forms.
//revision: When a user submits an HTML form, the data is typically sent in URL-encoded format. By default, Express doesn't parse the request body, so you won't have access to the form data in req.body. Using express.urlencoded() ensures that the form data is parsed and available as an object in req.body. Example:
// app.post('/submit-form', (req, res) => {
//    console.log(req.body); //// Access form data here
//  });
//req.body will contain an object with the form fields as properties.
//If you use express.urlencoded({ extended: false }), it means you're opting for a simpler and potentially faster way to parse URL-encoded data. However, there are limitations: It can only parse simple data types like strings and arrays. But complex objects and nested structures within the request body will not be parsed correctly. In essence, extended: false is suitable for simpler applications where you know the structure of the incoming data will be straightforward. Example niche.
app.use(express.urlencoded({ extended: true }));


//set the ejs view engine. Jehutu ejs install kora ache, eta dile e setting e view engine hisebe ejs k set kore dibe. require er kono kaj nai ekhane. r by default ejs root e "views" nam er folder khuje r sekhane thaka sob ejs file k read korte pare. sejonno 'views' name ekta folder create kore fellam.
app.set("view engine", "ejs");


// set static folder. sob static file ja user access korte parbe segulo ekhane thakbe. seta declare kore deya hocche. individually to static file er access deya e hobe bivinno route theke. kintu directly site-url/public e geleo user public folder e thaka sob file k access korte parbe. 
// express.static() is a built-in middleware function in Express that serves static files from a specified directory. means user access the content of that directory. Common Use Cases: Serving HTML, CSS, JavaScript, and image files. Providing downloadable files.
// path.join(__dirname, "public"): This part dynamically constructs the absolute path to the public directory, ensuring it works correctly regardless of where the application is executed.
// When a request is made for a file that matches a path within the public directory, Express will automatically serve the file as a response without requiring additional code.
// Example:
// If you have an index.html file in the public directory, you can access it by visiting http://localhost:3000/index.html.

app.use(express.static(path.join(__dirname, "public")));












// Differences in Data Parsing with `extended: false`

// Example Form Data:
// <form method="POST" action="/submit">
//   <input type="text" name="name" value="John Doe">
//   <input type="number" name="age" value="30">
//   <input type="checkbox" name="hobbies" value="coding">
//   <input type="checkbox" name="hobbies" value="reading">
// </form>


// Using `express.urlencoded({ extended: true })`:
// app.use(express.urlencoded({ extended: true }));
// app.post('/submit', (req, res) => {
//   console.log(req.body);
// });
// Output:
// json
// {
//   name: 'John Doe',
//   age: 30,
//   hobbies: ['coding', 'reading']
// }


// Using `express.urlencoded({ extended: false })`:
// app.use(express.urlencoded({ extended: false }));

// app.post('/submit', (req, res) => {
//   console.log(req.body);
// });

// Output:
// {
//   name: 'John Doe',
//   age: '30',
//   hobbies: 'coding'
// }

// As you can see, with `extended: true`, the `hobbies` array is correctly parsed. With `extended: false`, the `hobbies` value is the first checked value, and the other checkboxes are ignored. The `age` is also a string instead of a number.

// Conclusion:
// While `extended: false` might be simpler and faster for basic form data, it often leads to unexpected results when dealing with complex form structures. For most real-world applications, `extended: true` is the recommended option to ensure correct parsing of form data.

