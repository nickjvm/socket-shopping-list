import { v4 as uuid } from "uuid";
import { faker } from "@faker-js/faker";

import db from "./index.js";
import { items, lists } from "../../drizzle/schema.js";

async function main() {
  const listIds = [uuid(), uuid()];

  await db.insert(lists).values(
    listIds.map((id) => ({
      id,
      name: faker.commerce.department(),
    }))
  );

  for (let i = 0; i < listIds.length; i++) {
    const listId = listIds[i];
    const itemCount = faker.number.int({ min: 5, max: 15 });

    const itemsData = Array.from({ length: itemCount }, () => ({
      id: uuid(),
      name: faker.commerce.productName(),
      category: faker.helpers.arrayElement([
        "Produce",
        "Meat & Seafood",
        "Bakery",
        "Canned Goods",
        "Beverages",
        "Dairy",
        "Snacks",
        "Pantry Items",
        "Frozen Foods",
        "Household",
        "Personal Care",
        "Baby",
        "Pet Care",
        "Clothing",
        "Other",
      ]),
      dateAdded: faker.date.past().getTime(),
      quantity: faker.number.int({ min: 1, max: 10 }),
      details: faker.lorem.sentence(),
      listId,
    }));

    await db.insert(items).values(itemsData);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
