import { Module } from "@nestjs/common";
import { MediaController } from "../controllers/media.controller";
import { CloudinaryService } from "../services/cloudinary.service";
import { I_STORAGE_SERVICE } from "../../application/ports/i-storage.service";

@Module({
    controllers: [MediaController],
    providers: [
        {
            provide: I_STORAGE_SERVICE,
            useClass: CloudinaryService,
        },
    ],
    exports: [I_STORAGE_SERVICE],
})
export class MediaModule {}