require('dotenv').config();
import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import mongoose from 'mongoose';
import api from './api';
/*import createFakeData from "./createFakeData";*/
import jwtMiddleware from "./lib/jwtMiddleware";
import {createLogger} from "redux-logger/src";


const logger = createLogger();

const {PORT,MONGO_URI} = process.env;




const app = new Koa();

mongoose.connect(MONGO_URI)
        .then(()=> {
    console.log('Connected to MongoDB');
    /*createFakeData();*/
    })
    .catch(e=>{
        console.error(e);
});



const router = new Router();



router.use('/api',api.routes());

app.use(bodyParser());
app.use(jwtMiddleware);

app.use(router.routes()).use(router.allowedMethods(logger));


const port = PORT || 4000;
app.listen(port,()=>{
    console.log("PORT=>",PORT);
    console.log("MONGO_URI=>",MONGO_URI);

    console.log('듣고 있다 개자슥아 %d',port);
});
