const pool = require('../config/database');

// ─── IMAGE HELPER ───────────────────────────────────────────────────────────

const attachImageUrl = (row, req) => {
  if (!row.image) {
    return row;
  }

  const uploadsMatch = row.image.match(/(\/uploads\/.+)$/);

  if (!uploadsMatch) {
    // External URL
    return row;
  }

  const path = uploadsMatch[1];
  const baseUrl = `${req.protocol}://${req.get('host')}`;

  return {
    ...row,
    image: `${baseUrl}${path}`,
  };
};

// ─── GET ALL EQUIPMENT ──────────────────────────────────────────────────────

const getEquipment = async (req, res, next) => {
  try {
    const {
      category,
      location,
      minPrice,
      maxPrice,
      availability,
    } = req.query;

    const conditions = [];
    const values = [];
    let idx = 1;

    // Category filter
    if (category) {
      conditions.push(`e.category ILIKE $${idx++}`);
      values.push(`%${category}%`);
    }

    // Location filter
    if (location) {
      conditions.push(`e.location ILIKE $${idx++}`);
      values.push(`%${location}%`);
    }

    // Minimum price
    if (minPrice) {
      conditions.push(`e.price >= $${idx++}`);
      values.push(Number(minPrice));
    }

    // Maximum price
    if (maxPrice) {
      conditions.push(`e.price <= $${idx++}`);
      values.push(Number(maxPrice));
    }

    // Availability
    if (
      availability !== undefined &&
      availability !== ''
    ) {
      conditions.push(`e.availability = $${idx++}`);
      values.push(availability === 'true');
    }

    const whereClause =
      conditions.length > 0
        ? `WHERE ${conditions.join(' AND ')}`
        : '';

    const query = `
      SELECT
        e.*,
        u.name AS owner_name,
        u.phone AS owner_phone,
        u.email AS owner_email
      FROM equipment e
      JOIN users u
        ON e.owner_id = u.id
      ${whereClause}
      ORDER BY e.created_at DESC
    `;

    const result = await pool.query(query, values);

    const data = result.rows.map((row) =>
      attachImageUrl(row, req)
    );

    return res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET EQUIPMENT BY ID ────────────────────────────────────────────────────

const getEquipmentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        e.*,
        u.name AS owner_name,
        u.phone AS owner_phone,
        u.email AS owner_email
      FROM equipment e
      JOIN users u
        ON e.owner_id = u.id
      WHERE e.id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found.',
      });
    }

    const data = attachImageUrl(
      result.rows[0],
      req
    );

    return res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

// ─── CREATE EQUIPMENT ───────────────────────────────────────────────────────

const createEquipment = async (req, res, next) => {
  try {
    if (req.user.role !== 'provider') {
      return res.status(403).json({
        success: false,
        message: 'Only providers can add equipment.',
      });
    }

    const {
      name,
      category,
      description,
      image,
      price,
      pricing_type,
      location,
      availability = true,
    } = req.body;

    const owner_id = req.user.id;

    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: 'name and price are required.',
      });
    }

    const numericPrice = Number(price);

    if (
      Number.isNaN(numericPrice) ||
      numericPrice <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a valid positive number.',
      });
    }

    if (!['per_acre', 'per_day'].includes(pricing_type)) {
      return res.status(400).json({
        success: false,
        message:
          'pricing_type must be either per_acre or per_day.',
      });
    }

    const result = await pool.query(
      `
      INSERT INTO equipment (
        name,
        category,
        description,
        image,
        price,
        pricing_type,
        location,
        availability,
        owner_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
      `,
      [
        name.trim(),
        category || null,
        description || null,
        image || null,
        numericPrice,
        pricing_type,
        location || null,
        availability,
        owner_id,
      ]
    );

    const data = attachImageUrl(
      result.rows[0],
      req
    );

    return res.status(201).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

// ─── UPDATE EQUIPMENT ───────────────────────────────────────────────────────

const updateEquipment = async (req, res, next) => {
  try {
    if (req.user.role !== 'provider') {
      return res.status(403).json({
        success: false,
        message: 'Only providers can manage equipment.',
      });
    }

    const { id } = req.params;
    const userId = req.user.id;

    const ownerCheck = await pool.query(
      `
      SELECT owner_id
      FROM equipment
      WHERE id = $1
      `,
      [id]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found.',
      });
    }

    if (ownerCheck.rows[0].owner_id !== userId) {
      return res.status(403).json({
        success: false,
        message:
          'Not authorised to update this equipment.',
      });
    }

    const {
      name,
      category,
      description,
      image,
      price,
      pricing_type,
      location,
      availability,
    } = req.body;

    // Validate price if supplied
    if (price !== undefined) {
      const numericPrice = Number(price);

      if (
        Number.isNaN(numericPrice) ||
        numericPrice <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            'Price must be a valid positive number.',
        });
      }
    }

    // Validate pricing type if supplied
    if (
      pricing_type !== undefined &&
      !['per_acre', 'per_day'].includes(pricing_type)
    ) {
      return res.status(400).json({
        success: false,
        message:
          'pricing_type must be either per_acre or per_day.',
      });
    }

    const result = await pool.query(
      `
      UPDATE equipment
      SET
        name = COALESCE($1, name),
        category = COALESCE($2, category),
        description = COALESCE($3, description),
        image = COALESCE($4, image),
        price = COALESCE($5, price),
        pricing_type = COALESCE($6, pricing_type),
        location = COALESCE($7, location),
        availability = COALESCE($8, availability)
      WHERE id = $9
      RETURNING *
      `,
      [
        name !== undefined
          ? name.trim()
          : null,

        category !== undefined
          ? category
          : null,

        description !== undefined
          ? description
          : null,

        image !== undefined
          ? image
          : null,

        price !== undefined
          ? Number(price)
          : null,

        pricing_type !== undefined
          ? pricing_type
          : null,

        location !== undefined
          ? location
          : null,

        availability !== undefined
          ? availability
          : null,

        id,
      ]
    );

    const data = attachImageUrl(
      result.rows[0],
      req
    );

    return res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE EQUIPMENT ───────────────────────────────────────────────────────

const deleteEquipment = async (req, res, next) => {
  try {
    if (req.user.role !== 'provider') {
      return res.status(403).json({
        success: false,
        message:
          'Only providers can delete equipment.',
      });
    }

    const { id } = req.params;
    const userId = req.user.id;

    const ownerCheck = await pool.query(
      `
      SELECT owner_id
      FROM equipment
      WHERE id = $1
      `,
      [id]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found.',
      });
    }

    if (ownerCheck.rows[0].owner_id !== userId) {
      return res.status(403).json({
        success: false,
        message:
          'Not authorised to delete this equipment.',
      });
    }

    await pool.query(
      `
      DELETE FROM equipment
      WHERE id = $1
      `,
      [id]
    );

    return res.json({
      success: true,
      message:
        'Equipment deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
};