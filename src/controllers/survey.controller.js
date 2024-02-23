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

import Survey from '../models/survey.models.js';

export const get = async (req, res, next) => {
  // #swagger.tags = ['Survey']
  try {
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
  // #swagger.tags = ['Survey']
  try {
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
  const page = parseInt(req.query.page) || 1;
  const maxLimit = 100;
  const limit = Math.min(parseInt(req.query.limit) || 10, maxLimit);
  const skip = (page - 1) * limit;

  try {
    const surveys = await getSurveys(skip, limit);
    const total = await Survey.countDocuments();
    const totalPages = Math.ceil(total / limit);

    res.status(200).send({
      data: surveys,
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
  try {
    const stats = await getSurveyResult(req.params.id);
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
