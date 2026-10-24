import app from "./app.mjs";
app.listen(Number(process.env.PORT) || 3001, "0.0.0.0", () =>
  console.log("Aladdin demo API on port " + (process.env.PORT || 3001)),
);
