import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    // кэширование preflight запросов
    maxAge: 43200,
}));

app.get('/', (req, res) => {
    res.status(200).send({ message: "let's go bitch" });
});

app.listen(3500, () => {
    console.log('server is running');
});