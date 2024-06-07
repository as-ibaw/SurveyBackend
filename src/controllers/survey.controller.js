import mongoose from 'mongoose';

import {
  createResponse,
  createSurvey,
  getPublicSurvey,
  getSurvey,
  getSurveyResult,
  getSurveyStatistics,
  getSurveys,
  removeSurvey,
  updateSurvey,
} from '../services/survey.service.js';

import Response from '../models/response.models.js';
import Survey from '../models/survey.models.js';

export const get = async (req, res, next) => {
  try {
    // #swagger.tags = ['Survey']
    // #swagger.description = 'Endpoint to get a survey by ID'
    // #swagger.parameters['id'] = { in: 'path', description: 'Survey ID', required: true, type: 'string' }
    // #swagger.responses[200] = { description: 'OK' }
    // #swagger.responses[404] = { description: 'Not Found' }
    // #swagger.responses[500] = { description: 'Internal Server Error' }
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).send({ message: 'Umfrage nicht gefunden.' });
    }

    const survey = await getSurvey(req.params.id);
    if (!survey) {
      return res.status(404).send({ message: 'Umfrage nicht gefunden.' });
    }
    res.status(200).send(survey);
  } catch (err) {
    console.error(err);
    res.status(500).send({
      message:
        'Ein Fehler ist aufgetreten beim Versuch, die Umfrage abzurufen.',
    });
    next(err);
  }
};

export const getPublic = async (req, res, next) => {
  try {
    // #swagger.tags = ['Survey']
    // #swagger.description = 'Endpoint to get a public survey by ID'
    // #swagger.parameters['id'] = { in: 'path', description: 'Public Survey ID', required: true, type: 'string' }
    // #swagger.responses[200] = { description: 'OK' }
    // #swagger.responses[404] = { description: 'Not Found' }
    // #swagger.responses[500] = { description: 'Internal Server Error' }
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).send({ message: 'Umfrage nicht gefunden.' });
    }

    const survey = await getPublicSurvey(req.params.id);
    if (!survey) {
      return res.status(404).send({ message: 'Umfrage nicht gefunden.' });
    }
    res.status(200).send(survey);
  } catch (err) {
    console.error(err);
    res.status(500).send({
      message:
        'Ein Fehler ist aufgetreten beim Versuch, die Umfrage abzurufen.',
    });
    next(err);
  }
};

