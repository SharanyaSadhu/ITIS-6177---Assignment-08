const express = require('express');
const bodyParser = require('body-parser');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { body, validationResult } = require('express-validator');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

let data = [
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' },
];

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sample API',
      version: '1.0.0',
      description: 'A simple API with Swagger documentation',
    },
  },
  apis: ['server.js'],
};
const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

/**
 * @swagger
 * components:
 *   schemas:
 *     Item:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: Item 1
 */

/**
 * @swagger
 * /items:
 *   post:
 *     summary: Create a new item
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Item'
 *     responses:
 *       201:
 *         description: Item created successfully
 */
app.post('/items',
  [
    body('name').notEmpty().isString().trim().escape(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const newItem = {
      id: data.length + 1,
      name: req.body.name,
    };

    data.push(newItem);
    res.status(201).json(newItem);
  }
);

/**
 * @swagger
 * /items/{id}:
 *   patch:
 *     summary: Update an item partially
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Item'
 *     responses:
 *       200:
 *         description: Item updated successfully
 */
app.patch('/items/:id',
  [
    body('name').optional().isString().trim().escape(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const itemId = parseInt(req.params.id);
    const updatedItem = req.body;

    data = data.map(item => (item.id === itemId ? { ...item, ...updatedItem } : item));

    res.json({ message: 'Item updated successfully' });
  }
);

/**
 * @swagger
 * /items/{id}:
 *   put:
 *     summary: Update an item completely
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Item'
 *     responses:
 *       200:
 *         description: Item updated successfully
 */
app.put('/items/:id',
  [
    body('name').notEmpty().isString().trim().escape(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const itemId = parseInt(req.params.id);
    const updatedItem = {
      id: itemId,
      name: req.body.name,
    };
    data = data.map(item => (item.id === itemId ? updatedItem : item));
    res.json({ message: 'Item updated successfully' });
  }
);

/**
 * @swagger
 * /items/{id}:
 *   delete:
 *     summary: Delete an item
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Item deleted successfully
 */
app.delete('/items/:id', (req, res) => {
  const itemId = parseInt(req.params.id);
  data = data.filter(item => item.id !== itemId);
  res.json({ message: 'Item deleted successfully' });
});

/**
 * @swagger
 * /items:
 *   get:
 *     summary: Get all items
 *     responses:
 *       200:
 *         description: List of items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Item'
 */
app.get('/items', (req, res) => {
  res.json(data);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
