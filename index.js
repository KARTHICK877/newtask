const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const  userRoutes = require("./routes/userRoutes")
const app = express();
app.use(express.json());
dotenv.config();

mongoose
  .connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error(err);
  });

app.use('/',userRoutes)




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
