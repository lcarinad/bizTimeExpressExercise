process.env.NODE_ENV = "test";

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
    `INSERT INTO invoices (comp_code, amt, paid, paid_date) VALUES ('int', 400, false, null) RETURNING *`
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

describe("GET /companies", () => {
  test("Get a list of companies", async () => {
    const res = await request(app).get("/companies");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ companies: [testCompany] });
  });
});

describe("GET /companies/:code", () => {
  test("Gets a single company", async () => {
    const res = await request(app).get(`/companies/${testCompany.code}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      company: {
        code: testCompany.code,
        name: testCompany.name,
        description: testCompany.description,
        invoices: [testInvoice.id],
      },
    });
  });
  test("Responds with 404 for invalid id", async () => {
    const res = await request(app).get(`/companies/10`);
    expect(res.statusCode).toBe(404);
  });
});

describe("POST /companies", () => {
  test("Creates a new company", async () => {
    const newCompany = {
      code: "newco",
      name: "New Company",
      description: "A newly created company",
    };

    const res = await request(app)
      .post("/companies")
      .send(newCompany)
      .expect(201);

    expect(res.body).toHaveProperty("company");
    expect(res.body.company).toMatchObject(newCompany);
  });
});

describe("PUT /companies/:code", () => {
  test("Updates an existing company", async () => {
    const updatedInfo = {
      name: "Updated Company Name",
      description: "Updated company description",
    };

    const res = await request(app)
      .put(`/companies/int`)
      .send(updatedInfo)
      .expect(200);

    expect(res.body).toHaveProperty("company");
    expect(res.body.company).toMatchObject(updatedInfo);
  });

  test("Responds with 404 for non-existing company", async () => {
    const updatedInfo = {
      name: "Updated Company Name",
      description: "Updated company description",
    };

    const res = await request(app)
      .put(`/companies/nonexisting`)
      .send(updatedInfo)
      .expect(404);

    expect(res.body).toHaveProperty("error");
    expect(res.body.error.message).toBe(
      "Can't update company with code of nonexisting"
    );
  });
});

describe("DELETE /companies/:code", () => {
  test("Deletes an existing company", async () => {
    const res = await request(app).delete(`/companies/${testCompany.code}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ msg: "DELETED!" });
  });

  test("Responds with 404 for non-existing company", async () => {
    const res = await request(app).delete(`/companies/nonexisting`).expect(404);

    expect(res.body).toHaveProperty("error");
    expect(res.body.error.message).toBe("Can't find company nonexisting");
  });
});
