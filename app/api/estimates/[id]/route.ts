import { NextResponse } from "next/server";
import initialDb from "../../../../data/db.json";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();

    const estimates = initialDb.estimates || [];
    const index = estimates.findIndex((e: any) => e.id === id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: "Estimate record not found" },
        { status: 404 }
      );
    }

    const current = estimates[index];
    const newAreaHa = body.area_hectares ?? current.area_hectares;
    const newYield = body.yield_mt_ha ?? current.yield_mt_ha;

    const updated = {
      ...current,
      area_hectares: newAreaHa,
      area_bighas: Math.round(newAreaHa * 7.47),
      yield_mt_ha: newYield,
      yield_uncertainty_ci95_lower:
        body.yield_uncertainty_ci95_lower ?? current.yield_uncertainty_ci95_lower,
      yield_uncertainty_ci95_upper:
        body.yield_uncertainty_ci95_upper ?? current.yield_uncertainty_ci95_upper,
      production_mt: Math.round(newAreaHa * newYield),
      approval_stage: body.approval_stage ?? current.approval_stage,
      updated_by: body.updated_by ?? current.updated_by,
      notes: body.notes ?? current.notes,
      last_updated: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: "Estimate calibrated and reconciled successfully",
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
