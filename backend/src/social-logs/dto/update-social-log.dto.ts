import { PartialType } from "@nestjs/mapped-types";

import { CreateSocialLogDto } from "./create-social-log.dto";

export class UpdateSocialLogDto extends PartialType(CreateSocialLogDto) {}