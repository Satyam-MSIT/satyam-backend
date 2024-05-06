import { Response, Request, RequestHandler, NextFunction } from "express";

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;

type ErrorHandlerOptions = {
  log?: boolean;
  statusCode?: number;
  onError?: (error: Error, req: Request, res: Response) => any;
  [key: string]: any;
};

function assertIsError(error: unknown): asserts error is Error {
  if (!(error instanceof Error)) throw error;
}

export default function useErrorHandler(cb: AsyncRequestHandler, { log = false, statusCode = 500, onError, ...data }: ErrorHandlerOptions = {}): RequestHandler {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (error) {
      assertIsError(error);
      if (log) console.log(error);
      try {
        res.status(statusCode).json({ success: false, error: "Uh Oh, Something went wrong!", ...data });
        onError?.(error, req, res);
      } catch (error) {
        console.log(error);
      }
    }
  };
}
