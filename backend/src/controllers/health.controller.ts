import { Request, Response } from 'express';

export const getHealthStatus = (req: Request, res: Response) => {
  return res.status(200).json({
    status: 'ok',
    service: 'LifeOS API',
    timestamp: new Date().toISOString(),
  });
};
