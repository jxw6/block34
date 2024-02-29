const {
  client,
  createTables,
  createCustomer,
  createRestaurant,
  fetchCustomers,
  fetchRestaurants,
  createReservation,
  fetchReservations,
  destroyReservation
} = require("./db");

const express = require("express");
const app = express();

app.get("/api/customers", async (req, res, next) => {
  try {
    res.send(await fetchCustomers());
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/restaurants", async (req, res, next) => {
  try {
    res.send(await fetchRestaurants());
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/reservations", async (req, res, next) => {
  try {
    res.send(await fetchReservations());
  } catch (ex) {
    next(ex);
  }
});

app.delete("/api/reservations/:id", async (req, res, next) => {
  try {
    await destroyReservation(req.params.id);
    res.sendStatus(204);
  } catch (ex) {
    next(ex);
  }
});

app.post("/api/reservations", async (req, res, next) => {
  try {
    res.status(201).send(await createReservation(req.body));
  } catch (ex) {
    next(ex);
  }
});

const init = async () => {
  await client.connect();
  console.log("connected to database");
  await createTables();
  console.log("created tables");
  const [joe, luma, pie, Buca, HoneyPig, SushiSue] = await Promise.all([
    createCustomer("joe"),
    createCustomer("luma"),
    createCustomer("pie"),
    createRestaurant("Buca"),
    createRestaurant("HoneyPig"),
    createRestaurant("SushiSue"),
  ]);
  console.log(`joe id: ${joe.id}`);
  console.log(`HoneyPig id: ${HoneyPig.id}`);
  console.log(await fetchCustomers());
  console.log(await fetchRestaurants());

  await Promise.all([
    createReservation({
      reservation_date: "03/14/2024",
      party_count: 6,
      restaurant_id: HoneyPig.id,
      customer_id: joe.id,
    }),
    createReservation({
      reservation_date: "04/14/2024",
      party_count: 3,
      restaurant_id: Buca.id,
      customer_id: joe.id,
    }),
    createReservation({
      reservation_date: "03/14/2024",
      party_count: 12,
      restaurant_id: SushiSue.id,
      customer_id: luma.id,
    }),
    createReservation({
      reservation_date: "03/14/2024",
      party_count: 2,
      restaurant_id: HoneyPig.id,
      customer_id: pie.id,
    }),
  ]);
  let reservations = await fetchReservations();
  console.log(await fetchReservations());
  await destroyReservation(reservations[0].id);
  console.log(`---- Vacation ${reservations[0].id} Deleted ----`);
  console.log(await fetchReservations());

  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`listening on ${port}`));
};

init();
