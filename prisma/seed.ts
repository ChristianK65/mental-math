import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Domain, PrismaClient } from "../src/generated/prisma";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const patterns = [
  {
    domain: Domain.ADD,
    level: 1,
    description: "1-digit + 1-digit, no carry",
    cutoffTimeMs: 4000,
    params: {
      operation: "ADD",
      leftDigits: 1,
      rightDigits: 1,
      carryCount: 0,
    },
  },
  {
    domain: Domain.ADD,
    level: 2,
    description: "1-digit + 1-digit, with carry",
    cutoffTimeMs: 4000,
    params: {
      operation: "ADD",
      leftDigits: 1,
      rightDigits: 1,
      carryCount: 1,
    },
  },
  {
    domain: Domain.ADD,
    level: 3,
    description: "1-digit + 2-digit, no carry",
    cutoffTimeMs: 4500,
    params: {
      operation: "ADD",
      leftDigits: 1,
      rightDigits: 2,
      carryCount: 0,
    },
  },
  {
    domain: Domain.ADD,
    level: 4,
    description: "1-digit + 2-digit, with carry",
    cutoffTimeMs: 4500,
    params: {
      operation: "ADD",
      leftDigits: 1,
      rightDigits: 2,
      carryCount: 1,
    },
  },
  {
    domain: Domain.ADD,
    level: 5,
    description: "2-digit + 2-digit, no carry",
    cutoffTimeMs: 5000,
    params: {
      operation: "ADD",
      leftDigits: 2,
      rightDigits: 2,
      carryCount: 0,
    },
  },
  {
    domain: Domain.ADD,
    level: 6,
    description: "2-digit + 2-digit, one carry",
    cutoffTimeMs: 5000,
    params: {
      operation: "ADD",
      leftDigits: 2,
      rightDigits: 2,
      carryCount: 1,
    },
  },
  {
    domain: Domain.ADD,
    level: 7,
    description: "2-digit + 2-digit, two carries",
    cutoffTimeMs: 5500,
    params: {
      operation: "ADD",
      leftDigits: 2,
      rightDigits: 2,
      carryCount: 2,
    },
  },
  {
    domain: Domain.ADD,
    level: 8,
    description: "2-digit + 3-digit, no carry",
    cutoffTimeMs: 5500,
    params: {
      operation: "ADD",
      leftDigits: 2,
      rightDigits: 3,
      carryCount: 0,
    },
  },
  {
    domain: Domain.ADD,
    level: 9,
    description: "2-digit + 3-digit, one carry",
    cutoffTimeMs: 6000,
    params: {
      operation: "ADD",
      leftDigits: 2,
      rightDigits: 3,
      carryCount: 1,
    },
  },
  {
    domain: Domain.ADD,
    level: 10,
    description: "3-digit + 3-digit, no carry",
    cutoffTimeMs: 6000,
    params: {
      operation: "ADD",
      leftDigits: 3,
      rightDigits: 3,
      carryCount: 0,
    },
  },
  {
    domain: Domain.MUL,
    level: 1,
    description: "1-digit x 1-digit, no carry",
    cutoffTimeMs: 4000,
    params: {
      operation: "MUL",
      leftDigits: 1,
      rightDigits: 1,
      carryCount: 0,
    },
  },
  {
    domain: Domain.MUL,
    level: 2,
    description: "1-digit x 1-digit, with carry",
    cutoffTimeMs: 4000,
    params: {
      operation: "MUL",
      leftDigits: 1,
      rightDigits: 1,
      carryCount: 1,
    },
  },
  {
    domain: Domain.MUL,
    level: 3,
    description: "1-digit x 2-digit, no carry",
    cutoffTimeMs: 4500,
    params: {
      operation: "MUL",
      leftDigits: 1,
      rightDigits: 2,
      carryCount: 0,
    },
  },
  {
    domain: Domain.MUL,
    level: 4,
    description: "1-digit x 2-digit, with carry",
    cutoffTimeMs: 4500,
    params: {
      operation: "MUL",
      leftDigits: 1,
      rightDigits: 2,
      carryCount: 1,
    },
  },
  {
    domain: Domain.MUL,
    level: 5,
    description: "1-digit x 2-digit, two carries",
    cutoffTimeMs: 5000,
    params: {
      operation: "MUL",
      leftDigits: 1,
      rightDigits: 2,
      carryCount: 2,
    },
  },
  {
    domain: Domain.MUL,
    level: 6,
    description: "1-digit x 3-digit, no carry",
    cutoffTimeMs: 5000,
    params: {
      operation: "MUL",
      leftDigits: 1,
      rightDigits: 3,
      carryCount: 0,
    },
  },
  {
    domain: Domain.MUL,
    level: 7,
    description: "1-digit x 3-digit, one carry",
    cutoffTimeMs: 5500,
    params: {
      operation: "MUL",
      leftDigits: 1,
      rightDigits: 3,
      carryCount: 1,
    },
  },
  {
    domain: Domain.MUL,
    level: 8,
    description: "1-digit x 3-digit, two carries",
    cutoffTimeMs: 5500,
    params: {
      operation: "MUL",
      leftDigits: 1,
      rightDigits: 3,
      carryCount: 2,
    },
  },
  {
    domain: Domain.MUL,
    level: 9,
    description: "1-digit x 3-digit, three carries",
    cutoffTimeMs: 6000,
    params: {
      operation: "MUL",
      leftDigits: 1,
      rightDigits: 3,
      carryCount: 3,
    },
  },
  {
    domain: Domain.MUL,
    level: 10,
    description: "2-digit x 2-digit, no carry",
    cutoffTimeMs: 6000,
    params: {
      operation: "MUL",
      leftDigits: 2,
      rightDigits: 2,
      carryCount: 0,
    },
  },
  {
    domain: Domain.SUB,
    level: 1,
    description: "1-digit - 1-digit, non-negative (no borrow possible)",
    cutoffTimeMs: 4000,
    params: {
      operation: "SUB",
      leftDigits: 1,
      rightDigits: 1,
      borrowCount: 0,
      allowNegative: false,
    },
  },
  {
    domain: Domain.SUB,
    level: 2,
    description: "2-digit - 1-digit, no borrow",
    cutoffTimeMs: 4500,
    params: {
      operation: "SUB",
      leftDigits: 2,
      rightDigits: 1,
      borrowCount: 0,
      allowNegative: false,
    },
  },
  {
    domain: Domain.SUB,
    level: 3,
    description: "2-digit - 1-digit, with borrow (single)",
    cutoffTimeMs: 4500,
    params: {
      operation: "SUB",
      leftDigits: 2,
      rightDigits: 1,
      borrowCount: 1,
      allowNegative: false,
    },
  },
  {
    domain: Domain.SUB,
    level: 4,
    description: "2-digit - 2-digit, no borrow",
    cutoffTimeMs: 5000,
    params: {
      operation: "SUB",
      leftDigits: 2,
      rightDigits: 2,
      borrowCount: 0,
      allowNegative: false,
    },
  },
  {
    domain: Domain.SUB,
    level: 5,
    description: "2-digit - 2-digit, with borrow (single)",
    cutoffTimeMs: 5000,
    params: {
      operation: "SUB",
      leftDigits: 2,
      rightDigits: 2,
      borrowCount: 1,
      allowNegative: false,
    },
  },
  {
    domain: Domain.SUB,
    level: 6,
    description: "3-digit - 1-digit, no borrow",
    cutoffTimeMs: 5000,
    params: {
      operation: "SUB",
      leftDigits: 3,
      rightDigits: 1,
      borrowCount: 0,
      allowNegative: false,
    },
  },
  {
    domain: Domain.SUB,
    level: 7,
    description: "3-digit - 1-digit, with borrow (single)",
    cutoffTimeMs: 5500,
    params: {
      operation: "SUB",
      leftDigits: 3,
      rightDigits: 1,
      borrowCount: 1,
      allowNegative: false,
    },
  },
  {
    domain: Domain.SUB,
    level: 8,
    description: "3-digit - 2-digit, no borrow",
    cutoffTimeMs: 5500,
    params: {
      operation: "SUB",
      leftDigits: 3,
      rightDigits: 2,
      borrowCount: 0,
      allowNegative: false,
    },
  },
  {
    domain: Domain.SUB,
    level: 9,
    description: "3-digit - 2-digit, with borrow (single)",
    cutoffTimeMs: 6000,
    params: {
      operation: "SUB",
      leftDigits: 3,
      rightDigits: 2,
      borrowCount: 1,
      allowNegative: false,
    },
  },
  {
    domain: Domain.SUB,
    level: 10,
    description: "3-digit - 3-digit, no borrow",
    cutoffTimeMs: 6000,
    params: {
      operation: "SUB",
      leftDigits: 3,
      rightDigits: 3,
      borrowCount: 0,
      allowNegative: false,
    },
  },
  {
    domain: Domain.DIV,
    level: 1,
    description: "1-digit / 1-digit, exact integer",
    cutoffTimeMs: 4000,
    params: {
      operation: "DIV",
      dividendDigits: 1,
      divisorDigits: 1,
      exactInteger: true,
      minQuotient: 1,
    },
  },
  {
    domain: Domain.DIV,
    level: 2,
    description: "2-digit / 1-digit, exact integer",
    cutoffTimeMs: 4500,
    params: {
      operation: "DIV",
      dividendDigits: 2,
      divisorDigits: 1,
      exactInteger: true,
      minQuotient: 2,
    },
  },
  {
    domain: Domain.DIV,
    level: 3,
    description: "2-digit / 2-digit, exact integer",
    cutoffTimeMs: 5000,
    params: {
      operation: "DIV",
      dividendDigits: 2,
      divisorDigits: 2,
      exactInteger: true,
      minQuotient: 2,
    },
  },
  {
    domain: Domain.DIV,
    level: 4,
    description: "3-digit / 1-digit, exact integer",
    cutoffTimeMs: 5500,
    params: {
      operation: "DIV",
      dividendDigits: 3,
      divisorDigits: 1,
      exactInteger: true,
      minQuotient: 2,
    },
  },
  {
    domain: Domain.DIV,
    level: 5,
    description: "3-digit / 2-digit, exact integer",
    cutoffTimeMs: 6000,
    params: {
      operation: "DIV",
      dividendDigits: 3,
      divisorDigits: 2,
      exactInteger: true,
      minQuotient: 2,
    },
  },
  {
    domain: Domain.DIV,
    level: 6,
    description: "3-digit / 3-digit, exact integer",
    cutoffTimeMs: 6500,
    params: {
      operation: "DIV",
      dividendDigits: 3,
      divisorDigits: 3,
      exactInteger: true,
      minQuotient: 2,
    },
  },
  {
    domain: Domain.DIV,
    level: 7,
    description: "4-digit / 1-digit, exact integer",
    cutoffTimeMs: 6500,
    params: {
      operation: "DIV",
      dividendDigits: 4,
      divisorDigits: 1,
      exactInteger: true,
      minQuotient: 2,
    },
  },
  {
    domain: Domain.DIV,
    level: 8,
    description: "4-digit / 2-digit, exact integer",
    cutoffTimeMs: 7000,
    params: {
      operation: "DIV",
      dividendDigits: 4,
      divisorDigits: 2,
      exactInteger: true,
      minQuotient: 2,
    },
  },
  {
    domain: Domain.DIV,
    level: 9,
    description: "4-digit / 3-digit, exact integer",
    cutoffTimeMs: 7500,
    params: {
      operation: "DIV",
      dividendDigits: 4,
      divisorDigits: 3,
      exactInteger: true,
      minQuotient: 2,
    },
  },
  {
    domain: Domain.DIV,
    level: 10,
    description: "4-digit / 4-digit, exact integer",
    cutoffTimeMs: 8000,
    params: {
      operation: "DIV",
      dividendDigits: 4,
      divisorDigits: 4,
      exactInteger: true,
      minQuotient: 2,
    },
  },
] as const;

async function main() {
  for (const pattern of patterns) {
    await prisma.pattern.upsert({
      where: {
        domain_level_description: {
          domain: pattern.domain,
          level: pattern.level,
          description: pattern.description,
        },
      },
      update: {
        cutoffTimeMs: pattern.cutoffTimeMs,
        params: pattern.params,
        active: true,
      },
      create: {
        domain: pattern.domain,
        level: pattern.level,
        description: pattern.description,
        cutoffTimeMs: pattern.cutoffTimeMs,
        params: pattern.params,
        active: true,
      },
    });
  }
}

main()
  .catch((error) => {
    console.error("Failed to seed patterns", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });