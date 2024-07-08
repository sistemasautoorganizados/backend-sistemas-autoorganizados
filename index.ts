import express, { Request, Response } from 'express';
import { readJson, writeJson } from 'fs-extra';
import path from 'path';
import bodyParser from 'body-parser';

const app = express();
const port = 3000;

// Middleware para parsear el cuerpo de las solicitudes
app.use(bodyParser.json());

// Función auxiliar para manejar errores
const errorHandler = (res: Response, statusCode: number, message: string) => {
  console.error(message);
  res.status(statusCode).send(message);
};

app.get('/', (req: Request, res: Response) => {
  console.log("Ruta raíz / fue accedida");
  res.send('Proyecto backend Linktic');
});

// Ruta para obtener la lista de productos
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

// Ruta para obtener un producto por idProduct
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

// Ruta para crear un nuevo producto
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

// Ruta para actualizar un producto por idProduct
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

// Ruta para eliminar un producto por idProduct
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



// Ruta para obtener la lista de pedidos
app.get('/orders', async (req: Request, res: Response) => {
  try {
    const filePath = path.join(__dirname, './orders.json');
    const data = await readJson(filePath);
    res.json(data);
  } catch (error) {
    errorHandler(res, 500, 'Error al leer la base de datos de pedidos');
  }
});

// Ruta para obtener un pedido por order_id
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

// Ruta para crear un nuevo pedido
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

// Ruta para actualizar un pedido por order_id
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

// Ruta para eliminar un pedido por order_id
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

// Manejador de errores para rutas no encontradas
app.use((req: Request, res: Response) => {
  res.status(404).send('Ruta no encontrada');
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
