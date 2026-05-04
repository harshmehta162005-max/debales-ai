import { z } from "zod";
import * as schemas from "@/lib/validations";

export type Project = z.infer<typeof schemas.ProjectSchema>;
export type User = z.infer<typeof schemas.UserSchema>;
export type ProductInstance = z.infer<typeof schemas.ProductInstanceSchema>;
export type Conversation = z.infer<typeof schemas.ConversationSchema>;
export type Message = z.infer<typeof schemas.MessageSchema>;
export type DashboardConfig = z.infer<typeof schemas.DashboardConfigSchema>;
