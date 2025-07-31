import express from 'express';
import { main } from './src/main.mjs';

const app = express();
const port = 5050;

app.get('/', async (req, res) => {
  try {
    const { url,replaceURL } = req.query;
    const jsonData = await main(url,replaceURL);
    res.status(200).send(jsonData);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});


// "https://www.mollyjogger.com/collections/inventory"
// "https://www.mollyjogger.com"


// url,replaceURL