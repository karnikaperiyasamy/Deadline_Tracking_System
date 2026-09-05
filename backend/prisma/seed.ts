import { PrismaClient, Priority, Status, Category, RiskLevel, NotificationType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial development database...');

  const demoPassword = await bcrypt.hash('DemoPassword123!', 10);

  const user = await prisma.user.upsert({
    where: { email: 'demo@lifeos.ai' },
    update: {},
    create: {
      email: 'demo@lifeos.ai',
      name: 'Demo Architect',
      passwordHash: demoPassword,
      settings: {
        create: {
          theme: 'dark',
          timezone: 'UTC',
          notificationEmail: true,
          aiPreferences: JSON.stringify({ autoRiskAnalysis: true, style: 'detailed' }),
        },
      },
    },
  });

  console.log(`Created/Verified demo user: ${user.email}`);

  // Create sample tasks
  const now = new Date();
  const sampleTasks = [
    {
      title: 'Submit DBMS Final Term Assignment',
      description: 'Complete Relational Algebra questions & ER Diagram normalization',
      category: Category.ASSIGNMENT,
      priority: Priority.CRITICAL,
      status: Status.TODO,
      dueDate: new Date(now.getTime() + 1000 * 60 * 60 * 18), // 18 hours from now
      estimatedHours: 4,
      riskLevel: RiskLevel.HIGH_RISK,
    },
    {
      title: 'Hackathon Project Pitch Submission',
      description: 'Prepare 5-minute video presentation and upload GitHub repository link',
      category: Category.HACKATHON,
      priority: Priority.HIGH,
      status: Status.IN_PROGRESS,
      dueDate: new Date(now.getTime() + 1000 * 60 * 60 * 48), // 2 days from now
      estimatedHours: 6,
      riskLevel: RiskLevel.MEDIUM_RISK,
    },
    {
      title: 'Software Engineer Internship Application',
      description: 'Tailor resume for backend role and submit portal application',
      category: Category.INTERNSHIP,
      priority: Priority.HIGH,
      status: Status.COMPLETED,
      dueDate: new Date(now.getTime() - 1000 * 60 * 60 * 24), // yesterday
      completedAt: new Date(now.getTime() - 1000 * 60 * 60 * 10),
      estimatedHours: 2,
      riskLevel: RiskLevel.LOW_RISK,
    },
    {
      title: 'Midterm Physics Exam',
      description: 'Review Quantum Mechanics chapters 4 to 8 and solve previous years papers',
      category: Category.EXAM,
      priority: Priority.CRITICAL,
      status: Status.TODO,
      dueDate: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 4), // 4 days from now
      estimatedHours: 12,
      riskLevel: RiskLevel.CRITICAL_RISK,
    },
  ];

  for (const t of sampleTasks) {
    await prisma.task.create({
      data: {
        userId: user.id,
        ...t,
      },
    });
  }

  // Create sample notifications
  await prisma.notification.create({
    data: {
      userId: user.id,
      title: 'Critical Deadline Approaching',
      message: 'DBMS Final Term Assignment is due in less than 18 hours!',
      type: NotificationType.DEADLINE_APPROACHING,
      read: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: user.id,
      title: 'AI Priority Advice',
      message: 'Physics Exam requires 12 estimated hours of studying. Schedule study blocks early!',
      type: NotificationType.AI_RECOMMENDATION,
      read: false,
    },
  });

  console.log('Development database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
