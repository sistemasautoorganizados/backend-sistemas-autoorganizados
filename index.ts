import express, { Request, Response } from 'express';
import { readJson, writeJson } from 'fs-extra';
import path from 'path';
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
  console.log("Ruta raíz / fue accedida");
  res.send('Proyecto backend Linktic');
});

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Obtener lista de productos
 *     responses:
 *       200:
 *         description: Lista de productos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 */
app.get('/products', async (req: Request, res: Response) => {
  try {
    console.log("Ruta /products fue accedida");
    const filePath = path.join(__dirname, './products.json');
    console.log(`Leyendo archivo de: ${filePath}`);
    const data = await readJson(filePath);
    console.log("Datos leídos de products.json:", data);
    res.json(data);
  } catch (error) {
    console.error("Error al leer la base de datos:", error);
    res.status(500).send('Error al leer la base de datos');
  }
});

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Obtener un producto por idProduct
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Producto encontrado
 *       404:
 *         description: Producto no encontrado
 */
app.get('/products/:id', async (req: Request, res: Response) => {
  const idProduct = parseInt(req.params.id);
  try {
    console.log(`Ruta /products/${idProduct} fue accedida`);
    const filePath = path.join(__dirname, './products.json');
    console.log(`Leyendo archivo de: ${filePath}`);
    const data = await readJson(filePath);
    const product = data.find((p: any) => p.idProduct === idProduct);

    if (product) {
      console.log(`Producto encontrado: ${JSON.stringify(product)}`);
      res.json(product);
    } else {
      console.log(`Producto con idProduct ${idProduct} no encontrado`);
      res.status(404).send('Producto no encontrado');
    }
  } catch (error) {
    console.error("Error al leer la base de datos:", error);
    res.status(500).send('Error al leer la base de datos');
  }
});

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Crear un nuevo producto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Producto creado
 */
app.post('/products', async (req: Request, res: Response) => {
  try {
    const newProduct = req.body;
    console.log("Nuevo producto recibido:", newProduct);

    const filePath = path.join(__dirname, './products.json');
    const data = await readJson(filePath);

    // Asignar un nuevo ID
    const newId = data.length > 0 ? data[data.length - 1].idProduct + 1 : 1;
    newProduct.idProduct = newId;

    data.push(newProduct);
    await writeJson(filePath, data);
    
    console.log("Producto agregado:", newProduct);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error al agregar el producto:", error);
    res.status(500).send('Error al agregar el producto');
  }
});

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Actualizar un producto por idProduct
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del producto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Producto actualizado
 *       404:
 *         description: Producto no encontrado
 */
app.put('/products/:id', async (req: Request, res: Response) => {
  const idProduct = parseInt(req.params.id);
  const updatedProduct = req.body;
  try {
    console.log(`Ruta PUT /products/${idProduct} fue accedida`);
    const filePath = path.join(__dirname, './products.json');
    console.log(`Leyendo archivo de: ${filePath}`);
    const data = await readJson(filePath);
    const index = data.findIndex((p: any) => p.idProduct === idProduct);

    if (index !== -1) {
      // Actualizar el producto en la lista
      data[index] = { ...data[index], ...updatedProduct };
      await writeJson(filePath, data);
      
      console.log(`Producto actualizado: ${JSON.stringify(data[index])}`);
      res.json(data[index]);
    } else {
      console.log(`Producto con idProduct ${idProduct} no encontrado`);
      res.status(404).send('Producto no encontrado');
    }
  } catch (error) {
    console.error("Error al actualizar el producto:", error);
    res.status(500).send('Error al actualizar el producto');
  }
});

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Eliminar un producto por idProduct
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del producto
 *     responses:
 *       204:
 *         description: Producto eliminado
 *       404:
 *         description: Producto no encontrado
 */
