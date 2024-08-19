import express, { Request, Response } from 'express';
import { query } from './db';
import bodyParser from 'body-parser';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
const cors = require('cors');
const app = express();
const port = 3000;

// Configuración de Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Ejemplo',
      version: '1.0.0',
      description: 'Esta es una API de ejemplo documentada con Swagger.'
    },
    servers: [
      {
        url: `http://localhost:${port}`
      }
    ]
  },
  apis: ['./index.ts'], // Ajusta esto según la ubicación de tu archivo
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Habilitar CORS para todas las rutas
app.use(cors());

// Middleware para parsear el cuerpo de las solicitudes
app.use(bodyParser.json());

// Función auxiliar para manejar errores
const errorHandler = (res: Response, statusCode: number, message: string) => {
  console.error(message);
  res.status(statusCode).send(message);
};

/**
 * @swagger
 * /:
 *   get:
 *     summary: Ruta raíz
 *     responses:
 *       200:
 *         description: Respuesta exitosa
 */
app.get('/', (req: Request, res: Response) => {
  res.send('Proyecto backend Sistemas Autoorganizados');
});

/**
 * @swagger
 * /usersIntoPage:
 *   get:
 *     summary: Obtener lista de usuarios que ingresaron a la página
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 */
app.get('/usersIntoPage', async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM user_data');
    res.json(result);
  } catch (error) {
    errorHandler(res, 500, 'Error al leer la base de datos de usuarios');
  }
});

/**
 * @swagger
 * /usersIntoPage/{id}:
 *   get:
 *     summary: Obtener un usuario por user_id
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       404:
 *         description: Usuario no encontrado
 */
app.get('/usersIntoPage/:id', async (req: Request, res: Response) => {
  const userId = req.params.id;
  try {
    const result = await query('SELECT * FROM user_data WHERE user_id = $1', [userId]);
    if (result.length > 0) {
      res.json(result[0]);
    } else {
      res.status(404).send('Usuario no encontrado');
    }
  } catch (error) {
    errorHandler(res, 500, 'Error al leer la base de datos de usuarios');
  }
});

/**
 * @swagger
 * /usersIntoPage:
 *   post:
 *     summary: Crear un nuevo usuario que ingresó a la página
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               device:
 *                 type: string
 *               path:
 *                 type: string
 *               country:
 *                 type: string
 *               city:
 *                 type: string
 *             required:
 *               - device
 *               - path
 *               - country
 *               - city
 *     responses:
 *       201:
 *         description: Usuario creado
 */
app.post('/usersIntoPage', async (req: Request, res: Response) => {
  try {
    const { device, path, country, city } = req.body;

    if (!device || !path || !country || !city) {
      return res.status(400).send('Faltan campos obligatorios');
    }

    // Generar ID y datos de tiempo
    const userId = String.fromCharCode(65 + Math.floor(Math.random() * 26))
                  + String.fromCharCode(65 + Math.floor(Math.random() * 26))
                  + String.fromCharCode(65 + Math.floor(Math.random() * 26))
                  + String.fromCharCode(65 + Math.floor(Math.random() * 26))
                  + (Date.now()).toString();

    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0];
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const time = `${hours}:${minutes}`;

    const biasedRandom = () => {
      const random = Math.floor(Math.random() * 100);
      if (random <= 88) {
        return '00'; // `00` tiene una mayor probabilidad de ser elegido
      } else if (random > 88 && random <= 96) {
        return '01';
      } else {
        return '02';
      }
    };

    const rh = biasedRandom();
    const rm = String(Math.floor(Math.random() * 25)).padStart(2, '0');
    const rs = String(Math.floor(Math.random() * 61)).padStart(2, '0');
    const duration = `${rh}:${rm}:${rs}`;

    // Inserta el nuevo usuario en la base de datos
    await query(
      'INSERT INTO user_data (user_id, date, time, duration, country, city, path, device) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [userId, formattedDate, time, duration, country, city, path, device]
    );

    // Enviar la respuesta con los datos del nuevo usuario
    res.status(201).json({
      user_id: userId,
      date: formattedDate,
      time,
      duration,
      country,
      city,
      path,
      device
    });
  } catch (error) {
    errorHandler(res, 500, 'Error al agregar el usuario');
    console.log(error);
  }
});

/**
 * @swagger
 * /usersIntoPage/{id}:
 *   put:
 *     summary: Actualizar un usuario por user_id
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               time:
 *                 type: string
 *               duration:
 *                 type: string
 *               country:
 *                 type: string
 *               city:
 *                 type: string
 *               path:
 *                 type: string
 *               device:
 *                 type: string
 *             required:
 *               - date
 *               - time
 *               - duration
 *               - country
 *               - city
 *               - path
 *               - device
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *       404:
 *         description: Usuario no encontrado
 */
app.put('/usersIntoPage/:id', async (req: Request, res: Response) => {
  const userId = req.params.id;
  const updatedUser = req.body;
  try {
    const result = await query('UPDATE user_data SET date = $1, time = $2, duration = $3, country = $4, city = $5, path = $6, device = $7 WHERE user_id = $8 RETURNING *', [
      updatedUser.date,
      updatedUser.time,
      updatedUser.duration,
      updatedUser.country,
      updatedUser.city,
      updatedUser.path,
      updatedUser.device,
      userId
    ]);

    if (result.length > 0) {
      res.json(result[0]);
    } else {
      res.status(404).send('Usuario no encontrado');
    }
  } catch (error) {
    errorHandler(res, 500, 'Error al actualizar el usuario');
  }
});

/**
 * @swagger
 * /usersIntoPage/{id}:
 *   delete:
 *     summary: Eliminar un usuario por user_id
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del usuario
 *     responses:
 *       204:
 *         description: Usuario eliminado
 *       404:
 *         description: Usuario no encontrado
 */
app.delete('/usersIntoPage/:id', async (req: Request, res: Response) => {
  const userId = req.params.id;
  try {
    const result = await query('DELETE FROM user_data WHERE user_id = $1 RETURNING *', [userId]);

    if (result.length > 0) {
      res.status(204).send();
    } else {
      res.status(404).send('Usuario no encontrado');
    }
  } catch (error) {
    errorHandler(res, 500, 'Error al eliminar el usuario');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
