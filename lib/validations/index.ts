import { z } from "zod";

export const ProjectSchema = z.object({
  slug: z.string(),
  name: z.string(),
  setupComplete: z.boolean().default(false),
  members: z.array(z.object({
    userId: z.string(),
    role: z.enum(['admin', 'member'])
  }))
});


export const UserSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  projects: z.array(z.object({
    projectId: z.string(),
    role: z.enum(['admin', 'member'])
  }))
});

export const ProductInstanceSchema = z.object({
  projectId: z.string(),
  productType: z.string(),
  name: z.string(),
  integrations: z.object({
    shopify: z.object({
      enabled: z.boolean(),
      mockData: z.record(z.string(), z.any()).optional().nullable()
    }),
    crm: z.object({
      enabled: z.boolean(),
      mockData: z.record(z.string(), z.any()).optional().nullable()
    })
  })
});

export const ConversationSchema = z.object({
  projectId: z.string(),
  productInstanceId: z.string(),
  title: z.string(),
  createdByUserId: z.string()
});

export const MessageSchema = z.object({
  conversationId: z.string(),
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  steps: z.array(z.string()).optional().nullable()
});

export const DashboardConfigSchema = z.object({
  projectId: z.string(),
  layout: z.array(z.object({
    id: z.string(),
    type: z.enum(['section', 'widget']),
    title: z.string(),
    widgets: z.array(z.object({
      type: z.enum(['stat', 'chart', 'list', 'table']),
      label: z.string(),
      valueKey: z.string()
    })).optional()
  }))
});
