// config/database.js
require('dotenv').config();
const { Sequelize } = require('sequelize');
const fs   = require('fs');
const path = require('path');

function getSslConfig() {
  if (process.env.DB_SSL_CA_BASE64) {
    return { ssl: { ca: Buffer.from(process.env.DB_SSL_CA_BASE64, 'base64').toString('utf8') } };
  }
  const certPath = path.join(__dirname, '..', 'ca.pem');
  if (fs.existsSync(certPath)) {
    return { ssl: { ca: fs.readFileSync(certPath) } };
  }
  return {};
}

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host:           process.env.DB_HOST,
    port:           parseInt(process.env.DB_PORT) || 3306,
    dialect:        'mysql',
    logging:        false,
    dialectOptions: getSslConfig()
  }
);

sequelize.authenticate()
  .then(() => console.log('Conexion a MySQL establecida'))
  .catch(err => console.error('Error conectando:', err.message));

module.exports = sequelize;
// Middleware: carrito vacio en sesion si no existe
app.use((req, res, next) => {
  if (!req.session.cart) {
    req.session.cart = { items: [], totalQty: 0, totalPrice: 0 };
  }
  res.locals.cartItemCount = req.session.cart.totalQty || 0;
  next();
});

app.get('/', (req, res) => {
  res.send(`
    Hello World - [REEMPLAZAR POR SU NOMBRE]
    La aplicacion funciona en Render.
    Puerto: ${port} | Entorno: ${process.env.NODE_ENV || 'development'}
  `);
});
// app.use('/',         productRoutes);
app.use('/cart',     cartRoutes);
app.use('/checkout', checkoutRoutes);

app.use((req, res) => {
  res.status(404).render('404', { title: 'Pagina no encontrada' });
});

sequelize.sync()
  .then(() => {
    console.log('Base de datos sincronizada');
    app.listen(port, () => {
      console.log(`Servidor en http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error('Error al sincronizar BD:', err.message);
    process.exit(1);
  });