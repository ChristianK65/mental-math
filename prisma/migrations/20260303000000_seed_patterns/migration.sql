-- Seed reference data for pattern table.
-- Uses ON CONFLICT DO UPDATE so this is safe to re-run (idempotent).
-- The unique constraint is (domain, level, description).

INSERT INTO "pattern" (id, domain, level, description, params, "cutoffTimeMs", active, "createdAt", "updatedAt")
VALUES
  -- ADD
  (gen_random_uuid()::text, 'ADD'::"domain", 1,  '1-digit + 1-digit, no carry',       '{"operation":"ADD","leftDigits":1,"rightDigits":1,"carryCount":0}',  4000, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'ADD'::"domain", 2,  '1-digit + 1-digit, with carry',      '{"operation":"ADD","leftDigits":1,"rightDigits":1,"carryCount":1}',  4000, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'ADD'::"domain", 3,  '1-digit + 2-digit, no carry',        '{"operation":"ADD","leftDigits":1,"rightDigits":2,"carryCount":0}',  4500, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'ADD'::"domain", 4,  '1-digit + 2-digit, with carry',      '{"operation":"ADD","leftDigits":1,"rightDigits":2,"carryCount":1}',  4500, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'ADD'::"domain", 5,  '2-digit + 2-digit, no carry',        '{"operation":"ADD","leftDigits":2,"rightDigits":2,"carryCount":0}',  5000, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'ADD'::"domain", 6,  '2-digit + 2-digit, one carry',       '{"operation":"ADD","leftDigits":2,"rightDigits":2,"carryCount":1}',  5000, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'ADD'::"domain", 7,  '2-digit + 2-digit, two carries',     '{"operation":"ADD","leftDigits":2,"rightDigits":2,"carryCount":2}',  5500, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'ADD'::"domain", 8,  '2-digit + 3-digit, no carry',        '{"operation":"ADD","leftDigits":2,"rightDigits":3,"carryCount":0}',  5500, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'ADD'::"domain", 9,  '2-digit + 3-digit, one carry',       '{"operation":"ADD","leftDigits":2,"rightDigits":3,"carryCount":1}',  6000, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'ADD'::"domain", 10, '3-digit + 3-digit, no carry',        '{"operation":"ADD","leftDigits":3,"rightDigits":3,"carryCount":0}',  6000, true, NOW(), NOW()),
  -- MUL
  (gen_random_uuid()::text, 'MUL'::"domain", 1,  '1-digit x 1-digit, no carry',        '{"operation":"MUL","leftDigits":1,"rightDigits":1,"carryCount":0}',  4000, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'MUL'::"domain", 2,  '1-digit x 1-digit, with carry',      '{"operation":"MUL","leftDigits":1,"rightDigits":1,"carryCount":1}',  4000, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'MUL'::"domain", 3,  '1-digit x 2-digit, no carry',        '{"operation":"MUL","leftDigits":1,"rightDigits":2,"carryCount":0}',  4500, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'MUL'::"domain", 4,  '1-digit x 2-digit, with carry',      '{"operation":"MUL","leftDigits":1,"rightDigits":2,"carryCount":1}',  4500, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'MUL'::"domain", 5,  '1-digit x 2-digit, two carries',     '{"operation":"MUL","leftDigits":1,"rightDigits":2,"carryCount":2}',  5000, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'MUL'::"domain", 6,  '1-digit x 3-digit, no carry',        '{"operation":"MUL","leftDigits":1,"rightDigits":3,"carryCount":0}',  5000, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'MUL'::"domain", 7,  '1-digit x 3-digit, one carry',       '{"operation":"MUL","leftDigits":1,"rightDigits":3,"carryCount":1}',  5500, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'MUL'::"domain", 8,  '1-digit x 3-digit, two carries',     '{"operation":"MUL","leftDigits":1,"rightDigits":3,"carryCount":2}',  5500, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'MUL'::"domain", 9,  '1-digit x 3-digit, three carries',   '{"operation":"MUL","leftDigits":1,"rightDigits":3,"carryCount":3}',  6000, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'MUL'::"domain", 10, '2-digit x 2-digit, no carry',        '{"operation":"MUL","leftDigits":2,"rightDigits":2,"carryCount":0}',  6000, true, NOW(), NOW()),
  -- SUB
  (gen_random_uuid()::text, 'SUB'::"domain", 1,  '1-digit - 1-digit, non-negative (no borrow possible)', '{"operation":"SUB","leftDigits":1,"rightDigits":1,"borrowCount":0,"allowNegative":false}', 4000, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'SUB'::"domain", 2,  '2-digit - 1-digit, no borrow',       '{"operation":"SUB","leftDigits":2,"rightDigits":1,"borrowCount":0,"allowNegative":false}', 4500, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'SUB'::"domain", 3,  '2-digit - 1-digit, with borrow (single)', '{"operation":"SUB","leftDigits":2,"rightDigits":1,"borrowCount":1,"allowNegative":false}', 4500, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'SUB'::"domain", 4,  '2-digit - 2-digit, no borrow',       '{"operation":"SUB","leftDigits":2,"rightDigits":2,"borrowCount":0,"allowNegative":false}', 5000, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'SUB'::"domain", 5,  '2-digit - 2-digit, with borrow (single)', '{"operation":"SUB","leftDigits":2,"rightDigits":2,"borrowCount":1,"allowNegative":false}', 5000, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'SUB'::"domain", 6,  '3-digit - 1-digit, no borrow',       '{"operation":"SUB","leftDigits":3,"rightDigits":1,"borrowCount":0,"allowNegative":false}', 5000, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'SUB'::"domain", 7,  '3-digit - 1-digit, with borrow (single)', '{"operation":"SUB","leftDigits":3,"rightDigits":1,"borrowCount":1,"allowNegative":false}', 5500, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'SUB'::"domain", 8,  '3-digit - 2-digit, no borrow',       '{"operation":"SUB","leftDigits":3,"rightDigits":2,"borrowCount":0,"allowNegative":false}', 5500, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'SUB'::"domain", 9,  '3-digit - 2-digit, with borrow (single)', '{"operation":"SUB","leftDigits":3,"rightDigits":2,"borrowCount":1,"allowNegative":false}', 6000, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'SUB'::"domain", 10, '3-digit - 3-digit, no borrow',       '{"operation":"SUB","leftDigits":3,"rightDigits":3,"borrowCount":0,"allowNegative":false}', 6000, true, NOW(), NOW()),
  -- DIV
  (gen_random_uuid()::text, 'DIV'::"domain", 1,  '1-digit / 1-digit, exact integer',   '{"operation":"DIV","dividendDigits":1,"divisorDigits":1,"exactInteger":true,"minQuotient":1}', 4000, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'DIV'::"domain", 2,  '2-digit / 1-digit, exact integer',   '{"operation":"DIV","dividendDigits":2,"divisorDigits":1,"exactInteger":true,"minQuotient":2}', 4500, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'DIV'::"domain", 3,  '2-digit / 2-digit, exact integer',   '{"operation":"DIV","dividendDigits":2,"divisorDigits":2,"exactInteger":true,"minQuotient":2}', 5000, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'DIV'::"domain", 4,  '3-digit / 1-digit, exact integer',   '{"operation":"DIV","dividendDigits":3,"divisorDigits":1,"exactInteger":true,"minQuotient":2}', 5500, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'DIV'::"domain", 5,  '3-digit / 2-digit, exact integer',   '{"operation":"DIV","dividendDigits":3,"divisorDigits":2,"exactInteger":true,"minQuotient":2}', 6000, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'DIV'::"domain", 6,  '3-digit / 3-digit, exact integer',   '{"operation":"DIV","dividendDigits":3,"divisorDigits":3,"exactInteger":true,"minQuotient":2}', 6500, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'DIV'::"domain", 7,  '4-digit / 1-digit, exact integer',   '{"operation":"DIV","dividendDigits":4,"divisorDigits":1,"exactInteger":true,"minQuotient":2}', 6500, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'DIV'::"domain", 8,  '4-digit / 2-digit, exact integer',   '{"operation":"DIV","dividendDigits":4,"divisorDigits":2,"exactInteger":true,"minQuotient":2}', 7000, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'DIV'::"domain", 9,  '4-digit / 3-digit, exact integer',   '{"operation":"DIV","dividendDigits":4,"divisorDigits":3,"exactInteger":true,"minQuotient":2}', 7500, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'DIV'::"domain", 10, '4-digit / 4-digit, exact integer',   '{"operation":"DIV","dividendDigits":4,"divisorDigits":4,"exactInteger":true,"minQuotient":2}', 8000, true, NOW(), NOW())
ON CONFLICT (domain, level, description) DO UPDATE SET
  "cutoffTimeMs" = EXCLUDED."cutoffTimeMs",
  params         = EXCLUDED.params,
  active         = EXCLUDED.active,
  "updatedAt"    = NOW();
