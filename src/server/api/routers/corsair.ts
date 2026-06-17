import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { corsair } from "@/server/corsair";

export const corsairRouter = createTRPCRouter({
  getGmailMessages: publicProcedure
    .input(z.object({ limit: z.number().optional().default(10) }))
    .query(async ({ input }) => {
      try {
        const client = corsair.withTenant("pushkar");
        const res = await client.gmail.api.messages.list({
          maxResults: input.limit,
        });

        if (!res.messages || res.messages.length === 0) {
          return { messages: [] };
        }

        // Fetch details for each message to get subjects, snippets, dates, and headers
        const detailedMessages = await Promise.all(
          res.messages.map(async (msg) => {
            if (!msg.id) return msg;
            try {
              return await client.gmail.api.messages.get({ id: msg.id });
            } catch (err) {
              console.error(`Error fetching Gmail message details for ${msg.id}:`, err);
              return msg;
            }
          })
        );

        return {
          ...res,
          messages: detailedMessages,
        };
      } catch (err) {
        console.error("Error fetching Gmail messages:", err);
        throw err;
      }
    }),

  sendGmailMessage: publicProcedure
    .input(
      z.object({
        to: z.string().email(),
        subject: z.string().min(1),
        body: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const client = corsair.withTenant("pushkar");

        // Construct raw RFC 2822 email format
        const emailContent = [
          `To: ${input.to}`,
          `Subject: ${input.subject}`,
          `Content-Type: text/plain; charset=utf-8`,
          `MIME-Version: 1.0`,
          "",
          input.body,
        ].join("\r\n");

        const raw = Buffer.from(emailContent).toString("base64url");

        const res = await client.gmail.api.messages.send({
          raw,
        });
        return res;
      } catch (err) {
        console.error("Error sending Gmail message:", err);
        throw err;
      }
    }),

  getCalendarEvents: publicProcedure
    .input(z.object({ limit: z.number().optional().default(15) }))
    .query(async ({ input }) => {
      try {
        const client = corsair.withTenant("pushkar");
        const res = await client.googlecalendar.api.events.getMany({
          calendarId: "primary",
          timeMin: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
          maxResults: input.limit,
          singleEvents: true,
          orderBy: "startTime",
        });
        return res;
      } catch (err) {
        console.error("Error fetching Google Calendar events:", err);
        throw err;
      }
    }),

  createCalendarEvent: publicProcedure
    .input(
      z.object({
        summary: z.string().min(1),
        description: z.string().optional(),
        startDateTime: z.string(),
        endDateTime: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const client = corsair.withTenant("pushkar");
        const res = await client.googlecalendar.api.events.create({
          event: {
            summary: input.summary,
            description: input.description,
            start: {
              dateTime: input.startDateTime,
            },
            end: {
              dateTime: input.endDateTime,
            },
          },
        });
        return res;
      } catch (err) {
        console.error("Error creating Google Calendar event:", err);
        throw err;
      }
    }),

  quickAddCalendarEvent: publicProcedure
    .input(z.object({ text: z.string().min(1) }))
    .mutation(async ({ input }) => {
      try {
        const client = corsair.withTenant("pushkar");
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
          throw new Error("GEMINI_API_KEY is not configured on the server.");
        }

        const currentTime = new Date().toISOString();
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        const systemPrompt = `You are a calendar assistant. Parse the user's event request and return ONLY a valid JSON object matching this schema:
{
  "summary": "Title of the event",
  "description": "Optional description details",
  "startDateTime": "ISO-8601 string of start time",
  "endDateTime": "ISO-8601 string of end time (default to 1 hour after start if unspecified)"
}
Use the current reference time: ${currentTime}. Do not add any markdown blocks or explanations. Return only the JSON object.`;

        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: `Parse this event request: "${input.text}"` }]
              }
            ],
            systemInstruction: {
              parts: [{ text: systemPrompt }]
            }
          })
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Gemini API error: ${res.statusText} (${errText})`);
        }

        const data = await res.json();
        let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
        
        const parsed = JSON.parse(rawText);
        if (!parsed.summary || !parsed.startDateTime || !parsed.endDateTime) {
          throw new Error("Failed to parse event details from text.");
        }

        const created = await client.googlecalendar.api.events.create({
          event: {
            summary: parsed.summary,
            description: parsed.description || "",
            start: {
              dateTime: parsed.startDateTime,
            },
            end: {
              dateTime: parsed.endDateTime,
            },
          },
        });
        return created;
      } catch (err) {
        console.error("Error in quickAddCalendarEvent:", err);
        throw err;
      }
    }),

  respondToCalendarEvent: publicProcedure
    .input(
      z.object({
        id: z.string(),
        responseStatus: z.enum(["accepted", "declined", "tentative"]),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const client = corsair.withTenant("pushkar");
        const event = await client.googlecalendar.api.events.get({ id: input.id });
        
        const updatedAttendees = event.attendees?.map((attendee: any) => {
          if (attendee.self) {
            return {
              ...attendee,
              responseStatus: input.responseStatus,
            };
          }
          return attendee;
        }) || [];

        const res = await client.googlecalendar.api.events.update({
          id: input.id,
          event: {
            summary: event.summary,
            description: event.description,
            location: event.location,
            start: event.start,
            end: event.end,
            attendees: updatedAttendees,
          },
        });
        return res;
      } catch (err) {
        console.error("Error RSVPing to event:", err);
        throw err;
      }
    }),

  deleteCalendarEvent: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const client = corsair.withTenant("pushkar");
        await client.googlecalendar.api.events.delete({ id: input.id });
        return { success: true };
      } catch (err) {
        console.error("Error deleting event:", err);
        throw err;
      }
    }),

  agentChat: publicProcedure
    .input(
      z.object({
        messages: z.array(
          z.object({
            role: z.enum(["user", "model", "function"]),
            parts: z.array(z.any()),
          }),
        ),
      }),
    )
    .mutation(async ({ input }) => {
      const client = corsair.withTenant("pushkar");
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not configured on the server.");
      }

      // 1. Define tools for Gemini function calling
      const tools = [
        {
          functionDeclarations: [
            {
              name: "list_emails",
              description: "List or search recent emails from the user's Gmail inbox.",
              parameters: {
                type: "OBJECT",
                properties: {
                  query: {
                    type: "STRING",
                    description: "Optional search query to filter emails (e.g. sender name, keyword)",
                  },
                  limit: {
                    type: "INTEGER",
                    description: "Maximum number of emails to retrieve. Default is 5.",
                  },
                },
              },
            },
            {
              name: "send_email",
              description: "Compose and send a new email to a recipient.",
              parameters: {
                type: "OBJECT",
                properties: {
                  to: { type: "STRING", "description": "The recipient's email address" },
                  subject: { type: "STRING", "description": "The subject line of the email" },
                  body: { type: "STRING", "description": "The body text of the email" },
                },
                required: ["to", "subject", "body"],
              },
            },
            {
              name: "list_calendar_events",
              description: "List upcoming events from the user's Google Calendar.",
              parameters: {
                type: "OBJECT",
                properties: {
                  limit: {
                    type: "INTEGER",
                    description: "Maximum number of events to retrieve. Default is 5.",
                  },
                },
              },
            },
            {
              name: "create_calendar_event",
              description: "Schedule a new event on the user's Google Calendar.",
              parameters: {
                type: "OBJECT",
                properties: {
                  summary: { type: "STRING", "description": "The title or summary of the event" },
                  description: { type: "STRING", "description": "Optional details of the event" },
                  start_time: {
                    type: "STRING",
                    description: "The start date and time in ISO format (e.g. '2026-06-25T09:00:00Z')",
                  },
                  end_time: {
                    type: "STRING",
                    description: "The end date and time in ISO format (e.g. '2026-06-25T10:00:00Z')",
                  },
                },
                required: ["summary", "start_time", "end_time"],
              },
            },
          ],
        },
      ];

      // 2. Define assistant instructions
      const systemInstruction = {
        parts: [
          {
            text: `You are a helpful office assistant (Command Center Agent) with permission-gated access to the user's Gmail and Google Calendar via Corsair integrations.
