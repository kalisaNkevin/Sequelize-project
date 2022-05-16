const app = require('./index');
const dotenv = require('dotenv');

dotenv.config({ path: `.env` });

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});