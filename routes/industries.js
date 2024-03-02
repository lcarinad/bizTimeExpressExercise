const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res, next) => {
  try {
    const industryResults = await db.query(
      `SELECT i.code, i.industry, c.code AS companies FROM industries AS i LEFT JOIN company_industries AS ci ON i.code = ci.industry_code LEFT JOIN companies AS c ON ci.comp_code=c.code`
    );

    return res.json({ industries: industryResults.rows });
  } catch (e) {
    return next(e);
  }
});

router.post("/", async function (req, res, next) {
  try {
    let { code, industry } = req.body;

    const result = await db.query(
      `INSERT INTO industries (code, industry)
           VALUES ($1, $2)
           RETURNING code, industry`,
      [code, industry]
    );
    return res.status(201).json({ industry: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

router.post("/:code", async function (req, res, next) {
  try {
    let code = req.params.code;
    let { companyCode } = req.body;

    const industryResult = await db.query(
      `SELECT * FROM industries WHERE code = $1`,
      [code]
    );
    const companyResult = await db.query(
      `SELECT * FROM companies WHERE code = $1`,
      [companyCode]
    );
    if (industryResult.rows.length === 0) {
      throw new ExpressError(`Industry with code of ${code} does not exist`);
    }
    if (companyResult.rows.length === 0) {
      throw new ExpressError(
        `Company with code of ${companyCode} does not exist`
      );
    }
    const associationCheck = await db.query(
      `SELECT * FROM company_industries WHERE comp_code = $1 AND industry_code = $2`,
      [companyCode, code]
    );
    if (associationCheck.rows.length > 0) {
      throw new ExpressError(
        `Industry ${code} is already associated with company ${companyCode}`
      );
    }
    result = await db.query(
      `INSERT INTO company_industries (comp_code, industry_code) VALUES($1, $2) RETURNING *`,
      [companyCode, code]
    );
    return res.status(201).json({ company_industry: result.rows[0] });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
