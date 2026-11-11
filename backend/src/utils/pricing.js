function date(value) {
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    throw new Error('Use dates in YYYY-MM-DD format.');
  }

  const parsed = new Date(value + 'T00:00:00Z');

  if (
    !Number.isFinite(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== value
  ) {
    throw new Error('Invalid date.');
  }

  return parsed;
}

function todayInIndia() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());

  const values = {};

  for (const part of parts) {
    if (part.type !== 'literal') {
      values[part.type] = part.value;
    }
  }

  return `${values.year}-${values.month}-${values.day}`;
}

// Calculate a quote for a NEW booking.
// Existing bookings must retain their stored total_amount.
function quote(equipment, start, end, land) {
  const startDate = date(start);
  const endDate = date(end);

  if (startDate > endDate) {
    throw new Error(
      'End date must be on or after start date.'
    );
  }

  if (start < todayInIndia()) {
    throw new Error(
      'The start date cannot be in the past.'
    );
  }

  const rate = Number(equipment.price);
  const acres = Number(land);

  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error('Equipment rate is invalid.');
  }

  if (
    !['per_acre', 'per_day'].includes(
      equipment.pricing_type
    )
  ) {
    throw new Error(
      'Equipment pricing unit is invalid.'
    );
  }

  if (
    !Number.isFinite(acres) ||
    acres <= 0 ||
    acres > 999999.99
  ) {
    throw new Error(
      'Enter a valid positive land size.'
    );
  }

  const quantity =
    equipment.pricing_type === 'per_acre'
      ? acres
      : (endDate - startDate) / 86400000 + 1;

  const total = Number(
    (rate * quantity).toFixed(2)
  );

  if (
    !Number.isFinite(total) ||
    total <= 0 ||
    total >= 1e10
  ) {
    throw new Error(
      'Booking amount is outside the supported range.'
    );
  }

  return total;
}

module.exports = { quote };