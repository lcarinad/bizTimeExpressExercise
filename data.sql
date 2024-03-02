DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS industries;
DROP TABLE IF EXISTS company_industries;

CREATE TABLE companies (
    code text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text
    
);

CREATE TABLE invoices (
    id serial PRIMARY KEY,
    comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
    amt float NOT NULL,
    paid boolean DEFAULT false NOT NULL,
    add_date date DEFAULT CURRENT_DATE NOT NULL,
    paid_date date,
    CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))
);

CREATE TABLE industries(
  code text NOT NULL PRIMARY KEY,
  industry text NOT NULL
);

CREATE TABLE company_industries(
  comp_code text NOT NULL REFERENCES companies(code),
  industry_code text NOT NULL REFERENCES industries(code),
  CONSTRAINT company_industries_pk PRIMARY KEY(comp_code, industry_code));




INSERT INTO companies
  VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
         ('ibm', 'IBM', 'Big blue.');

INSERT INTO invoices (comp_code, amt, paid, paid_date)
  VALUES ('apple', 100, false, null),
         ('apple', 200, false, null),
         ('apple', 300, true, '2018-01-01'),
         ('ibm', 400, false, null);

INSERT INTO industries
  VALUES('acct', 'accounting'), ('tech', 'technology'), ('it', 'information technology'), ('ml', 'machine learning');

INSERT INTO company_industries
  VALUES('apple', 'tech'), ('apple', 'ml');

--   SELECT c.code, c.name, c.description, i.industry FROM companies AS c LEFT JOIN company_industries AS ci ON c.code=ci.comp_code LEFT JOIN industries as i 
-- ON ci.industry_code=i.code WHERE c.code=$1