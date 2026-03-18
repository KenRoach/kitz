/** Google Calendar tools — list events, create, find free time. */

import type { ToolDef } from "./registry.js";
import { google } from "googleapis";
import type { OAuth2Client } from "google-auth-library";

function getCalendar(auth: OAuth2Client) {
  return google.calendar({ version: "v3", auth });
}

export function createCalendarTools(auth: OAuth2Client): ToolDef[] {
  const calendar = getCalendar(auth);

  return [
    {
      name: "calendar_list_events",
      description: "Listar próximos eventos del calendario. Por defecto muestra los próximos 7 días.",
      parameters: {
        type: "object",
        properties: {
          days_ahead: { type: "string", description: "Number of days to look ahead (default 7)" },
          max_results: { type: "string", description: "Max events to return (default 20)" },
          calendar_id: { type: "string", description: "Calendar ID (default: primary)" },
        },
      },
      handler: async (args) => {
        const daysAhead = parseInt(String(args.days_ahead || "7"), 10);
        const maxResults = parseInt(String(args.max_results || "20"), 10);
        const calendarId = String(args.calendar_id || "primary");
        const now = new Date();
        const future = new Date(now.getTime() + daysAhead * 86400000);

        const res = await calendar.events.list({
          calendarId,
          timeMin: now.toISOString(),
          timeMax: future.toISOString(),
          maxResults,
          singleEvents: true,
          orderBy: "startTime",
        });

        return {
          count: res.data.items?.length ?? 0,
          events: (res.data.items ?? []).map((e) => ({
            id: e.id,
            summary: e.summary ?? "(sin título)",
            start: e.start?.dateTime ?? e.start?.date ?? "",
            end: e.end?.dateTime ?? e.end?.date ?? "",
            location: e.location ?? "",
            attendees: (e.attendees ?? []).map((a) => a.email).filter(Boolean),
          })),
        };
      },
    },
    {
      name: "calendar_create_event",
      description: "Crear un nuevo evento en Google Calendar",
      parameters: {
        type: "object",
        properties: {
          summary: { type: "string", description: "Event title" },
          start: { type: "string", description: "Start time ISO 8601 (e.g. 2026-03-18T10:00:00-05:00)" },
          end: { type: "string", description: "End time ISO 8601" },
          description: { type: "string", description: "Event description" },
          location: { type: "string", description: "Event location" },
          attendees: { type: "string", description: "Comma-separated email addresses" },
          calendar_id: { type: "string", description: "Calendar ID (default: primary)" },
        },
        required: ["summary", "start", "end"],
      },
      handler: async (args) => {
        const calendarId = String(args.calendar_id || "primary");
        const attendees = args.attendees
          ? String(args.attendees).split(",").map((e) => ({ email: e.trim() }))
          : undefined;

        const res = await calendar.events.insert({
          calendarId,
          requestBody: {
            summary: String(args.summary),
            description: args.description ? String(args.description) : undefined,
            location: args.location ? String(args.location) : undefined,
            start: { dateTime: String(args.start) },
            end: { dateTime: String(args.end) },
            attendees,
          },
        });

        return {
          event_id: res.data.id,
          link: res.data.htmlLink,
          message: "Evento creado exitosamente",
        };
      },
    },
    {
      name: "calendar_find_free_time",
      description: "Buscar huecos libres en el calendario para agendar reuniones",
      parameters: {
        type: "object",
        properties: {
          days_ahead: { type: "string", description: "Days to search (default 3)" },
          duration_minutes: { type: "string", description: "Meeting duration in minutes (default 30)" },
          work_start_hour: { type: "string", description: "Work day start hour 0-23 (default 9)" },
          work_end_hour: { type: "string", description: "Work day end hour 0-23 (default 17)" },
        },
      },
      handler: async (args) => {
        const daysAhead = parseInt(String(args.days_ahead || "3"), 10);
        const durationMin = parseInt(String(args.duration_minutes || "30"), 10);
        const workStart = parseInt(String(args.work_start_hour || "9"), 10);
        const workEnd = parseInt(String(args.work_end_hour || "17"), 10);

        const now = new Date();
        const future = new Date(now.getTime() + daysAhead * 86400000);

        const res = await calendar.events.list({
          calendarId: "primary",
          timeMin: now.toISOString(),
          timeMax: future.toISOString(),
          singleEvents: true,
          orderBy: "startTime",
        });

        const busySlots = (res.data.items ?? [])
          .filter((e) => e.start?.dateTime && e.end?.dateTime)
          .map((e) => ({
            start: new Date(e.start!.dateTime!).getTime(),
            end: new Date(e.end!.dateTime!).getTime(),
          }));

        const freeSlots: { start: string; end: string }[] = [];
        const durationMs = durationMin * 60000;

        for (let d = 0; d < daysAhead && freeSlots.length < 10; d++) {
          const day = new Date(now);
          day.setDate(day.getDate() + d);
          day.setHours(workStart, 0, 0, 0);
          const dayEnd = new Date(day);
          dayEnd.setHours(workEnd, 0, 0, 0);

          let cursor = Math.max(day.getTime(), now.getTime());

          while (cursor + durationMs <= dayEnd.getTime() && freeSlots.length < 10) {
            const slotEnd = cursor + durationMs;
            const conflict = busySlots.some(
              (b) => cursor < b.end && slotEnd > b.start
            );
            if (!conflict) {
              freeSlots.push({
                start: new Date(cursor).toISOString(),
                end: new Date(slotEnd).toISOString(),
              });
              cursor = slotEnd;
            } else {
              const overlapping = busySlots.find(
                (b) => cursor < b.end && slotEnd > b.start
              );
              cursor = overlapping ? overlapping.end : cursor + 900000;
            }
          }
        }

        return { free_slots: freeSlots, duration_minutes: durationMin };
      },
    },
    {
      name: "calendar_delete_event",
      description: "Eliminar un evento del calendario",
      parameters: {
        type: "object",
        properties: {
          event_id: { type: "string", description: "Event ID to delete" },
          calendar_id: { type: "string", description: "Calendar ID (default: primary)" },
        },
        required: ["event_id"],
      },
      handler: async (args) => {
        const calendarId = String(args.calendar_id || "primary");
        await calendar.events.delete({
          calendarId,
          eventId: String(args.event_id),
        });
        return { message: "Evento eliminado exitosamente" };
      },
    },
    {
      name: "calendar_list_calendars",
      description: "Listar todos los calendarios disponibles",
      parameters: { type: "object", properties: {} },
      handler: async () => {
        const res = await calendar.calendarList.list();
        return {
          calendars: (res.data.items ?? []).map((c) => ({
            id: c.id,
            summary: c.summary,
            primary: c.primary ?? false,
          })),
        };
      },
    },
  ];
}
