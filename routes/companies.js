"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const {
  BadRequestError,
  ExpressError
} = require("../expressError");
const {
  ensureAdmin
} = require("../middleware/auth");
const Company = require("../models/company");

const companyNewSchema = require("../schemas/companyNew.json");
const companyUpdateSchema = require("../schemas/companyUpdate.json");
const companySearchSchema = require("../schemas/companySearch.json");

const router = new express.Router();


/** POST / { company } =>  { company }
 *
 * company should be { handle, name, description, numEmployees, logoUrl }
 *
 * Returns { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: Admin
 */

router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, companyNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const company = await Company.create(req.body);
    return res.status(201).json({
      company
    });
  } catch (err) {
    return next(err);
  }
});

/** GET /  =>
 *   { companies: [ { handle, name, description, numEmployees, logoUrl }, ...] }
 *
 * Can filter on provided search filters:
 * - minEmployees
 * - maxEmployees
 * - nameLike (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  const query = req.query;
  if (query.minEmployees !== undefined) {
    query.minEmployees = Number(query.minEmployees);
  }
  if (query.maxEmployees !== undefined) {
    query.maxEmployees = Number(query.maxEmployees);
  }
  if (query.minEmployees > query.maxEmployees) {
    throw new ExpressError(`minEmployees cannot be greater than maxEmployees listed.`, 400);
  }
  try {
    const validator = jsonschema.validate(query, companySearchSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
    const companies = await Company.findAll(query);
    return res.json({
      companies
    });
  } catch (e) {
    return next(e);
  }
});

/** GET /[handle]  =>  { company }
 *
 *  Company is { handle, name, description, numEmployees, logoUrl, jobs }
 *   where jobs is [{ id, title, salary, equity }, ...]
 *
 * Authorization required: none
 */

router.get("/:handle", async function (req, res, next) {
  try {
    const company = await Company.get(req.params.handle);
    return res.json({
      company
    });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[handle] { fld1, fld2, ... } => { company }
 *
 * Patches company data.
 *
 * fields can be: { name, description, numEmployees, logo_url }
 *
 * Returns { handle, name, description, numEmployees, logo_url }
 *
 * Authorization required: Admin
 */

router.patch("/:handle", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, companyUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const company = await Company.update(req.params.handle, req.body);
    return res.json({
      company
    });
  } catch (e) {
    return next(e);
  }
});

/** DELETE /[handle]  =>  { deleted: handle }
 *
 * Authorization: Admin
 */

router.delete("/:handle", ensureAdmin, async function (req, res, next) {
  try {
    await Company.remove(req.params.handle);
    return res.json({
      deleted: req.params.handle
    });
  } catch (e) {
    return next(e);
  }
});


module.exports = router;