app.delete('/products/:id', async (req: Request, res: Response) => {
  const idProduct = parseInt(req.params.id);
  try {
    console.log(`Ruta DELETE /products/${idProduct} fue accedida`);
    const filePath = path.join(__dirname, './products.json');
    console.log(`Leyendo archivo de: ${filePath}`);
    let data = await readJson(filePath);
    const initialLength = data.length;
    data = data.filter((p: any) => p.idProduct !== idProduct);

    if (data.length < initialLength) {
      await writeJson(filePath, data);
      console.log(`Producto con idProduct ${idProduct} eliminado`);
      res.status(204).send();
    } else {
      console.log(`Producto con idProduct ${idProduct} no encontrado`);
      res.status(404).send('Producto no encontrado');
    }
  } catch (error) {
    console.error("Error al eliminar el producto:", error);
    res.status(500).send('Error al eliminar el producto');
  }
});

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Obtener lista de pedidos
 *     responses:
 *       200:
 *         description: Lista de pedidos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 */
app.get('/orders', async (req: Request, res: Response) => {
  try {
    const filePath = path.join(__dirname, './orders.json');
    const data = await readJson(filePath);
    res.json(data);
  } catch (error) {
    errorHandler(res, 500, 'Error al leer la base de datos de pedidos');
  }
});

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Obtener un pedido por order_id
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del pedido
 *     responses:
 *       200:
 *         description: Pedido encontrado
 *       404:
 *         description: Pedido no encontrado
 */
app.get('/orders/:id', async (req: Request, res: Response) => {
  const orderId = parseInt(req.params.id);
  try {
    const filePath = path.join(__dirname, './orders.json');
    const data = await readJson(filePath);
    const order = data.find((o: any) => o.order_id === orderId);

    if (order) {
      res.json(order);
    } else {
      res.status(404).send('Pedido no encontrado');
    }
  } catch (error) {
    errorHandler(res, 500, 'Error al leer la base de datos de pedidos');
  }
});

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Crear un nuevo pedido
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Pedido creado
 */
app.post('/orders', async (req: Request, res: Response) => {
  try {
    const newOrder = req.body;
    const filePath = path.join(__dirname, './orders.json');
    const data = await readJson(filePath);

    // Asignar un nuevo ID de pedido
    const newOrderId = data.length > 0 ? data[data.length - 1].order_id + 1 : 1;
    newOrder.order_id = newOrderId;
    newOrder.order_date = new Date();

    data.push(newOrder);
    await writeJson(filePath, data);
    
    res.status(201).json(newOrder);
  } catch (error) {
    errorHandler(res, 500, 'Error al agregar el pedido');
  }
});

/**
 * @swagger
 * /orders/{id}:
 *   put:
 *     summary: Actualizar un pedido por order_id
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del pedido
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Pedido actualizado
 *       404:
 *         description: Pedido no encontrado
 */
app.put('/orders/:id', async (req: Request, res: Response) => {
  const orderId = parseInt(req.params.id);
  const updatedOrder = req.body;
  try {
    const filePath = path.join(__dirname, './orders.json');
    const data = await readJson(filePath);
    const index = data.findIndex((o: any) => o.order_id === orderId);

    if (index !== -1) {
      data[index] = { ...data[index], ...updatedOrder };
      await writeJson(filePath, data);
      
      res.json(data[index]);
    } else {
      res.status(404).send('Pedido no encontrado');
    }
  } catch (error) {
    errorHandler(res, 500, 'Error al actualizar el pedido');
  }
});

/**
 * @swagger
 * /orders/{id}:
 *   delete:
 *     summary: Eliminar un pedido por order_id
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del pedido
 *     responses:
 *       204:
 *         description: Pedido eliminado
 *       404:
 *         description: Pedido no encontrado
 */
