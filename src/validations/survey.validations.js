import { body } from 'express-validator';

export const validateSurveyCreate = [
  body('title')
    .notEmpty()
    .withMessage('Ein Titel ist erforderlich.')
    .isString()
    .withMessage('Der Titel muss ein Text sein.'),
  body('description')
    .optional()
    .isString()
    .withMessage('Die Beschreibung muss ein Text sein.'),
  body('createdBy')
    .notEmpty()
    .withMessage('Ersteller ist erforderlich.')
    .isString()
    .withMessage('Ersteller muss ein Text sein.'),
  body('questions.*.questionText')
    .notEmpty()
    .withMessage('Fragetext ist erforderlich.')
    .isString()
    .withMessage('Fragetext muss ein Text sein.'),
  body('questions.*.type')
    .notEmpty()
    .withMessage('Fragetyp ist erforderlich.')
    .isIn([
      'textInput',
      'numberInput',
      'checkbox',
      'toggle',
      'multipleChoice',
      'selection',
      'stars',
    ])
    .withMessage('Ungültiger Fragetyp.'),
  body('questions.*.options')
    .optional()
    .isArray()
    .withMessage('Optionen müssen in einem Array sein.'),
  body('questions.*.options.*')
    .optional()
    .isString()
    .withMessage('Jede Option muss ein Text sein.'),
  body('questions.*.order')
    .notEmpty()
    .withMessage('Fragenreihenfolge ist erforderlich.')
    .isInt({ min: 0 })
    .withMessage('Fragenreihenfolge muss eine positive Zahl sein.'),
];

export const validateSurveyResponse = [
  body('responses')
    .isArray()
    .withMessage('Antworten müssen in einem Array übermittelt werden.'),
  body('responses.*.questionId')
    .notEmpty()
    .withMessage('Frage-ID ist erforderlich.')
    .isMongoId()
    .withMessage('Frage-ID muss eine gültige MongoDB ObjectId sein.'),
  body('responses.*.answer')
    .notEmpty()
    .withMessage('Antwort ist erforderlich.'),
];

export const validateSurveyUpdate = [
  body('title')
    .optional()
    .isString()
    .withMessage('Der Titel muss ein Text sein.'),
  body('description')
    .optional()
    .isString()
    .withMessage('Die Beschreibung muss ein Text sein.'),
  body('active')
    .optional()
    .isBoolean()
    .withMessage('Aktivstatus muss ein Boolean sein.'),
  body('questions')
    .optional()
    .isArray()
    .withMessage('Fragen müssen in einem Array übermittelt werden.'),
  body('questions.*.questionText')
    .optional()
    .isString()
    .withMessage('Fragetext muss ein Text sein.'),
  body('questions.*.type')
    .optional()
    .isIn([
      'textInput',
      'numberInput',
      'checkbox',
      'toggle',
      'multipleChoice',
      'selection',
      'stars',
    ])
    .withMessage('Ungültiger Fragetyp.'),
  body('questions.*.options')
    .optional()
    .isArray()
    .withMessage('Optionen müssen in einem Array sein.'),
  body('questions.*.options.*')
    .optional()
    .isString()
    .withMessage('Jede Option muss ein Text sein.'),
  body('questions.*.order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Fragenreihenfolge muss eine positive Zahl sein.'),
  body('questions.*.required')
    .optional()
    .isBoolean()
    .withMessage(
      'Angabe, ob die Frage erforderlich ist, muss ein Boolean sein.'
    ),
];
