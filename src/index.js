import 'dotenv/config';
import express from 'express';
import connectDb from './utils/connectDb.js';

import swaggerUi from 'swagger-ui-express';
import swaggerFile from './utils/swagger-output.json' assert { type: 'json' };

import notificationRouter from './routes/notification.routes.js';
import surveyRouter from './routes/survey.routes.js';
import userRouter from './routes/user.routes.js';

connectDb();

const app = express();
const port = process.env.PORT;

app.use(express.json());

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));
app.use('/surveys', surveyRouter);
app.use('/users', userRouter);
app.use('/notifications', notificationRouter);

app.listen(port, () => {
  console.log(`App started under port ${port}`);
});
