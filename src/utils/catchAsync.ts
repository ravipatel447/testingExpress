import { Request, Response, NextFunction } from "express";
export function catchAsync(fn: any): any {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}
