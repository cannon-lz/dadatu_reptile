const App = require('./lib/app');
const app = new App();

const MovieController = require('./controller/movieController');
const IndexController = require('./controller/indexController');
const movieController = new MovieController();
const indexController = new IndexController();


app.get('/', indexController.index);
app.get('/index', indexController.index);
app.get('/search', movieController.search);
app.get('/video', movieController.video);
app.get('/play', movieController.play);

app.listen(9980);

console.info('Server', 'server started for http://localhost:' + 9980);
