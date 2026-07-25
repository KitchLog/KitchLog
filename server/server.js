import express from 'express'
import recipesRouter from './routes/recipes.js'
import cors from 'cors'
import dotenv from 'dotenv';

dotenv.config();

const app = express()
const PORT = process.env.PORT || 3000;

app.use(cors());
app.get("/", (req, res) => {
  res.send("KitchLog API is running!");
});
app.use(express.json());
app.use('/api/recipes', recipesRouter);

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});