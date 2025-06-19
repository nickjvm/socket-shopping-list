import { v4 as uuid } from "uuid";
import { faker } from "@faker-js/faker";

import db from "./index.js";
import { items, lists } from "../../drizzle/schema.js";
import { CATEGORIES } from "../app/constants.js";

async function main() {
  const listIds = [uuid(), uuid()];

  await db.insert(lists).values(
    listIds.map((id) => ({
      id,
      name: faker.commerce.department(),
      createdAt: faker.date.past().getTime(),
    }))
  );

  for (let i = 0; i < listIds.length; i++) {
    const listId = listIds[i];
    const itemCount = faker.number.int({ min: 5, max: 15 });

    const itemsData = Array.from({ length: itemCount }, () => ({
      id: uuid(),
      listId,
      name: faker.commerce.productName(),
      category: faker.helpers.arrayElement(CATEGORIES),
      createdAt: faker.date.past().getTime(),
      quantity: faker.number.int({ min: 1, max: 10 }),
      details: faker.lorem.sentence(),
      completedAt: faker.datatype.boolean()
        ? null
        : faker.date.past().getTime(),
      index: faker.number.int({ min: 0, max: 999999999 }),
    }));

    await db.insert(items).values(itemsData);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
