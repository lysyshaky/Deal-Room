import type { Express, NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { acceptInputSchema, commentInputSchema, dealInputSchema, eventInputSchema } from "../shared/schema";
import { getSupabase, isConfigured } from "./supabase";

type Handler = (req: Request, res: Response) => Promise<void> | void;

const wrap = (fn: Handler) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res)).catch(next);
};

function requireConfigured(_req: Request, res: Response, next: NextFunction) {
  if (!isConfigured()) {
    res.status(503).json({ error: "Supabase is not configured — see the README to connect your project." });
    return;
  }
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const passcode = process.env.ADMIN_PASSCODE;
  if (!passcode || req.headers["x-admin-passcode"] === passcode) {
    next();
    return;
  }
  res.status(401).json({ error: "Invalid passcode" });
}

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null && "message" in err) {
    return String((err as { message: unknown }).message);
  }
  return "Internal server error";
}

export function registerRoutes(app: Express) {
  app.get("/api/config", (_req, res) => {
    res.json({ configured: isConfigured(), adminRequired: Boolean(process.env.ADMIN_PASSCODE) });
  });

  app.post("/api/auth/verify", (req, res) => {
    const passcode = process.env.ADMIN_PASSCODE;
    if (!passcode || req.body?.passcode === passcode) {
      res.json({ ok: true });
      return;
    }
    res.status(401).json({ error: "Invalid passcode" });
  });

  // ---------- Owner dashboard API ----------

  app.get(
    "/api/deals",
    requireConfigured,
    requireAdmin,
    wrap(async (_req, res) => {
      const sb = getSupabase();
      const { data: deals, error } = await sb
        .from("deals")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      const [events, options] = await Promise.all([
        sb.from("events").select("deal_id, type, created_at").order("created_at", { ascending: false }),
        sb.from("options").select("deal_id, price_cents, kind, default_selected"),
      ]);
      if (events.error) throw events.error;
      if (options.error) throw options.error;

      const viewCounts = new Map<string, number>();
      const lastEvent = new Map<string, string>();
      for (const e of events.data ?? []) {
        if (!lastEvent.has(e.deal_id)) lastEvent.set(e.deal_id, e.created_at);
        if (e.type === "view") viewCounts.set(e.deal_id, (viewCounts.get(e.deal_id) ?? 0) + 1);
      }
      // Deal value = base options + add-ons that start toggled on
      const totals = new Map<string, number>();
      for (const o of options.data ?? []) {
        if (o.kind === "base" || o.default_selected) {
          totals.set(o.deal_id, (totals.get(o.deal_id) ?? 0) + o.price_cents);
        }
      }

      res.json(
        (deals ?? []).map((d) => ({
          ...d,
          view_count: viewCounts.get(d.id) ?? 0,
          total_cents: totals.get(d.id) ?? 0,
          last_event_at: lastEvent.get(d.id) ?? null,
        }))
      );
    })
  );

  app.get(
    "/api/deals/:id",
    requireConfigured,
    requireAdmin,
    wrap(async (req, res) => {
      const sb = getSupabase();
      const { data: deal, error } = await sb
        .from("deals")
        .select("*")
        .eq("id", req.params.id)
        .maybeSingle();
      if (error) throw error;
      if (!deal) {
        res.status(404).json({ error: "Deal not found" });
        return;
      }
      const [options, milestones, comments] = await Promise.all([
        sb.from("options").select("*").eq("deal_id", deal.id).order("sort_order"),
        sb.from("milestones").select("*").eq("deal_id", deal.id).order("sort_order"),
        sb.from("comments").select("*").eq("deal_id", deal.id).order("created_at"),
      ]);
      if (options.error) throw options.error;
      if (milestones.error) throw milestones.error;
      if (comments.error) throw comments.error;
      res.json({
        ...deal,
        options: options.data ?? [],
        milestones: milestones.data ?? [],
        comments: comments.data ?? [],
      });
    })
  );

  app.post(
    "/api/deals/:id/comments",
    requireConfigured,
    requireAdmin,
    wrap(async (req, res) => {
      const input = commentInputSchema.parse(req.body);
      const sb = getSupabase();
      const { data: deal, error } = await sb
        .from("deals")
        .select("id")
        .eq("id", req.params.id)
        .maybeSingle();
      if (error) throw error;
      if (!deal) {
        res.status(404).json({ error: "Deal not found" });
        return;
      }
      const { data: comment, error: insErr } = await sb
        .from("comments")
        .insert({ deal_id: deal.id, author_name: input.author_name, author_role: "owner", body: input.body })
        .select()
        .single();
      if (insErr) throw insErr;
      res.status(201).json(comment);
    })
  );

  app.post(
    "/api/deals",
    requireConfigured,
    requireAdmin,
    wrap(async (req, res) => {
      const input = dealInputSchema.parse(req.body);
      const { options, milestones, ...fields } = input;
      const sb = getSupabase();

      const { data: deal, error } = await sb.from("deals").insert(fields).select().single();
      if (error) {
        if (error.code === "23505") {
          res.status(400).json({ error: `Slug "${fields.slug}" is already in use` });
          return;
        }
        throw error;
      }

      if (options.length > 0) {
        const { error: optErr } = await sb
          .from("options")
          .insert(options.map((o, i) => ({ ...o, deal_id: deal.id, sort_order: i })));
        if (optErr) throw optErr;
      }
      if (milestones.length > 0) {
        const { error: msErr } = await sb
          .from("milestones")
          .insert(milestones.map((m, i) => ({ ...m, deal_id: deal.id, sort_order: i })));
        if (msErr) throw msErr;
      }
      res.status(201).json(deal);
    })
  );

  app.put(
    "/api/deals/:id",
    requireConfigured,
    requireAdmin,
    wrap(async (req, res) => {
      const input = dealInputSchema.parse(req.body);
      const { options, milestones, ...fields } = input;
      const sb = getSupabase();

      const { data: deal, error } = await sb
        .from("deals")
        .update(fields)
        .eq("id", req.params.id)
        .select()
        .maybeSingle();
      if (error) {
        if (error.code === "23505") {
          res.status(400).json({ error: `Slug "${fields.slug}" is already in use` });
          return;
        }
        throw error;
      }
      if (!deal) {
        res.status(404).json({ error: "Deal not found" });
        return;
      }

      // Replace options & milestones wholesale — simplest correct behavior for a form save.
      const [delOpts, delMs] = await Promise.all([
        sb.from("options").delete().eq("deal_id", deal.id),
        sb.from("milestones").delete().eq("deal_id", deal.id),
      ]);
      if (delOpts.error) throw delOpts.error;
      if (delMs.error) throw delMs.error;

      if (options.length > 0) {
        const { error: optErr } = await sb
          .from("options")
          .insert(options.map((o, i) => ({ ...o, deal_id: deal.id, sort_order: i })));
        if (optErr) throw optErr;
      }
      if (milestones.length > 0) {
        const { error: msErr } = await sb
          .from("milestones")
          .insert(milestones.map((m, i) => ({ ...m, deal_id: deal.id, sort_order: i })));
        if (msErr) throw msErr;
      }
      res.json(deal);
    })
  );

  app.delete(
    "/api/deals/:id",
    requireConfigured,
    requireAdmin,
    wrap(async (req, res) => {
      const sb = getSupabase();
      const { error } = await sb.from("deals").delete().eq("id", req.params.id);
      if (error) throw error;
      res.json({ ok: true });
    })
  );

  app.get(
    "/api/deals/:id/analytics",
    requireConfigured,
    requireAdmin,
    wrap(async (req, res) => {
      const sb = getSupabase();
      const { data: deal, error } = await sb
        .from("deals")
        .select("*")
        .eq("id", req.params.id)
        .maybeSingle();
      if (error) throw error;
      if (!deal) {
        res.status(404).json({ error: "Deal not found" });
        return;
      }

      const { data: events, error: evErr } = await sb
        .from("events")
        .select("*")
        .eq("deal_id", deal.id)
        .order("created_at", { ascending: false });
      if (evErr) throw evErr;

      const all = events ?? [];
      const toggles = new Map<string, number>();
      for (const e of all) {
        if (e.type === "option_toggle") {
          const name = String((e.meta as Record<string, unknown>)?.option_name ?? "Unknown option");
          toggles.set(name, (toggles.get(name) ?? 0) + 1);
        }
      }

      res.json({
        deal,
        total_views: all.filter((e) => e.type === "view").length,
        accept_count: all.filter((e) => e.type === "accept").length,
        toggle_counts: [...toggles.entries()]
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count),
        events: all.slice(0, 100),
      });
    })
  );

  // ---------- Public proposal API ----------

  app.get(
    "/api/public/deals/:slug",
    requireConfigured,
    wrap(async (req, res) => {
      const sb = getSupabase();
      const { data: deal, error } = await sb
        .from("deals")
        .select("*")
        .eq("slug", req.params.slug)
        .maybeSingle();
      if (error) throw error;
      if (!deal) {
        res.status(404).json({ error: "Proposal not found" });
        return;
      }

      const [options, milestones, comments] = await Promise.all([
        sb.from("options").select("*").eq("deal_id", deal.id).order("sort_order"),
        sb.from("milestones").select("*").eq("deal_id", deal.id).order("sort_order"),
        sb.from("comments").select("*").eq("deal_id", deal.id).order("created_at"),
      ]);
      if (options.error) throw options.error;
      if (milestones.error) throw milestones.error;
      if (comments.error) throw comments.error;

      if (deal.status === "sent") {
        const { error: updErr } = await sb.from("deals").update({ status: "viewed" }).eq("id", deal.id);
        if (!updErr) deal.status = "viewed";
      }

      res.json({
        ...deal,
        options: options.data ?? [],
        milestones: milestones.data ?? [],
        comments: comments.data ?? [],
      });
    })
  );

  app.post(
    "/api/public/deals/:slug/comments",
    requireConfigured,
    wrap(async (req, res) => {
      const input = commentInputSchema.parse(req.body);
      const sb = getSupabase();
      const { data: deal, error } = await sb
        .from("deals")
        .select("id")
        .eq("slug", req.params.slug)
        .maybeSingle();
      if (error) throw error;
      if (!deal) {
        res.status(404).json({ error: "Proposal not found" });
        return;
      }
      const { data: comment, error: insErr } = await sb
        .from("comments")
        .insert({ deal_id: deal.id, author_name: input.author_name, author_role: "client", body: input.body })
        .select()
        .single();
      if (insErr) throw insErr;
      await sb
        .from("events")
        .insert({ deal_id: deal.id, type: "comment", meta: { author_name: input.author_name } });
      res.status(201).json(comment);
    })
  );

  app.post(
    "/api/public/deals/:slug/events",
    requireConfigured,
    wrap(async (req, res) => {
      const input = eventInputSchema.parse(req.body);
      const sb = getSupabase();
      const { data: deal, error } = await sb
        .from("deals")
        .select("id")
        .eq("slug", req.params.slug)
        .maybeSingle();
      if (error) throw error;
      if (!deal) {
        res.status(404).json({ error: "Proposal not found" });
        return;
      }
      const { error: insErr } = await sb
        .from("events")
        .insert({ deal_id: deal.id, type: input.type, meta: input.meta });
      if (insErr) throw insErr;
      res.status(201).json({ ok: true });
    })
  );

  app.post(
    "/api/public/deals/:slug/accept",
    requireConfigured,
    wrap(async (req, res) => {
      const input = acceptInputSchema.parse(req.body);
      const sb = getSupabase();
      const { data: deal, error } = await sb
        .from("deals")
        .select("id")
        .eq("slug", req.params.slug)
        .maybeSingle();
      if (error) throw error;
      if (!deal) {
        res.status(404).json({ error: "Proposal not found" });
        return;
      }

      const { data: updated, error: updErr } = await sb
        .from("deals")
        .update({
          status: "accepted",
          signature_data_url: input.signature_data_url,
          accepted_at: new Date().toISOString(),
        })
        .eq("id", deal.id)
        .select()
        .single();
      if (updErr) throw updErr;

      const { error: evErr } = await sb
        .from("events")
        .insert({ deal_id: deal.id, type: "accept", meta: { selected_options: input.selected_options } });
      if (evErr) throw evErr;

      res.json(updated);
    })
  );

  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof ZodError) {
      res.status(400).json({ error: err.errors.map((e) => e.message).join("; ") });
      return;
    }
    console.error(err);
    res.status(500).json({ error: errorMessage(err) });
  });
}
