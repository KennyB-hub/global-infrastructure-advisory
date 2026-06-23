// api/boundary.ts
import { Request, Response } from "express";
import { saveBoundary, getBoundary } from "../../../seven-runtime/cattle/boundary-service";
import { PastureBoundary } from "../../../seven-runtime/cattle/boundary-types";

export async function getPastureBoundaryHandler(req: Request, res: Response) {
  const { pastureId } = req.params;
  const boundary = await getBoundary(pastureId);
  if (!boundary) return res.status(404).json({ error: "Not found" });
  res.json(boundary);
}

export async function setPastureBoundaryHandler(req: Request, res: Response) {
  const body = req.body as PastureBoundary;
  if (!body.pastureId || !body.polygon?.length) {
    return res.status(400).json({ error: "Invalid boundary" });
  }

  const saved = await saveBoundary(body);
  res.json({ success: true, boundary: saved });
}
