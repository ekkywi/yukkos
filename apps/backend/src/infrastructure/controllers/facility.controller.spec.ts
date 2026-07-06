import { FacilityController } from './facility.controller';
import type { PrismaService } from '../database/prisma/prisma.service';

describe('FacilityController', () => {
  it('returns master facilities ordered by name', async () => {
    const prismaMock = {
      facility: {
        findMany: jest.fn().mockResolvedValue([
          { id: 2, name: 'AC' },
          { id: 1, name: 'WiFi' },
        ]),
      },
    } as unknown as PrismaService;

    const controller = new FacilityController(prismaMock);
    const result = await controller.findAll();

    expect(prismaMock.facility.findMany).toHaveBeenCalledWith({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
      },
    });
    expect(result).toEqual({
      success: true,
      count: 2,
      data: [
        { id: 2, name: 'AC' },
        { id: 1, name: 'WiFi' },
      ],
    });
  });
});