app.delete('/orders/:id', async (req: Request, res: Response) => {
  const orderId = parseInt(req.params.id);
  try {
    const filePath = path.join(__dirname, './orders.json');
    let data = await readJson(filePath);
    const initialLength = data.length;
    data = data.filter((o: any) => o.order_id !== orderId);

    if (data.length < initialLength) {
      await writeJson(filePath, data);
      res.status(204).send();
    } else {
      res.status(404).send('Pedido no encontrado');
    }
  } catch (error) {
    errorHandler(res, 500, 'Error al eliminar el pedido');
  }
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
    const filePath = path.join(__dirname, './usersIntoPage.json');
    const data = await readJson(filePath);
    res.json(data);
  } catch (error) {
    errorHandler(res, 500, 'Error al leer la base de datos de usuarios');
  }
});

/**
 * @swagger
 * /usersIntoPage/{id}:
 *   get:
 *     summary: Obtener un usuario por idUserGetIntoPage
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
  const idUserGetIntoPage = req.params.id;
  try {
    const filePath = path.join(__dirname, './usersIntoPage.json');
    const data = await readJson(filePath);
    const user = data.find((u: any) => u.idUserGetIntoPage === idUserGetIntoPage);

    if (user) {
      res.json(user);
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
 *     responses:
 *       201:
 *         description: Usuario creado
 */
app.post('/usersIntoPage', async (req: Request, res: Response) => {
  try {
    const newUser = req.body;
    
    const filePath = path.join(__dirname, './usersIntoPage.json')
    const data = await readJson(filePath)

    const rl1 = String.fromCharCode(65 + Math.floor(Math.random() * 26))
    const rl2 = String.fromCharCode(65 + Math.floor(Math.random() * 26))
    const rl3 = String.fromCharCode(65 + Math.floor(Math.random() * 26))
    const rl4 = String.fromCharCode(65 + Math.floor(Math.random() * 26))

    // Asignar un nuevo ID único
    newUser.idUserGetIntoPage = rl1+rl2+rl3+rl4+(Date.now()).toString()

    // Fecha
    const currentDate = new Date()
    const formattedDate = currentDate.toISOString().split('T')[0]
    newUser.dateGetIntoPage = formattedDate

    // Hora
    const hours = String(currentDate.getHours()).padStart(2, '0')
    const minutes = String(currentDate.getMinutes()).padStart(2, '0')
    newUser.hourGetIntoPage = `${hours}:${minutes}`

    // Time
    const rh = String(Math.floor(Math.random() * 2)).padStart(2, '0')
    const rm = String(Math.floor(Math.random() * 25)).padStart(2, '0')
    const rs = String(Math.floor(Math.random() * 61)).padStart(2, '0')

    newUser.timeIntoPage = `${rh}:${rm}:${rs}`

    data.push(newUser)
    await writeJson(filePath, data)
    
    res.status(201).json(newUser)
  } catch (error) {
    errorHandler(res, 500, 'Error al agregar el usuario')
  }
})

/**
 * @swagger
 * /usersIntoPage/{id}:
 *   put:
 *     summary: Actualizar un usuario por idUserGetIntoPage
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
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *       404:
 *         description: Usuario no encontrado
 */
app.put('/usersIntoPage/:id', async (req: Request, res: Response) => {
  const idUserGetIntoPage = req.params.id;
  const updatedUser = req.body;
  try {
    const filePath = path.join(__dirname, './usersIntoPage.json');
    const data = await readJson(filePath);
    const index = data.findIndex((u: any) => u.idUserGetIntoPage === idUserGetIntoPage);

    if (index !== -1) {
      data[index] = { ...data[index], ...updatedUser };
      await writeJson(filePath, data);
      
      res.json(data[index]);
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
 *     summary: Eliminar un usuario por idUserGetIntoPage
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
  const idUserGetIntoPage = req.params.id;
  try {
    const filePath = path.join(__dirname, './usersIntoPage.json');
    let data = await readJson(filePath);
    const initialLength = data.length;
    data = data.filter((u: any) => u.idUserGetIntoPage !== String(idUserGetIntoPage));

    if (data.length < initialLength) {
      await writeJson(filePath, data);
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
