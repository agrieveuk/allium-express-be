const {
  formatValues,
  makeLookup,
  updateKeyValue,
  renameKeys,
} = require("../db/utils/data-manipulation");

describe("formatValues", () => {
  const cols = ["c", "b", "a"];
  const arrayOfObjects = [
    { a: 3, b: 2, c: 1 },
    { a: 1, b: 2, c: 3 },
  ];
  it("should make an array of objects into an array of arrays containing values from the object in a given order", () => {
    expect(formatValues(arrayOfObjects, cols)).toEqual([
      [1, 2, 3],
      [3, 2, 1],
    ]);
  });
  it("returned array has different reference to original array", () => {
    expect(formatValues(arrayOfObjects, cols)).not.toBe(arrayOfObjects);
  });
  it("an object in array has different reference to original object", () => {
    expect(formatValues(arrayOfObjects, cols)[0]).not.toBe(arrayOfObjects[0]);
  });
  it("original object in array is not mutated", () => {
    const original = [
      { a: 3, b: 2, c: 1 },
      { a: 1, b: 2, c: 3 },
    ];
    formatValues(original, cols);
    expect(original[0]).toEqual({ a: 3, b: 2, c: 1 });
    expect(original[1]).toEqual({ a: 1, b: 2, c: 3 });
  });
});
describe("makeLookup", () => {
  const testData = [
    {
      shop_id: 55,
      shop_name: "Mills - Bashirian",
      owner: "Whitney",
      slogan: "Self-enabling 6th generation moratorium",
    },
    {
      shop_id: 56,
      shop_name: "Gorczany, Erdman and West",
      owner: "America",
      slogan: "Cloned context-sensitive migration",
    },
  ];
  test("Returns a new array", () => {
    expect(makeLookup(testData, "shop_name", "shop_id")).not.toBe(testData);
  });
  test("Does not mutate original array", () => {
    makeLookup(testData, "shop_name", "shop_id");
    expect(testData).toEqual([
      {
        shop_id: 55,
        shop_name: "Mills - Bashirian",
        owner: "Whitney",
        slogan: "Self-enabling 6th generation moratorium",
      },
      {
        shop_id: 56,
        shop_name: "Gorczany, Erdman and West",
        owner: "America",
        slogan: "Cloned context-sensitive migration",
      },
    ]);
  });
  test("Object within new array has different reference to original", () => {
    expect(makeLookup(testData, "shop_name", "shop_id")[0]).not.toBe(
      testData[0]
    );
  });
  test("should create lookup object with shop name and id", () => {
    expect(makeLookup(testData, "shop_name", "shop_id")).toEqual({
      "Mills - Bashirian": 55,
      "Gorczany, Erdman and West": 56,
    });
  });
});
describe("updateKeyValue", () => {
  const testShops = [
    {
      shop_id: 55,
      shop_name: "Mills - Bashirian",
      owner: "Whitney",
      slogan: "Self-enabling 6th generation moratorium",
    },
    {
      shop_id: 56,
      shop_name: "Gorczany, Erdman and West",
      owner: "America",
      slogan: "Cloned context-sensitive migration",
    },
  ];
  const lookup = makeLookup(testShops, "shop_name", "shop_id");
  const testTreasures = [
    {
      treasure_name: "Progressive Incredible Concrete Cheese",
      colour: "salmon",
      age: 271,
      cost_at_auction: 72262,
      shop: "Mills - Bashirian",
    },
    {
      treasure_name: "Organic Sleek Wooden Keyboard",
      colour: "pink",
      age: 735,
      cost_at_auction: 19615,
      shop: "Gorczany, Erdman and West",
    },
  ];
  it("should replace the shop key with shop_id and the relevant id from the lookup", () => {
    expect(updateKeyValue(testTreasures, "shop", "shop_id", lookup)).toEqual([
      {
        treasure_name: "Progressive Incredible Concrete Cheese",
        colour: "salmon",
        age: 271,
        cost_at_auction: 72262,
        shop_id: 55,
      },
      {
        treasure_name: "Organic Sleek Wooden Keyboard",
        colour: "pink",
        age: 735,
        cost_at_auction: 19615,
        shop_id: 56,
      },
    ]);
  });
  it("returned array has different reference to original array", () => {
    expect(updateKeyValue(testTreasures, "shop", "shop_id", lookup)).not.toBe(
      testTreasures
    );
  });
  it("an object in array has different reference to original object", () => {
    expect(
      updateKeyValue(testTreasures, "shop", "shop_id", lookup)[0]
    ).not.toBe(testTreasures[0]);
  });
  it("original object in array is not mutated", () => {
    const treasures = [
      {
        shop: "myShop",
      },
    ];
    updateKeyValue(treasures, "shop", "shop_id", lookup);
    expect(treasures[0]).toEqual({
      shop: "myShop",
    });
  });
  it("works for multiple objects and does not mutate any", () => {
    expect(
      updateKeyValue(testTreasures, "shop", "shop_id", lookup)[0]
    ).not.toBe(testTreasures[0]);
    expect(
      updateKeyValue(testTreasures, "shop", "shop_id", lookup)[1]
    ).not.toBe(testTreasures[1]);
    expect(testTreasures).toEqual([
      {
        treasure_name: "Progressive Incredible Concrete Cheese",
        colour: "salmon",
        age: 271,
        cost_at_auction: 72262,
        shop: "Mills - Bashirian",
      },
      {
        treasure_name: "Organic Sleek Wooden Keyboard",
        colour: "pink",
        age: 735,
        cost_at_auction: 19615,
        shop: "Gorczany, Erdman and West",
      },
    ]);
  });
});
describe("renameKeys", () => {
  it("returns a new empty array, when passed an empty array", () => {
    const array = [];
    const keyToChange = "";
    const newKey = "";
    const actual = renameKeys(array, keyToChange, newKey);
    const expected = [];
    expect(actual).toEqual(expected);
    expect(actual).not.toBe(array);
  });
  it("should take an array of objects having a certain key and rename that key", () => {
    const books = [
      { title: "Slaughterhouse-Five", writtenBy: "Kurt Vonnegut" },
      {
        title: "Blood Meridian",
        genre: "anti-western",
        writtenBy: "change my key",
      },
    ];
    const keyToChange = "writtenBy";
    const newKey = "author";
    const expected = [
      { title: "Slaughterhouse-Five", author: "Kurt Vonnegut" },
      {
        title: "Blood Meridian",
        genre: "anti-western",
        author: "change my key",
      },
    ];
    expect(renameKeys(books, keyToChange, newKey)).toEqual(expected);
  });
  it("returned array has different reference to original array", () => {
    const dogs = [{ name: "Otis" }];
    expect(renameKeys(dogs, "name", "id")).not.toBe(dogs);
  });
  it("an object in array has different reference to original object", () => {
    const dogs = [{ name: "Otis" }];
    expect(renameKeys(dogs, "name", "id")[0]).not.toBe(dogs[0]);
  });
  it("original object in array is not mutated", () => {
    const dogs = [{ name: "Otis" }];
    renameKeys(dogs, "name", "id");
    expect(dogs[0]).toEqual({ name: "Otis" });
  });
  it("works for multiple objects and does not mutate any", () => {
    const dogs = [{ name: "Otis" }, { name: "Boris", fluffy: true }];
    expect(renameKeys(dogs, "name", "id")[0]).not.toBe(dogs[0]);
    expect(renameKeys(dogs, "fluffy", "puffy")[1]).toEqual({
      name: "Boris",
      puffy: true,
    });
    expect(renameKeys(dogs, "name", "title")[1]).not.toBe(dogs[1]);
    expect(dogs).toEqual([{ name: "Otis" }, { name: "Boris", fluffy: true }]);
  });
});