You can read/search emails, send emails, retrieve upcoming calendar events, and schedule new events.

When the user asks you to perform an action, select the appropriate tool.
The current date and time is ${new Date().toISOString()}. Use this reference to calculate relative dates.
Be concise, professional, and friendly. After calling a tool, explain the outcome clearly to the user.`,
          },
        ],
      };

      const chatHistory = [...input.messages];

      // 3. Define tool execution mapping
      const executeTool = async (name: string, args: any) => {
        console.log(`[MCP Agent] Executing tool ${name} with args:`, args);
        try {
          switch (name) {
            case "list_emails": {
              const q = args.query;
              const limit = args.limit ?? 5;
              const res = await client.gmail.api.messages.list({ q, maxResults: limit });
              if (!res.messages || res.messages.length === 0) return { messages: [] };
              const detailed = await Promise.all(
                res.messages.map(async (msg: any) => {
                  try {
                    return await client.gmail.api.messages.get({ id: msg.id });
                  } catch {
                    return msg;
                  }
                })
              );
              return { messages: detailed };
            }
            case "send_email": {
              const { to, subject, body } = args;
              const emailContent = [
                `To: ${to}`,
                `Subject: ${subject}`,
                `Content-Type: text/plain; charset=utf-8`,
                `MIME-Version: 1.0`,
                "",
                body,
              ].join("\r\n");
              const raw = Buffer.from(emailContent).toString("base64url");
              return await client.gmail.api.messages.send({ raw });
            }
            case "list_calendar_events": {
              const limit = args.limit ?? 5;
              return await client.googlecalendar.api.events.getMany({
                calendarId: "primary",
                maxResults: limit,
                singleEvents: true,
                orderBy: "startTime",
              });
            }
            case "create_calendar_event": {
              const { summary, description, start_time, end_time } = args;
              return await client.googlecalendar.api.events.create({
                event: {
                  summary,
                  description,
                  start: { dateTime: start_time },
                  end: { dateTime: end_time },
                },
              });
            }
            default:
              throw new Error(`Unknown tool: ${name}`);
          }
        } catch (err: any) {
          console.error(`Error executing tool ${name}:`, err);
          return { error: err.message || "Failed to execute tool command" };
        }
      };

      // 4. Run Agent loop (max 5 turns to prevent infinite loops)
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

      for (let turn = 0; turn < 5; turn++) {
        const payload = {
          contents: chatHistory,
          systemInstruction,
          tools,
        };

        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Gemini API error: ${res.statusText} (${errText})`);
        }

        const data = await res.json();
        const candidate = data.candidates?.[0];

        if (!candidate?.content) {
          throw new Error("Invalid response candidate from Gemini API");
        }

        const modelMessage = candidate.content;
        chatHistory.push(modelMessage);

        const functionCalls = modelMessage.parts?.filter((p: any) => p.functionCall);

        if (functionCalls && functionCalls.length > 0) {
          const toolParts: any[] = [];
          for (const call of functionCalls) {
            const { name, args } = call.functionCall;
            const result = await executeTool(name, args);
            toolParts.push({
              functionResponse: {
                name,
                response: { result },
              },
            });
          }

          chatHistory.push({
            role: "function",
            parts: toolParts,
          });
        } else {
          // No more function calls, returning final chatHistory update
          return {
            messages: chatHistory,
            responseText: modelMessage.parts?.map((p: any) => p.text).join("") || "",
          };
        }
      }

      // Fallback response if loop exhausted
      const lastModelText = chatHistory
        .filter((m) => m.role === "model")
        .pop()
        ?.parts?.map((p: any) => p.text)
        .join("");

      return {
        messages: chatHistory,
        responseText: lastModelText || "Agent loop completed without a text response.",
      };
    }),
});
