import express, { application, Application } from "express";
import { env } from "process";
import validateEnv from "./utils/validate.env";
import connectDB from "./config/db.config";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from './routes/user/userRoutes';
import adminRoutes from './routes/admin/adminRoute';
import clientRoutes from './routes/client/clientRoutes';
import freelancerRoutes from './routes/freelancer/freelancerRoutes';
import webhookRoutes from './routes/client/webhookRoutes';
import messageRoutes from './routes/user/messageRoutes';
import { errorHandler } from "./middlewares/errorMiddleware";
import { logger, morganMiddleware } from "./middlewares/loggerMiddleware";
import http from 'http';
import { initSocket } from './utils/socket';

class App {
    public app: Application;
    public server: http.Server;

    constructor() {
        validateEnv();
        this.app = express();
        this.server = http.createServer(this.app);
        this.app.use('/webhook', express.raw({ type: "application/json" }), webhookRoutes);
        this.initializeMiddlewares()
        this.initializeDatabase()
        this.initializeRoutes()
        // this.initializeSocket()
    }

    private initializeMiddlewares(): void {
        this.app.use(cors({ 
            origin: env.CLIENT_URL,
            methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
            allowedHeaders: ["Content-Type", "Authorization"],
            credentials: true
        }));
        this.app.use(express.json());
        this.app.use(cookieParser());
        this.app.use(morganMiddleware);
    }

    private initializeDatabase(): void{
        connectDB()
    }

    private initializeRoutes(): void{
        this.app.use(express.json());
        this.app.use('/api/auth', routes);
        this.app.use('/api/admin', adminRoutes);
        this.app.use('/api/client', clientRoutes);
        this.app.use('/api/freelancer', freelancerRoutes);
        this.app.use('/api/media/', messageRoutes);
        this.app.use(errorHandler);
    }

    private initializeSocket(): void {
        initSocket(this.server);
    }

    public listen() {
        const PORT = Number(process.env.PORT) || 3000
        this.server.listen(Number(PORT), '0.0.0.0', () => {
            logger.info(`Server running on http://localhost:${PORT}`);
            console.log(`Server running on http://localhost:${PORT}`);
            this.initializeSocket();
        });
    }
};

const app = new App()
app.listen()