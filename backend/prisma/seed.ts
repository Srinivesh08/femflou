import { PrismaClient, BiomarkerType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const curves = [
    {
      biomarkerType: BiomarkerType.ALBUMIN,
      dataPoints: [
        { concentration: 0, intensity: 10 },
        { concentration: 10, intensity: 25 },
        { concentration: 30, intensity: 50 },
        { concentration: 100, intensity: 110 },
        { concentration: 300, intensity: 250 }
      ],
      regressionSlope: 0.81,
      regressionIntercept: 15.2,
      rSquared: 0.991
    },
    {
      biomarkerType: BiomarkerType.GLUCOSE,
      dataPoints: [
        { concentration: 0, intensity: 5 },
        { concentration: 50, intensity: 45 },
        { concentration: 100, intensity: 90 },
        { concentration: 250, intensity: 220 },
        { concentration: 500, intensity: 440 }
      ],
      regressionSlope: 0.88,
      regressionIntercept: 4.5,
      rSquared: 0.985
    },
    {
      biomarkerType: BiomarkerType.KETONES,
      dataPoints: [
        { concentration: 0, intensity: 12 },
        { concentration: 5, intensity: 30 },
        { concentration: 15, intensity: 70 },
        { concentration: 40, intensity: 150 },
        { concentration: 80, intensity: 240 }
      ],
      regressionSlope: 2.85,
      regressionIntercept: 18.0,
      rSquared: 0.978
    },
    {
      biomarkerType: BiomarkerType.LEUKOCYTE_ESTERASE,
      dataPoints: [
        { concentration: 0, intensity: 8 },
        { concentration: 15, intensity: 35 },
        { concentration: 70, intensity: 120 },
        { concentration: 125, intensity: 200 },
        { concentration: 500, intensity: 520 }
      ],
      regressionSlope: 1.05,
      regressionIntercept: 22.4,
      rSquared: 0.965
    },
    {
      biomarkerType: BiomarkerType.NITRITE,
      dataPoints: [
        { concentration: 0, intensity: 2 },
        { concentration: 0.05, intensity: 40 },
        { concentration: 0.1, intensity: 85 },
        { concentration: 0.5, intensity: 220 },
        { concentration: 1.0, intensity: 410 }
      ],
      regressionSlope: 405.2,
      regressionIntercept: 15.1,
      rSquared: 0.989
    },
    {
      biomarkerType: BiomarkerType.PH,
      dataPoints: [
        { concentration: 5.0, intensity: 10 },
        { concentration: 6.0, intensity: 50 },
        { concentration: 6.5, intensity: 120 },
        { concentration: 7.0, intensity: 180 },
        { concentration: 8.0, intensity: 250 },
        { concentration: 9.0, intensity: 310 }
      ],
      regressionSlope: 65.4,
      regressionIntercept: -320.5,
      rSquared: 0.992
    }
  ];

  for (const curve of curves) {
    await prisma.calibrationCurve.upsert({
      where: { id: curve.biomarkerType }, // We'll just generate an ID or find first
      update: {},
      create: curve,
    }).catch(async () => {
      // Upsert failed because we don't have a unique constraint on biomarkerType (wait, schema doesn't have @unique on biomarkerType!)
      // Let's just delete existing and create to be safe
      await prisma.calibrationCurve.deleteMany({ where: { biomarkerType: curve.biomarkerType } });
      await prisma.calibrationCurve.create({ data: curve });
    });
  }

  console.log('✅ Seeded 6 calibration curves.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
