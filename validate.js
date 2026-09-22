// Small dependency-free request validation. Each field maps to an array of
// validator functions; every validator runs (so a single bad request
// reports all of its problems at once, not just the first).
export function validateBody(schema) {
  return (req, res, next) => {
    const errors = [];
    for (const [field, validators] of Object.entries(schema)) {
      for (const validate of validators) {
        const err = validate(req.body ? req.body[field] : undefined, req.body || {});
        if (err) {
          errors.push(err);
          break; // one error per field is enough
        }
      }
    }
    if (errors.length) return res.status(400).json({ error: errors[0], errors });
    next();
  };
}

export const rules = {
  required: (label) => (v) =>
    v === undefined || v === null || v === "" ? `${label} is required` : null,

  isString: (label, { min, max } = {}) => (v) => {
    if (v === undefined || v === null) return null;
    if (typeof v !== "string") return `${label} must be text`;
    if (min && v.trim().length < min) return `${label} must be at least ${min} characters`;
    if (max && v.length > max) return `${label} must be under ${max} characters`;
    return null;
  },

  isEmail: (label = "Email") => (v) => {
    if (v === undefined || v === null) return null;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : `${label} is not a valid email address`;
  },

  isStrongPassword: (label = "Password") => (v) => {
    if (v === undefined || v === null) return null;
    if (!/[a-zA-Z]/.test(v) || !/[0-9]/.test(v)) {
      return `${label} must include at least one letter and one number`;
    }
    return null;
  },

  isNumber: (label, { min, max } = {}) => (v) => {
    if (v === undefined || v === null) return null;
    const n = Number(v);
    if (Number.isNaN(n)) return `${label} must be a number`;
    if (min !== undefined && n < min) return `${label} must be at least ${min}`;
    if (max !== undefined && n > max) return `${label} must be at most ${max}`;
    return null;
  },

  isOneOf: (label, options) => (v) =>
    v === undefined || v === null || options.includes(v) ? null : `${label} must be one of: ${options.join(", ")}`,
};
