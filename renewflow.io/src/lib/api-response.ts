import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "./errors";

/**
 * Wrap an API route handler with error handling.
 */
export function withErrorHandler(
  handler: (...args: unknown[]) => Promise<NextResponse>,
) {
  return async (...args: unknown[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      if (error instanceof AppError) {
        return NextResponse.json(
          { error: error.code, message: error.message },
          { status: error.statusCode },
        );
      }
      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            error: "VALIDATION_ERROR",
            message: "Invalid request",
            details: error.errors.map((e) => ({
              path: e.path.join("."),
              message: e.message,
            })),
          },
          { status: 400 },
        );
      }
      console.error("Unhandled error:", error);
      return NextResponse.json(
        { error: "INTERNAL_ERROR", message: "Internal server error" },
        { status: 500 },
      );
    }
  };
}
