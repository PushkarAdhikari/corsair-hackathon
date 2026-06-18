import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { corsair } from "@/server/corsair";

interface CalendarAttendee {
  email?: string;
  displayName?: string;
  responseStatus?: "accepted" | "declined" | "tentative" | "needsAction";
  self?: boolean;
}

const globalForEmbeddings = globalThis as unknown as {
  cache: Map<string, number[]>;
};
if (!globalForEmbeddings.cache) {
  globalForEmbeddings.cache = new Map<string, number[]>();
}

const globalForPriorityCache = globalThis as unknown as {
  cache: Map<string, "high" | "medium" | "low">;
};
if (!globalForPriorityCache.cache) {
  globalForPriorityCache.cache = new Map<string, "high" | "medium" | "low">();
}

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

        const apiKey = process.env.GEMINI_API_KEY;
        const priorityMap: Record<string, "high" | "medium" | "low"> = {};

        // Filter out emails that have already been classified
        const unclassifiedMessages = detailedMessages.filter((msg) => {
          const m = msg as { id?: string };
          const id = m.id ?? "";
          if (!id) return false;
          if (globalForPriorityCache.cache.has(id)) {
            priorityMap[id] = globalForPriorityCache.cache.get(id)!;
            return false;
          }
          return true;
        });

        if (apiKey && unclassifiedMessages.length > 0) {
          try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
            const emailSummaryList = unclassifiedMessages.map((msg) => {
              const m = msg as { id?: string; snippet?: string; payload?: { headers?: Array<{ name: string; value: string }> } };
              const headers = m.payload?.headers ?? [];
              const subject = headers.find((h) => h.name.toLowerCase() === "subject")?.value ?? "(No Subject)";
              const from = headers.find((h) => h.name.toLowerCase() === "from")?.value ?? "Unknown";
              return {
                id: m.id ?? "",
                from,
                subject,
                snippet: m.snippet ?? "",
              };
            });

            const systemPrompt = `You are a smart email sorting assistant. Classify the priority of each email into 'high', 'medium', or 'low'.
Priority Guidelines:
- 'high': Direct questions from people, work-related action items, calendar invites, or urgent status updates.
- 'medium': Newsletters, updates from platforms that are mildly relevant, general communications.
- 'low': Cold marketing outreach, automated notification logs, promotional items, spam.

Output ONLY a valid JSON object matching this schema:
{
  "priorities": [
    { "id": "email_id", "priority": "high" | "medium" | "low" }
  ]
}`;

            const response = await fetch(url, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [
                  {
                    role: "user",
                    parts: [{ text: `Classify these emails:\n${JSON.stringify(emailSummaryList, null, 2)}` }],
                  },
                ],
                systemInstruction: {
                  parts: [{ text: systemPrompt }],
                },
              }),
            });

            if (response.ok) {
              const data = (await response.json()) as {
                candidates?: Array<{
                  content?: {
                    parts?: Array<{
                      text?: string;
                    }>;
                  };
                }>;
              };
              let text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
              text = text.replace(/```json/g, "").replace(/```/g, "").trim();
              const parsed = JSON.parse(text) as { priorities?: Array<{ id: string; priority: "high" | "medium" | "low" }> };
              if (parsed.priorities && Array.isArray(parsed.priorities)) {
                parsed.priorities.forEach((p) => {
                  priorityMap[p.id] = p.priority;
                  globalForPriorityCache.cache.set(p.id, p.priority);
                });
              }
            }
          } catch (classifyErr) {
            console.error("Error classifying email priorities via LLM:", classifyErr);
          }
        }

        const messagesWithPriority = detailedMessages.map((msg) => {
          const m = msg as { id?: string };
          const id = m.id ?? "";
          return {
            ...msg,
            priority: priorityMap[id] ?? "low",
          };
        });

        return {
          ...res,
          messages: messagesWithPriority,
        };
      } catch (err) {
        console.error("Error fetching Gmail messages:", err);
        throw err;
      }
    }),

  searchGmailMessages: publicProcedure
    .input(
      z.object({
        query: z.string().optional().default(""),
        semantic: z.boolean().optional().default(false),
        from: z.string().optional(),
        subject: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const apiKey = process.env.GEMINI_API_KEY;

        // Fetch cached emails from corsairEntities
        const { db } = await import("@/server/db/index");
        const { corsairEntities } = await import("@/server/db/schema");
        const { eq } = await import("drizzle-orm");

        const cached = await db
          .select()
          .from(corsairEntities)
          .where(eq(corsairEntities.entityType, "gmail.message"));

        // Map cached entities to usable message objects
        let messages = cached.map((c) => {
          const data = c.data as {
            id?: string;
            threadId?: string;
            snippet?: string;
            internalDate?: string | number;
            priority?: "high" | "medium" | "low";
            labelIds?: string[];
            payload?: {
              headers?: Array<{ name: string; value: string }>;
            };
          };
          const headers = data.payload?.headers ?? [];
          const subjectVal = headers.find((h) => h.name.toLowerCase() === "subject")?.value ?? "(No Subject)";
          const fromVal = headers.find((h) => h.name.toLowerCase() === "from")?.value ?? "Unknown";
          
          return {
            id: data.id ?? c.entityId,
            threadId: data.threadId ?? "",
            snippet: data.snippet ?? "",
            internalDate: data.internalDate ?? "",
            priority: data.priority ?? "low",
            starred: data.labelIds?.includes("STARRED") ?? false,
            payload: data.payload,
            labelIds: data.labelIds ?? [],
            subject: subjectVal,
            from: fromVal,
          };
        });

        // Sort messages by date descending (newest first)
        const parseDateVal = (val: string | number | Date | null | undefined): Date => {
          if (!val) return new Date();
          if (val instanceof Date) return val;
          if (typeof val === "number") return new Date(val);
          if (typeof val === "string") {
            if (/^\d+$/.test(val)) {
              return new Date(parseInt(val, 10));
            }
            const d = new Date(val);
            if (!isNaN(d.getTime())) return d;
          }
          return new Date();
        };

        messages.sort((a, b) => {
          const dateA = parseDateVal(a.internalDate).getTime();
          const dateB = parseDateVal(b.internalDate).getTime();
          return dateB - dateA;
        });

        // Perform Advanced search filters (from, subject)
        if (input.from) {
          const fromQuery = input.from.toLowerCase();
          messages = messages.filter((m) => m.from.toLowerCase().includes(fromQuery));
        }

        if (input.subject) {
          const subjectQuery = input.subject.toLowerCase();
          messages = messages.filter((m) => m.subject.toLowerCase().includes(subjectQuery));
        }

        const trimmedQuery = input.query.trim();

        // Perform Vector Search or Text Search
        if (trimmedQuery !== "") {
          if (input.semantic && apiKey) {
            // Get embedding for query
            const getEmbedding = async (text: string) => {
              const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`;
              const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  model: "models/text-embedding-004",
                  content: { parts: [{ text }] },
                }),
              });
              if (!res.ok) throw new Error("Failed to fetch query embedding");
              const resData = (await res.json()) as { embedding?: { values: number[] } };
              return resData.embedding?.values;
            };

            const queryVector = await getEmbedding(trimmedQuery);

            if (queryVector) {
              const cosSimilarity = (a: number[], b: number[]) => {
                let dot = 0;
                let normA = 0;
                let normB = 0;
                for (let i = 0; i < a.length; i++) {
                  dot += a[i]! * b[i]!;
                  normA += a[i]! * a[i]!;
                  normB += b[i]! * b[i]!;
                }
                return dot / (Math.sqrt(normA) * Math.sqrt(normB));
              };

              // Limit semantic search check to top 25 messages to avoid API rate exhaustion
              const searchSubset = messages.slice(0, 25);

              const messagesWithScores = await Promise.all(
                searchSubset.map(async (msg) => {
                  const id = msg.id || "";
                  const contentText = `From: ${msg.from}. Subject: ${msg.subject}. Snippet: ${msg.snippet}`;
                  
                  let vector = globalForEmbeddings.cache.get(id);
                  if (!vector) {
                    try {
                      vector = await getEmbedding(contentText);
                      if (vector) globalForEmbeddings.cache.set(id, vector);
                    } catch {
                      // fallback
                    }
                  }

                  const score = vector ? cosSimilarity(queryVector, vector) : 0;
                  return { ...msg, score };
                })
              );

              // Sort by cosine similarity descending
              messages = messagesWithScores
                .filter((m) => m.score > 0.1) // threshold
                .sort((a, b) => b.score - a.score);
            }
          } else {
            // Standard text query search
            const q = trimmedQuery.toLowerCase();
            messages = messages.filter(
              (m) =>
                m.subject.toLowerCase().includes(q) ||
                m.from.toLowerCase().includes(q) ||
                m.snippet.toLowerCase().includes(q)
            );
          }
        }

        return { messages };
      } catch (err) {
        console.error("Error searching cached emails:", err);
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

        const data = (await res.json()) as {
          candidates?: Array<{
            content?: {
              parts?: Array<{
                text?: string;
              }>;
            };
          }>;
        };
        let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
        
        const parsed = JSON.parse(rawText) as {
          summary?: string;
          description?: string;
          startDateTime?: string;
          endDateTime?: string;
        };
        if (!parsed.summary || !parsed.startDateTime || !parsed.endDateTime) {
          throw new Error("Failed to parse event details from text.");
        }

        const created = await client.googlecalendar.api.events.create({
          event: {
            summary: parsed.summary,
            description: parsed.description ?? "",
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
        const event = (await client.googlecalendar.api.events.get({ id: input.id })) as {
          summary?: string;
          description?: string;
          location?: string;
          start?: { date?: string; dateTime?: string; timeZone?: string };
          end?: { date?: string; dateTime?: string; timeZone?: string };
          attendees?: CalendarAttendee[];
        };
        
        const updatedAttendees = event.attendees?.map((attendee: CalendarAttendee) => {
          if (attendee.self) {
            return {
              ...attendee,
              responseStatus: input.responseStatus,
            };
          }
          return attendee;
        }) ?? [];

        const res = await client.googlecalendar.api.events.update({
          id: input.id,
          event: {
            summary: event.summary ?? "",
            description: event.description ?? "",
            location: event.location ?? "",
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
                  attendees: {
                    type: "ARRAY",
                    description: "Optional array of invitees/attendees email addresses (e.g. ['friend@corsair.dev'])",
                    items: {
                      type: "STRING",
                    },
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
      const executeTool = async (name: string, args: Record<string, unknown>) => {
        console.log(`[MCP Agent] Executing tool ${name} with args:`, args);
        try {
          switch (name) {
            case "list_emails": {
              const q = typeof args.query === "string" ? args.query : undefined;
              const limit = typeof args.limit === "number" ? args.limit : 5;
              const res = await client.gmail.api.messages.list({ q, maxResults: limit });
              const messagesList = (res.messages ?? []) as Array<{ id?: string }>;
              const detailed = await Promise.all(
                messagesList.map(async (msg) => {
                  if (!msg.id) return msg;
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
              const to = typeof args.to === "string" ? args.to : "";
              const subject = typeof args.subject === "string" ? args.subject : "";
              const body = typeof args.body === "string" ? args.body : "";
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
              const limit = typeof args.limit === "number" ? args.limit : 5;
              return await client.googlecalendar.api.events.getMany({
                calendarId: "primary",
                maxResults: limit,
                singleEvents: true,
                orderBy: "startTime",
              });
            }
            case "create_calendar_event": {
              const summary = typeof args.summary === "string" ? args.summary : "";
              const description = typeof args.description === "string" ? args.description : "";
              const start_time = typeof args.start_time === "string" ? args.start_time : "";
              const end_time = typeof args.end_time === "string" ? args.end_time : "";
              const rawAttendees = Array.isArray(args.attendees) ? args.attendees : undefined;
              const attendees = rawAttendees?.map((email) => ({ email: String(email) }));

              return await client.googlecalendar.api.events.create({
                event: {
                  summary,
                  description,
                  start: { dateTime: start_time },
                  end: { dateTime: end_time },
                  attendees,
                },
              });
            }
            default:
              throw new Error(`Unknown tool: ${name}`);
          }
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : "Failed to execute tool command";
          console.error(`Error executing tool ${name}:`, err);
          return { error: errorMsg };
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

        const data = (await res.json()) as {
          candidates?: Array<{
            content?: {
              role?: "model" | "user" | "function";
              parts?: Array<{
                text?: string;
                functionCall?: {
                  name: string;
                  args: Record<string, unknown>;
                };
              }>;
            };
          }>;
        };
        const candidate = data.candidates?.[0];

        if (!candidate?.content) {
          throw new Error("Invalid response candidate from Gemini API");
        }

        const modelMessage = candidate.content;
        chatHistory.push({
          role: modelMessage.role ?? "model",
          parts: modelMessage.parts ?? [],
        });

        const functionCalls = modelMessage.parts?.filter((p) => p.functionCall) ?? [];

        if (functionCalls.length > 0) {
          const toolParts: unknown[] = [];
          for (const call of functionCalls) {
            const { name, args } = call.functionCall!;
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
            responseText: modelMessage.parts?.map((p) => p.text ?? "").join("") ?? "",
          };
        }
      }

      // Fallback response if loop exhausted
      const lastModelText = chatHistory
        .filter((m) => m.role === "model")
        .pop()
        ?.parts?.map((p) => {
          const part = p as { text?: string };
          return part.text ?? "";
        })
        .join("") ?? "";

      return {
        messages: chatHistory,
        responseText: lastModelText || "Agent loop completed without a text response.",
      };
    }),

  getNewEventsCount: publicProcedure
    .input(z.object({ since: z.string().optional() }))
    .query(async ({ input }) => {
      try {
        const { db } = await import("@/server/db/index");
        const { corsairEvents } = await import("@/server/db/schema");
        const { gt } = await import("drizzle-orm");

        if (!input.since) return { count: 0, since: input.since };
        const sinceDate = new Date(input.since);
        
        const events = await db
          .select()
          .from(corsairEvents)
          .where(gt(corsairEvents.createdAt, sinceDate));

        return { count: events.length, since: input.since };
      } catch (err) {
        console.error("Error querying new webhook events:", err);
        return { count: 0, since: input.since };
      }
    }),
});
