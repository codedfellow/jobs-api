require('dotenv').config();
require('express-async-errors');

//security packages
const helmet = require('helmet')
const cors = require('cors')
const xss = require('xss-clean')
const rateLimitMod = require('express-rate-limit')

//swagger
const swaggerUI = require('swagger-ui-express')
const YAML = require('yamljs')

const swaggerDocument = YAML.load('./swagger.yaml')

const express = require('express');
const app = express();

//connect db
const connectDb = require('./db/connect')

app.get('/', (req, res) => {
  res.send('<h3>jobs API <a href="/api-doc">Documentation</a> </h3>')
})

app.use('/api-doc', swaggerUI.serve, swaggerUI.setup(swaggerDocument))

//ROUTERS
const authRouter = require('./routes/auth')
const jobsRouter = require('./routes/jobs')

// error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');
const authMiddleware = require('./middleware/authentication')
const { decodeBase64 } = require('bcryptjs');

app.set('trust proxy', 1)
app.use(
  rateLimitMod({
    windowMs: 15 * 60 * 1000,
    max: 100
  })
)

app.use(express.json());
app.use(helmet())
app.use(cors())
app.use(xss())

// extra packages

// routes
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/jobs', authMiddleware, jobsRouter)

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDb(process.env.MONGO_URI)
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
