const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'VirTEAI API',
      version: '1.0.0',
      description: 'Documentação da API para o projeto VirTEAI',
    },
    servers: [
      {
        url: 'https://virteai-backend-tcc.onrender.com',
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },

      schemas: {
        AnswerValue: {
          type: 'string',
          enum: [
            'strongly_agree',
            'agree',
            'neutral',
            'disagree',
            'strongly_disagree',
          ],
        },

        SubmitTest10: {
          type: 'object',
          required: ['answers'],
          properties: {
            answers: {
              type: 'object',
              description:
                'Mapa onde a chave é o número da questão (1–10) e o valor é a resposta',
              additionalProperties: {
                $ref: '#/components/schemas/AnswerValue',
              },
              example: {
                "1": "agree",
                "2": "disagree",
                "3": "neutral",
                "4": "strongly_agree",
                "5": "agree",
                "6": "disagree",
                "7": "agree",
                "8": "neutral",
                "9": "disagree",
                "10": "strongly_agree",
              },
              minProperties: 10,
              maxProperties: 10,
            },
          },
        },

        SubmitTest50: {
          type: 'object',
          required: ['answers'],
          properties: {
            answers: {
              type: 'object',
              description:
                'Mapa onde a chave é o número da questão (1–50) e o valor é a resposta',
              additionalProperties: {
                $ref: '#/components/schemas/AnswerValue',
              },
              example: {
                "1": "agree",
                "2": "disagree",
                "3": "neutral",
                "4": "strongly_agree",
                "5": "agree",
                "6": "disagree",
                "7": "agree",
                "8": "neutral",
                "9": "disagree",
                "10": "strongly_agree",
                "11": "agree",
                "12": "disagree",
                "13": "neutral",
                "14": "strongly_agree",
                "15": "agree",
                "16": "disagree",
                "17": "agree",
                "18": "neutral",
                "19": "disagree",
                "20": "strongly_agree",
                "21": "agree",
                "22": "disagree",
                "23": "neutral",
                "24": "strongly_agree",
                "25": "agree",
                "26": "disagree",
                "27": "agree",
                "28": "neutral",
                "29": "disagree",
                "30": "strongly_agree",
                "31": "agree",
                "32": "disagree",
                "33": "neutral",
                "34": "strongly_agree",
                "35": "agree",
                "36": "disagree",
                "37": "agree",
                "38": "neutral",
                "39": "disagree",
                "40": "strongly_agree",
                "41": "agree",
                "42": "disagree",
                "43": "neutral",
                "44": "strongly_agree",
                "45": "agree",
                "46": "disagree",
                "47": "agree",
                "48": "neutral",
                "49": "disagree",
                "50": "strongly_agree",
              },
              minProperties: 50,
              maxProperties: 50,
            },
          },
        },
      },
    },
  },

  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  swaggerSpec,
};