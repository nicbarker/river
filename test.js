function fetch(url) {
  return Promise.resolve({
    designId: 1,
    shapes: [
      { shapeId: "basic-shape", color: { r: 55, g: 40, b: 255 }, children: [] },
      {
        shapeId: "duck",
        color: { r: 255, g: 255, b: 252 },
        children: [
          {
            shapeId: "duck-bill",
            color: { r: 255, g: 255, b: 255 },
            children: [],
          },
          {
            shapeId: "duck-body",
            color: { r: 205, g: 255, b: 252 },
            children: [],
          },
          {
            shapeId: "duck-legs",
            color: { r: 100, g: 255, b: 252 },
            children: [],
          },
        ],
      },
      {
        shapeId: "zigzag-polygon",
        color: { r: 205, g: 255, b: 252 },
        children: [],
      },
      {
        shapeId: "fish",
        color: { r: 205, g: 255, b: 252 },
        children: [
          {
            shapeId: "fish-eyes",
            color: { r: 255, g: 255, b: 255 },
            children: [],
          },
          {
            shapeId: "fish-fin",
            color: { r: 100, g: 66, b: 74 },
            children: [
              {
                shapeId: "fish-fin-part-1",
                color: { r: 93, g: 54, b: 55 },
                children: [],
              },
              {
                shapeId: "fish-fin-part-2",
                color: { r: 33, g: 255, b: 255 },
                children: [],
              },
              {
                shapeId: "fish-fin-part-3",
                color: { r: 128, g: 53, b: 255 },
                children: [],
              },
            ],
          },
          {
            shapeId: "fish-tail",
            color: { r: 255, g: 5, b: 255 },
            children: [],
          },
        ],
      },
      {
        shapeId: "duck",
        color: { r: 255, g: 255, b: 252 },
        children: [
          {
            shapeId: "duck-bill",
            color: { r: 255, g: 255, b: 255 },
            children: [],
          },
          {
            shapeId: "duck-body",
            color: { r: 205, g: 255, b: 252 },
            children: [],
          },
          {
            shapeId: "duck-legs",
            color: { r: 100, g: 255, b: 252 },
            children: [],
          },
        ],
      },
    ],
  });
}

async function run() {
  const data = await fetch("url");
  let toVisit = data.shapes;
  let visited = 0;
  let current = toVisit.pop();
  const average = { r: 0, g: 0, b: 0 };
  while (current) {
    toVisit.push(...current.children);
    average.r += current.color.r;
    average.g += current.color.g;
    average.b += current.color.b;
    visited++;
    current = toVisit.pop();
  }
  average.r /= visited;
  average.g /= visited;
  average.b /= visited;
  console.log("Design 1:", average);
}

run();
