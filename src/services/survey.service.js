import Response from '../models/response.models.js';
import Survey from '../models/survey.models.js';
import { createNotification } from './notification.service.js';

const updateSurveyStatus = async (survey) => {
  const now = new Date();
  if (survey.expirationDate <= now) {
    survey.status = 'Abgeschlossen';
  } else {
    const responseCount = await Response.countDocuments({
      surveyId: survey._id,
    });
    survey.status = responseCount > 0 ? 'Aktiv' : 'Offen';
  }
  await survey.save();
};

export const getSurveys = async (skip = 0, limit = 10, status) => {
  try {
    const query = status ? { status } : {};
    const surveys = await Survey.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    for (const survey of surveys) {
      await updateSurveyStatus(survey);
    }
    return surveys;
  } catch (error) {
    console.error('Fehler beim Abrufen der Umfragen:', error);
    throw error;
  }
};

export const getSurvey = async (id) => {
  try {
    const survey = await Survey.findById(id);
    if (survey) {
      await updateSurveyStatus(survey);
    }
    return survey;
  } catch (error) {
    console.error('Fehler beim Abrufen der Umfrage:', error);
  }
};

export const getPublicSurvey = async (id) => {
  try {
    return Survey.findByIdAndUpdate(id, { $inc: { viewsCount: 1 } });
  } catch (error) {
    console.error('Fehler beim Abrufen der Public-Umfrage:', error);
  }
};

export const createSurvey = async (payload) => {
  try {
    return Survey.create(payload);
  } catch (error) {
    console.error('Fehler beim Erstellen der Umfrage:', error);
  }
};

export const updateSurvey = async (id, payload) => {
  try {
    return Survey.findByIdAndUpdate(id, payload, { new: true });
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Umfrage:', error);
  }
};

export const removeSurvey = async (id) => {
  try {
    return Survey.findByIdAndDelete(id);
  } catch (error) {
    console.error('Fehler beim Entfernen der Umfrage:', error);
  }
};

export const createResponse = async (surveyId, responses) => {
  try {
    const updatedResponses = responses.map((response) => {
      return response;
    });

    const newResponse = await Response.create({
      surveyId,
      responses: updatedResponses,
    });

    const survey = await Survey.findById(surveyId);
    if (!survey) {
      throw new Error('Umfrage nicht gefunden');
    }

    const surveyName = survey.title;
    await createNotification(surveyId, surveyName);

    return newResponse;
  } catch (error) {
    console.error('Fehler beim Erstellen der Antwort:', error);
  }
};

export const getSurveyResult = async (surveyId) => {
  try {
    const survey = await Survey.findById(surveyId).lean();
    if (!survey) {
      throw new Error('Umfrage nicht gefunden');
    }
    const responseCount = await Response.countDocuments({ surveyId });
    const viewsCount = survey.viewsCount || 0;
    const responseQuote =
      viewsCount > 0 ? (responseCount / viewsCount) * 100 : 0;

    let stats = {
      viewsCount,
      responseCount,
      responseQuote,
      questionStats: [],
    };

    const responses = await Response.find({ surveyId }).lean();

    for (let question of survey.questions) {
      const questionResponses = responses
        .map((r) =>
          r.responses.find(
            (resp) => String(resp.questionId) === String(question._id)
          )
        )
        .filter((resp) => resp !== undefined);

      let stat = {
        questionText: question.questionText,
        type: question.type,
        answers: {},
      };

      switch (question.type) {
        case 'checkbox':
        case 'toggle':
          stat.answers = questionResponses.reduce((acc, { answer }) => {
            if (Array.isArray(answer)) {
              answer.forEach((ans) => {
                acc[ans] = (acc[ans] || 0) + 1;
              });
            } else {
              acc[answer] = (acc[answer] || 0) + 1;
            }
            return acc;
          }, {});
          break;
        case 'multipleChoice':
        case 'radio':
          let optionCounts = question.options.reduce((acc, option) => {
            acc[option] = 0;
            return acc;
          }, {});

          questionResponses.forEach(({ answer }) => {
            if (Array.isArray(answer)) {
              answer.forEach((ans) => {
                if (optionCounts.hasOwnProperty(ans)) {
                  optionCounts[ans] += 1;
                }
              });
            } else {
              if (optionCounts.hasOwnProperty(answer)) {
                optionCounts[answer] += 1;
              }
            }
          });

          stat.answers = optionCounts;
          break;
        case 'stars':
          const totalStars = questionResponses.reduce(
            (total, { answer }) => total + parseInt(answer, 10),
            0
          );
          stat.averageRating = questionResponses.length
            ? (totalStars / questionResponses.length).toFixed(2)
            : 0;
          break;
        case 'textInput':
        case 'numberInput':
          stat.answers = questionResponses.map(({ answer }) => answer);
          break;
        default:
          break;
      }

      stats.questionStats.push(stat);
    }

    return stats;
  } catch (error) {
    console.error('Fehler beim Ausgeben der Antworten', error);
  }
};

export const getSurveyStatistics = async () => {
  try {
    const totalSurveys = await Survey.countDocuments();

    const activeSurveys = await Survey.countDocuments({ status: 'Aktiv' });

    const completedSurveys = await Survey.countDocuments({
      status: 'Abgeschlossen',
    });

    const totalViews = await Survey.aggregate([
      { $group: { _id: null, totalViews: { $sum: '$viewsCount' } } },
    ]);

    const totalResponses = await Response.countDocuments();

    return {
      totalSurveys,
      activeSurveys,
      completedSurveys,
      totalViews: totalViews.length > 0 ? totalViews[0].totalViews : 0,
      totalResponses,
    };
  } catch (error) {
    console.error('Fehler beim Abrufen der Umfragestatistiken:', error);
  }
};
