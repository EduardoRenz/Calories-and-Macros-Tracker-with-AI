import { ChatAssistantContextData } from "../../domain/services/ChatAssistantService"
import { BaseChatAssistantService } from "./BaseChatAssistantService"
import { ChatMessage } from "../../domain/entities/ChatMessage"
import { DashboardRepository } from "../../domain/repositories/DashboardRepository"
import { ModelConfigRepository } from "../../domain/repositories/ModelConfigRepository"
import { RepositoryFactory } from "../RepositoryFactory"
import { ChatAssistantApiException, ChatAssistantAuthException } from "../../domain/exceptions/ChatAssistantException"

type OpenAIChatMessage = {
  role: "system" | "user" | "assistant" | "tool"
  content: string | null
  tool_call_id?: string
  tool_calls?: OpenAIToolCall[]
}

type OpenAIToolCall = {
  id: string
  function: {
    name: string
    arguments: string
  }
}

type OpenAIChatResponse = {
  choices: Array<{
    message: OpenAIChatMessage
  }>
}

export class OpenAIChatAssistantService extends BaseChatAssistantService {
  protected apiKey: string
  protected baseUrl: string
  protected dashboardRepo?: DashboardRepository
  private modelConfigRepo: ModelConfigRepository
  protected providerName: string

  constructor(
    apiKey: string,
    dashboardRepo?: DashboardRepository,
    baseUrl: string = "https://api.openai.com/v1",
    providerName: string = "openai",
  ) {
    super()
    this.apiKey = apiKey
    this.dashboardRepo = dashboardRepo
    this.baseUrl = baseUrl
    this.providerName = providerName
    this.modelConfigRepo = RepositoryFactory.getModelConfigRepository()
  }

  private async getModelVersion(): Promise<string> {
    try {
      return (await this.modelConfigRepo.getModelVersion(this.providerName, "chat")) || this.getDefaultModel()
    } catch (error) {
      console.warn("Failed to get model version from remote config, using fallback:", error)
      return this.getDefaultModel()
    }
  }

  protected getDefaultModel(): string {
    return "gpt-5.4-nano-2026-03-17"
  }