export const list = async (req, res) => {
  // #swagger.tags = ['Survey']
  // #swagger.description = 'Endpoint to list surveys'
  // #swagger.parameters['page'] = { in: 'query', description: 'Page number', type: 'string' }
  // #swagger.parameters['limit'] = { in: 'query', description: 'Limit of surveys per page', type: 'string' }
  // #swagger.responses[200] = { description: 'OK' }
  // #swagger.responses[500] = { description: 'Internal Server Error' }
  const page = parseInt(req.query.page) || 1;
  const maxLimit = 100;
  const limit = Math.min(parseInt(req.query.limit) || 10, maxLimit);
  const skip = (page - 1) * limit;
  const status = req.query.status;

  try {
    const surveys = await getSurveys(skip, limit, status);
    const total = await Survey.countDocuments(status ? { status } : {});
    const totalPages = Math.ceil(total / limit);

    const surveyIds = surveys.map((survey) => survey._id);

    const responseCounts = await Response.aggregate([
      { $match: { surveyId: { $in: surveyIds } } },
      { $group: { _id: '$surveyId', count: { $sum: 1 } } },
    ]);

    const responseCountMap = responseCounts.reduce((map, item) => {
      map[item._id] = item.count;
      return map;
    }, {});

    const surveysWithCounts = surveys.map((survey) => ({
      _id: survey._id,
      title: survey.title,
      createdAt: survey.createdAt,
      createdBy: survey.createdBy,
      expirationDate: survey.expirationDate,
      status: survey.status,
      responseCount: responseCountMap[survey._id] || 0,
    }));

    res.status(200).send({
      data: surveysWithCounts,
      page,
      limit,
      total,
      totalPages,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({
      message:
        'Ein Fehler ist aufgetreten beim Versuch, die Umfragen abzurufen.',
    });
  }
};

export const create = async (req, res, next) => {
  // #swagger.tags = ['Survey']
  // #swagger.description = 'Endpoint to create a new survey'
  /*  #swagger.parameters['survey'] = {
        in: 'body',
        description: 'Survey details',
        required: true,
        schema: {
          type: 'object',
          required: ['title', 'createdBy', 'questions', 'expirationDate'],
          properties: {
            title: { type: 'string', example: 'Survey Title' },
            description: { type: 'string', example: 'Survey Description' },
            questions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  questionText: { type: 'string', example: 'What is your name?' },
                  type: { type: 'string', enum: ['textInput', 'numberInput', 'checkbox', 'toggle', 'multipleChoice', 'radio', 'stars'], example: 'textInput' },
                  options: {
                    type: 'array',
                    items: { type: 'string', example: 'Option 1' }
                  },
                  order: { type: 'number', example: 1 },
                  required: { type: 'boolean', example: true }
                },
                example: {
                  questionText: "What is your name?",
                  type: "textInput",
                  options: [],
                  order: 1,
                  required: true
                }
              }
            },
            expirationDate: { type: 'string', format: 'date-time', example: '2023-12-31T23:59:59Z' },
            createdBy: { type: 'string', example: '60d0fe4f5311236168a109ca' }
          },
          example: {
            title: "Survey Title",
            description: "Survey Description",
            questions: [
              {
                questionText: "What is your name?",
                type: "textInput",
                options: [],
                order: 1,
                required: true
              },
              {
                questionText: "How old are you?",
                type: "numberInput",
                options: [],
                order: 2,
                required: false
              },
              {
                questionText: "What are your favorite colors?",
                type: "checkbox",
                options: ["Red", "Green", "Blue"],
                order: 3,
                required: true
              }
            ],
            expirationDate: "2023-12-31T23:59:59Z",
            createdBy: "60d0fe4f5311236168a109ca"
          }
        }
      }*/
  // #swagger.responses[201] = { description: 'Created' }
  // #swagger.responses[400] = { description: 'Bad Request' }
  // #swagger.responses[500] = { description: 'Internal Server Error' }
  try {
    const survey = await createSurvey(req.body);
    res.status(201).send(survey);
  } catch (err) {
    console.error(err);
    res.status(500).send({
      message: 'Ein Fehler ist beim Erstellen der Umfrage aufgetreten.',
    });
    next(err);
  }
};

export const update = async (req, res, next) => {
  // #swagger.tags = ['Survey']
  // #swagger.description = 'Endpoint to update a survey by ID'
  // #swagger.parameters['id'] = { in: 'path', description: 'Survey ID', required: true, type: 'string' }
  /* #swagger.parameters['survey'] = {
       in: 'body',
       description: 'Survey details',
       required: true,
       schema: {
         type: 'object',
         required: ['title', 'createdBy', 'questions', 'expirationDate'],
         properties: {
           title: { type: 'string', example: 'Updated Survey Title' },
           description: { type: 'string', example: 'Updated Survey Description' },
           questions: {
             type: 'array',
             items: {
               type: 'object',
               properties: {
                 questionText: { type: 'string', example: 'What is your age?' },
                 type: { type: 'string', enum: ['textInput', 'numberInput', 'checkbox', 'toggle', 'multipleChoice', 'radio', 'stars'], example: 'numberInput' },
                 options: {
                   type: 'array',
                   items: { type: 'string', example: 'Option A' }
                 },
                 order: { type: 'number', example: 1 },
                 required: { type: 'boolean', example: true }
               },
               example: {
                 questionText: "What is your age?",
                 type: "numberInput",
                 options: [],
                 order: 1,
                 required: true
               }
             }
           },
           expirationDate: { type: 'string', format: 'date-time', example: '2023-12-31T23:59:59Z' },
           createdBy: { type: 'string', example: '60d0fe4f5311236168a109ca' }
         },
         example: {
           title: "Updated Survey Title",
           description: "Updated Survey Description",
           questions: [
             {
               questionText: "What is your age?",
               type: "numberInput",
               options: [],
               order: 1,
               required: true
             },
             {
               questionText: "What is your favorite hobby?",
               type: "textInput",
               options: [],
               order: 2,
               required: false
             }
           ],
           expirationDate: "2023-12-31T23:59:59Z",
           createdBy: "60d0fe4f5311236168a109ca"
         }
       }
     }*/
  // #swagger.responses[200] = { description: 'OK' }
  // #swagger.responses[400] = { description: 'Bad Request' }
  // #swagger.responses[404] = { description: 'Not Found' }
  // #swagger.responses[500] = { description: 'Internal Server Error' }
  try {
    const result = await updateSurvey(req.params.id, req.body);
    if (!result) {
      return res.status(404).send({ message: 'Umfrage nicht gefunden.' });
    }
    res.status(200).send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({
      message: 'Ein Fehler ist beim Aktualisieren der Umfrage aufgetreten.',
    });
    next(err);
  }
};

export const remove = async (req, res, next) => {
  // #swagger.tags = ['Survey']
  // #swagger.description = 'Endpoint to delete a survey by ID'
  // #swagger.parameters['id'] = { in: 'path', description: 'Survey ID', required: true, type: 'string' }
  // #swagger.responses[204] = { description: 'No Content' }
  // #swagger.responses[404] = { description: 'Not Found' }
  // #swagger.responses[500] = { description: 'Internal Server Error' }
  try {
    const result = await removeSurvey(req.params.id);
    if (!result) {
      return res.status(404).send({ message: 'Umfrage nicht gefunden.' });
    }
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      message: 'Ein Fehler ist beim Löschen der Umfrage aufgetreten.',
    });
    next(err);
  }
};

