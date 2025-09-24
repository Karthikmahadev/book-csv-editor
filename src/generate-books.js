import { faker } from "@faker-js/faker";
import fs from "fs";

const rows = [];
rows.push("Title,Author,Genre,PublishedYear,ISBN");

for (let i = 0; i < 10000; i++) {
  const title = faker.lorem.words(3);
  const author = faker.person.fullName();
  const genre = faker.helpers.arrayElement([
    "Fiction",
    "Non-Fiction",
    "Fantasy",
    "Mystery",
    "Thriller",
    "Romance",
    "Science Fiction",
    "Biography",
  ]);
  const year = faker.number.int({ min: 1950, max: 2025 });
  const isbn = faker.string.numeric(13); // ✅ updated for faker v8+
  rows.push(`${title},${author},${genre},${year},${isbn}`);
}

fs.writeFileSync("books.csv", rows.join("\n"));
console.log("✅ books.csv with 10,000 rows generated");
