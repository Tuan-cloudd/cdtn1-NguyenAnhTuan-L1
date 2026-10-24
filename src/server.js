require('dotenv').config();

const app = require('./app');
const migrate = require('./database/migrate');

const port = Number(process.env.PORT || 3000);

async function startServer() {
  await migrate();
  app.listen(port, () => {
    console.log(`Track SE API listening on http://localhost:${port}`);
  });
}

startServer().catch((error) => {
  console.error('Unable to start server:', error);
  process.exit(1);
});