  async sendMessage(messages: ChatMessage[], context: ChatAssistantContextData): Promise<ChatMessage> {
    // Build System Prompt
    const systemContent = `${this.getPersonaHeader()}

${this.buildContextString(context)}

${this.getSystemCapabilities()}

IMPORTANT: To propose an action (add/update/remove ingredient), YOU MUST USE THE 'create_action' TOOL provided. Do not output JSON text.
`

    const apiMessages: OpenAIChatMessage[] = [
      { role: "system", content: systemContent },
      ...messages.map((m): OpenAIChatMessage => ({
        role: m.role === "system" ? "assistant" : m.role,
        content: m.content,
      })),
    ]

    const tools = [
      {
        type: "function",
        function: {
          name: "create_action",
          description: "Proposes an action to modify the dashboard.",
          parameters: {
            type: "object",
            properties: {
              type: {
                type: "string",
                enum: ["add_ingredient", "update_ingredient", "remove_ingredient"],
                description: "The type of action to perform.",
              },
              data: {
                type: "object",
                description: "The data for the action.",
                properties: {
                  mealType: {
                    type: "string",
                    enum: ["breakfast", "lunch", "dinner", "snacks"],
                    description: "The meal to modify. Must be lowercase.",
                  },
                  ingredientId: {
                    type: "string",
                    description: "The ID of the ingredient (required for update/remove).",
                  },
                  name: {
                    type: "string",
                    description: "The name of the ingredient to remove (required for remove).",
                  },
                  ingredient: {
                    type: "object",
                    description: "For add_ingredient only: the ingredient data.",
                    properties: {
                      name: { type: "string" },
                      quantity: { type: "string", description: "Quantity in string format e.g. '100g'" },
                      calories: { type: "number" },
                      protein: { type: "number" },
                      carbs: { type: "number" },
                      fats: { type: "number" },
                      fiber: { type: "number" },
                    },
                    required: ["name", "quantity", "calories", "protein", "carbs", "fats"],
                  },
                  updates: {
                    type: "object",
                    description: "For update_ingredient only: the data that will be updated.",
                    properties: {
                      name: { type: "string", description: "Optional new ingredient name." },
                      quantity: { type: "string", description: "Quantity in string format e.g. '100g'" },
                      calories: { type: "number", description: "New calories value." },
                      protein: { type: "number", description: "New protein value." },
                      carbs: { type: "number", description: "New carbs value." },
                      fats: { type: "number", description: "New fats value." },
                      fiber: { type: "number", description: "New fiber value." },
                    },
                    minProperties: 1,
                  },
                },
                required: ["mealType"],
                allOf: [
                  {
                    if: { properties: { type: { const: "remove_ingredient" } } },
                    then: { required: ["mealType", "ingredientId", "name"] },
                  },
                  {
                    if: { properties: { type: { const: "update_ingredient" } } },
                    then: { required: ["mealType", "ingredientId", "updates"] },
                  },
                  {
                    if: { properties: { type: { const: "add_ingredient" } } },
                    then: { required: ["mealType", "ingredient"] },
                  },
                ],
              },
            },
            required: ["type", "data"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "get_dashboard_for_date",
          description: "Fetches the nutritional data and ingredients for a specific date.",
          parameters: {
            type: "object",
            properties: {
              date: { type: "string", description: "The date to fetch (yyyy-mm-dd)." },
            },
            required: ["date"],
          },
        },
      },
    ]

    try {
      const currentMessages = [...apiMessages]

      while (true) {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: await this.getModelVersion(),
            messages: currentMessages,
            tools: tools,
            tool_choice: "auto",
          }),
        })

        if (!response.ok) {
          const errText = await response.text()
          // Determine exception type based on HTTP status code
          if (response.status === 401 || response.status === 403) {
            throw new ChatAssistantAuthException(`Authentication failed: ${response.status} - ${errText}`)
          }
          throw new ChatAssistantApiException(`API Error: ${response.status} - ${errText}`)
        }

        const data = await response.json() as OpenAIChatResponse
        const choice = data.choices[0]
        const message = choice.message

        if (message.tool_calls && message.tool_calls.length > 0) {
          const toolCall = message.tool_calls[0]
          if (toolCall.function.name === "get_dashboard_for_date") {
            const args = JSON.parse(toolCall.function.arguments)
            let dataResult = "{}"
            if (this.dashboardRepo) {
              try {
                const dashboardData = await this.dashboardRepo.getDashboardForDate(args.date)
                dataResult = JSON.stringify(dashboardData)
              } catch {
                dataResult = "Error fetching data for this date."
              }
            } else {
              dataResult = "Repository not available on server."
            }

            currentMessages.push(message)
            currentMessages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: dataResult,
            })
            continue
          }
        }

        const preparedActionMessages: Record<string, string> = {
          pt: "✅ Preparei a ação para você.",
          es: "✅ He preparado la acción para ti.",
          en: "✅ I have prepared the action for you.",
        }
        const defaultPreparedMessage = preparedActionMessages[context.language] || preparedActionMessages["en"]

        const assistantMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          role: "assistant",
          content: message.content || defaultPreparedMessage,
          timestamp: new Date(),
        }

        if (message.tool_calls && message.tool_calls.length > 0) {
          const toolCall = message.tool_calls[0]
          if (toolCall.function.name === "create_action") {
            const args = JSON.parse(toolCall.function.arguments)
            assistantMessage.pendingAction = this.createPendingAction(args, context)
          }
        }

        return assistantMessage
      }
    } catch (error) {
      console.error("OpenAI/DeepSeek Chat Error:", error)

      // Re-throw if already a ChatAssistantException (from HTTP status check)
      if (error instanceof ChatAssistantApiException || error instanceof ChatAssistantAuthException) {
        throw error
      }

      // For other errors (network, parsing, etc.), throw as API exception
      throw new ChatAssistantApiException("Failed to get response from AI service", error)
    }
  }
}
