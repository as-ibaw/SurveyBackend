import Response from '../models/response.models.js';
import Survey from '../models/survey.models.js';
import { createNotification } from './notification.service.js';

export const getSurveys = async (skip = 0, limit = 10) => {
  try {
    return Survey.find().skip(skip).limit(limit);
  } catch (error) {
    console.error('Fehler beim Abrufen der Umfragen:', error);
  }
};

export const getSurvey = async (id) => {
  try {
    return Survey.findById(id);
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
    const newResponse = await Response.create({
      surveyId,
      responses,
    });

    await createNotification(surveyId);

    return newResponse;
  } catch (error) {
    console.error('Fehler beim Erstellen der Antwort:', error);
  }
};

export const getSurveyResult = async (surveyId) => {
  try {
    const survey = await Survey.findById(surveyId).lean();
    if (!survey) {
      throw new Error('Survey not found');
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
      };

      switch (question.type) {
        case 'checkbox':
        case 'toggle':
          stat.answers = questionResponses.reduce((acc, { answer }) => {
            acc[answer] = (acc[answer] || 0) + 1;
            return acc;
          }, {});
          break;
        case 'multipleChoice':
          let optionCounts = question.options.reduce((acc, option) => {
            acc[option] = 0;
            return acc;
          }, {});

          questionResponses.forEach((response) => {
            if (response && optionCounts.hasOwnProperty(response.answer)) {
              optionCounts[response.answer] += 1;
            }
          });

          stat.answers = optionCounts;
          break;
        case 'selection':
          stat.answers = questionResponses.reduce((acc, { answer }) => {
            answer.forEach((ans) => {
              acc[ans] = (acc[ans] || 0) + 1;
            });
            return acc;
          }, {});
          break;
        case 'stars':
          const totalStars = questionResponses.reduce(
            (total, { answer }) => total + answer,
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

    const activeSurveys = await Survey.countDocuments({ active: true });

    const completedSurveys = await Survey.countDocuments({ active: false });

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
