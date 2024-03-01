const request = require("supertest");
const app = require("../app");
const db = require("../db");

let testCompany;
let testInvoice;
beforeEach(async () => {
  const companyResult = await db.query(
    `INSERT INTO companies (code, name, description) VALUES('int', 'intel', 'we are opening a plant in south east ohio!') RETURNING *`
  );
  testCompany = companyResult.rows[0];
  const invoiceResult = await db.query(
    `INSERT INTO invoices (comp_code, amt) VALUES ('int', 400) RETURNING *`
  );
  testInvoice = invoiceResult.rows[0];
});

afterEach(async () => {
  await db.query(`DELETE FROM companies`);
  await db.query(`DELETE FROM invoices`);
});

afterAll(async () => {
  await db.end();
});

describe("GET /invoices", () => {
  test("Get a list of invoices", async () => {
    const res = await request(app).get("/invoices");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("invoices");
  });
});

describe("GET /invoices/:id", () => {
  test("Gets a single invoice", async () => {
    const res = await request(app).get(`/invoices/${testInvoice.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("invoice");
  });

  test("Responds with 404 for non-existing invoice", async () => {
    const res = await request(app).get("/invoices/999");
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("error");
  });
});

describe("POST /", function () {
  test("It should add invoice", async function () {
    const response = await request(app)
      .post("/invoices")
      .send({ amt: 400, comp_code: "int" });

    expect(response.body).toEqual({
      invoice: {
        id: expect.any(Number),
        comp_code: "int",
        amt: 400,
        add_date: expect.any(String),
        paid: false,
        paid_date: null,
      },
    });
  });
});

describe("PUT /invoices/:id", () => {
  test("Updates an existing invoice", async () => {
    const updatedInfo = {
      amt: 600,
    };

    const res = await request(app)
      .put(`/invoices/${testInvoice.id}`)
      .send(updatedInfo)
      .expect(200);

    expect(res.body).toHaveProperty("invoice");
    expect(res.body.invoice.amt).toBe(updatedInfo.amt);
  });

  test("Responds with 404 for non-existing invoice", async () => {
    const updatedInfo = {
      amt: 600,
    };

    const res = await request(app)
      .put("/invoices/999")
      .send(updatedInfo)
      .expect(404);

    expect(res.body).toHaveProperty("error");
    expect(res.body.error.message).toContain(
      "Can't update invoice with id number of 999"
    );
  });
});

describe("DELETE /invoices/:id", () => {
  test("Deletes an existing invoice", async () => {
    const res = await request(app)
      .delete(`/invoices/${testInvoice.id}`)
      .expect(200);
    expect(res.body).toEqual({ msg: "DELETED!" });
  });
});
