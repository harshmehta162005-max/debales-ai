import { GoogleGenerativeAI } from "@google/generative-ai";
import { ProductInstanceModel } from "../models/ProductInstance";
import { ConversationModel } from "../models/Conversation";
import { MessageModel } from "../models/Message";
import { connectToDatabase } from "../db/mongoose";

// Initialize once — key is read at runtime, not module init
function getGenAI() {
  const key = process.env.AI_API_KEY;
  if (!key) throw new Error("AI_API_KEY is not set");
  return new GoogleGenerativeAI(key);
}

function buildSystemPrompt(projectSlug: string, pi: any): string {
  const integrations: string[] = [];
  if (pi?.integrations?.shopify?.enabled) {
    const orders = pi.integrations.shopify.mockData?.orders ?? "N/A";
    integrations.push(`Shopify (enabled) — mock order count: ${orders}`);
  }
  if (pi?.integrations?.crm?.enabled) {
    const tickets = pi.integrations.crm.mockData?.tickets ?? "N/A";
    integrations.push(`CRM (enabled) — mock ticket count: ${tickets}`);
  }
  if (integrations.length === 0) {
    integrations.push("No integrations currently enabled.");
  }

  return `You are a helpful AI assistant for the "${projectSlug}" project on the Debales AI platform.
You help users with their product-related questions, support issues, and general inquiries.

Current product context:
- Product: ${pi?.name ?? projectSlug}
- Type: ${pi?.productType ?? "general"}

Active integrations:
${integrations.map((i) => `  - ${i}`).join("\n")}

Be concise, helpful, and professional. Answer any question the user has.
If asked about Shopify orders or CRM data, reference the mock data above.
Do NOT say you cannot access real data — treat the mock data as real.`;
}

export const aiService = {
  async generateResponse(projectSlug: string, conversationId: string, content: string) {
    await connectToDatabase();

    const conv = await ConversationModel.findById(conversationId).lean();
    if (!conv) throw new Error("Conversation not found");

    const pi = await ProductInstanceModel.findById(conv.productInstanceId).lean();

    // Build integration step indicators
    const steps: string[] = [];
    if (pi?.integrations?.shopify?.enabled) steps.push("Calling Shopify API...");
    if (pi?.integrations?.crm?.enabled) steps.push("Fetching CRM records...");
    if (steps.length === 0) steps.push("Analyzing request...");

    // Fetch recent history (excluding the message just saved — it's sent separately)
    const historyDocs = await MessageModel.find({ conversationId })
      .sort({ createdAt: 1 })
      .lean();

    // Build alternating user/model history — must start with user and alternate
    // Exclude the very last message (current user message, just saved)
    const historyForChat = historyDocs.slice(0, -1);

    // Ensure history alternates properly (Gemini requirement)
    const chatHistory: { role: "user" | "model"; parts: { text: string }[] }[] = [];
    for (const msg of historyForChat) {
      const role = msg.role === "user" ? "user" : "model";
      // Don't add consecutive same-role messages
      if (chatHistory.length > 0 && chatHistory[chatHistory.length - 1].role === role) {
        // merge into last
        chatHistory[chatHistory.length - 1].parts[0].text += "\n" + msg.content;
      } else {
        chatHistory.push({ role, parts: [{ text: msg.content }] });
      }
    }

    try {
      const genAI = getGenAI();
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: buildSystemPrompt(projectSlug, pi),
      });

      const chat = model.startChat({ history: chatHistory });
      const result = await chat.sendMessage(content);
      const responseText = result.response.text();

      return { content: responseText, steps };
    } catch (err: any) {
      console.error("[AI Service] Gemini error:", err?.message ?? err);
      // Surface a meaningful error instead of dummy text
      throw new Error(
        err?.message?.includes("429")
          ? "AI rate limit reached — please wait a minute and try again"
          : `AI error: ${err?.message ?? "Unknown error"}`
      );
    }
  },
};
