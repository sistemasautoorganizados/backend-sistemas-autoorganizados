import express, { Request, Response } from 'express';

const app = express();
const PORT = 3000;

// Middleware para parsear JSON
app.use(express.json());

// Ruta principal
app.get('/', (_req: Request, res: Response) => {
  res.send('¡Hola Mundo!');
});
// Ruta principal
app.get('/ping', (_req: Request, res: Response) => {
    res.send('Pong!');
  });

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});