import { z } from 'zod'

export const automationNodeTypeSchema = z.enum([
  'message',
  'interactive-message',
  'condition',
  'delay',
  'variable',
  'http-request',
])
export type AutomationNodeType = z.infer<typeof automationNodeTypeSchema>
export const automationNodeDataSchema = z.object({
  label: z.string().max(120),
  description: z.string().max(1000).default(''),
  message: z.string().max(10000).optional(),
  options: z
    .array(z.object({ id: z.string().min(1).max(100), label: z.string().min(1).max(120) }))
    .max(10)
    .optional(),
  variable: z.string().max(100).optional(),
  value: z.string().max(10000).optional(),
  operator: z.enum(['equals', 'contains', 'exists']).optional(),
  seconds: z.number().int().min(0).max(86400).optional(),
  url: z.string().max(2048).optional(),
  method: z.enum(['GET', 'POST']).optional(),
  body: z.string().max(32768).optional(),
})
export const automationNodeSchema = z.object({
  id: z.string().min(1).max(100),
  type: automationNodeTypeSchema,
  position: z.object({ x: z.number().finite(), y: z.number().finite() }),
  data: automationNodeDataSchema,
})
export const automationEdgeSchema = z.object({
  id: z.string().min(1).max(100),
  source: z.string().min(1),
  target: z.string().min(1),
  sourceHandle: z.string().nullable().default(null),
  targetHandle: z.string().nullable().default(null),
})
export const flowIssueSchema = z.object({ field: z.string(), message: z.string() })
export const automationFlowSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(120),
  trigger: z.literal('inbound'),
  keywords: z.string().max(1000),
  keywordMatch: z.enum(['any', 'all', 'exact']),
  enabled: z.boolean(),
  graph: z.object({
    version: z.literal(1),
    kind: z.literal('chat'),
    startNodeId: z.string().min(1),
    nodes: z.array(automationNodeSchema).min(1).max(200),
    edges: z.array(automationEdgeSchema).max(1000),
  }),
  revision: z.number().int().positive(),
  publishedRevision: z.number().int().nonnegative(),
  warnings: z
    .array(flowIssueSchema)
    .nullish()
    .transform((value) => value ?? []),
})
export const automationSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  kind: z.literal('chat'),
  keywords: z.string(),
  enabled: z.boolean(),
  steps: z.number().int(),
  revision: z.number().int(),
  publishedRevision: z.number().int(),
})
export type AutomationFlow = z.infer<typeof automationFlowSchema>
export type AutomationSummary = z.infer<typeof automationSummarySchema>
export type AutomationNode = z.infer<typeof automationNodeSchema>
export type AutomationEdge = z.infer<typeof automationEdgeSchema>
export type AutomationNodeData = z.infer<typeof automationNodeDataSchema> & { isStart?: boolean }
export type FlowIssue = z.infer<typeof flowIssueSchema>

export type AutomationLoaderData = {
  flows?: AutomationSummary[]
  flow?: AutomationFlow
  boundFlowId?: string
}
export type AutomationActionResult = {
  flow?: AutomationFlow
  message?: string
  error?: string
  fields?: FlowIssue[]
  messages?: string[]
}

export const automationMutationSchema = z.discriminatedUnion('intent', [
  z.object({ intent: z.literal('create') }),
  z.object({ intent: z.literal('save'), flow: automationFlowSchema }),
  z.object({ intent: z.literal('publish'), revision: z.number().int().positive() }),
  z.object({ intent: z.literal('duplicate'), id: z.string().min(1) }),
  z.object({
    intent: z.literal('delete'),
    id: z.string().min(1),
    revision: z.number().int().positive(),
  }),
  z.object({
    intent: z.literal('toggle'),
    id: z.string().min(1),
    revision: z.number().int().positive(),
    enabled: z.boolean(),
  }),
  z.object({ intent: z.literal('bind'), flowId: z.string() }),
  z.object({ intent: z.literal('simulate'), inputs: z.array(z.string()).max(100) }),
])
export type AutomationMutation = z.infer<typeof automationMutationSchema>