export const response = async (req, res, next) => {
  // #swagger.tags = ['Survey']
  // #swagger.description = 'Endpoint to save a survey response'
  // #swagger.parameters['id'] = { in: 'path', description: 'Survey ID', required: true, type: 'string' }
  /* #swagger.parameters['response'] = {
       in: 'body',
       description: 'Survey response details',
       required: true,
       schema: {
         type: 'object',
         properties: {
           responses: {
             type: 'array',
             items: {
               type: 'object',
               properties: {
                 questionId: { type: 'string', example: '60d0fe4f5311236168a109cd' },
                 answer: { type: 'string', example: 'Sample Answer' }
               }
             }
           }
         }
       }
     } */
  // #swagger.responses[201] = { description: 'Created' }
  // #swagger.responses[500] = { description: 'Internal Server Error' }
  try {
    const savedResponse = await createResponse(
      req.params.id,
      req.body.responses
    );
    res.status(201).send(savedResponse);
  } catch (err) {
    console.error(err);
    res.status(500).send({
      message: 'Ein Fehler ist beim Speichern der Antwort aufgetreten.',
    });
    next(err);
  }
};

export const getResult = async (req, res, next) => {
  // #swagger.tags = ['Survey']
  // #swagger.description = 'Endpoint to get the result of a survey by ID'
  // #swagger.parameters['id'] = { in: 'path', description: 'Survey ID', required: true, type: 'string' }
  // #swagger.responses[200] = { description: 'OK' }
  // #swagger.responses[500] = { description: 'Internal Server Error' }
  try {
    const stats = await getSurveyResult(req.params.id);
    if (!stats) {
      return res.status(404).send({ message: 'Umfrage nicht gefunden.' });
    }
    res.status(200).send(stats);
  } catch (err) {
    console.error(err);
    res.status(500).send({
      message: 'Ein Fehler ist bei der Abrufung der Antworten aufgetreten.',
    });
    next(err);
  }
};

export const listStats = async (req, res, next) => {
  // #swagger.tags = ['Survey']
  // #swagger.description = 'Endpoint to get survey statistics'
  // #swagger.responses[200] = { description: 'OK' }
  // #swagger.responses[500] = { description: 'Internal Server Error' }
  try {
    const result = await getSurveyStatistics();
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({
      message:
        'Ein Fehler ist bei der Generierung der Statistiken aufgetreten.',
    });
  }
};
