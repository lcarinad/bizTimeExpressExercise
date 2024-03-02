const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

let slugify = require("slugify");
router.get("/", async (req, res, next) => {
  try {
    const results = await db.query(`SELECT * FROM companies`);
    return res.json({ companies: results.rows });
  } catch (e) {
    return next(e);
  }
});

router.get("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const companyResults = await db.query(
      `SELECT * FROM companies WHERE code=$1`,
      [code]
    );
    const invoicesResult = await db.query(
      `SELECT id FROM invoices WHERE comp_code = $1`,
      [code]
    );
    const industryResult = await db.query(
      `SELECT * FROM company_industries WHERE comp_code=$1`,
      [code]
    );
    if (companyResults.rows.length === 0) {
      throw new ExpressError(`Can't find company with code of ${code}`, 404);
    }
    const company = companyResults.rows[0];

    const invoices = invoicesResult.rows;
    company.invoices = invoices.map((invoice) => invoice.id);

    const industries = industryResult.rows;
    company.industries = industries.map((i) => i.industry_code);

    return res.send({ company: company });
  } catch (e) {
    return next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { name, description } = req.body;
    let code = req.body.code;
    code = slugify(code, { lower: true, strict: true, trim: true });
    const results = await db.query(
      "INSERT INTO companies(code, name, description) VALUES($1, $2, $3) RETURNING code, name, description",
      [code, name, description]
    );
    return res.status(201).json({ company: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.put("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const { name, description } = req.body;
    const results = await db.query(
      `UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING *`,
      [name, description, code]
    );
    if (results.rows.length === 0) {
      throw new ExpressError(`Can't update company with code of ${code}`, 404);
    }
    return res.send({ company: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.delete("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const results = await db.query(`DELETE FROM companies WHERE code=$1`, [
      code,
    ]);
    if (results.rows.length === 0) {
      throw new ExpressError(`Can't find company ${code}`, 404);
    }
    return res.send({ msg: "DELETED!" });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
