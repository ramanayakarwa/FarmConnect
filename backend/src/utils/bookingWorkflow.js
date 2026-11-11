const transitions = {
  pending: ['accepted', 'rejected'],
  accepted: ['on_the_way'],
  on_the_way: ['arrived'],
  arrived: ['work_started'],
  work_started: ['completed'],
};

function mutation(booking, user, body) {
  const provider =
    user.role === 'provider' &&
    booking.owner_id === user.id;

  const farmer =
    user.role === 'farmer' &&
    booking.farmer_id === user.id;

  if (!provider && !farmer) {
    throw Object.assign(
      new Error('Access denied.'),
      { status: 403 }
    );
  }

  const keys = Object.keys(body);

  const isFeedbackSubmission =
    keys.length === 2 &&
    'feedback_rating' in body &&
    'feedback_text' in body;

  if (
    keys.length !== 1 &&
    !isFeedbackSubmission
  ) {
    throw new Error(
      'Submit one action at a time.'
    );
  }

  // Service status changes
  if (body.status) {
    const allowed = provider
      ? transitions[booking.status] || []
      : booking.status === 'pending'
        ? ['cancelled']
        : [];

    if (!allowed.includes(body.status)) {
      throw new Error(
        'Invalid booking transition. Refresh and try again.'
      );
    }

    const changes = {
      status: body.status,
      service_status: body.status,
    };

    if (body.status === 'completed') {
      changes.completed_at = new Date();
    }

    return changes;
  }

  // Provider confirms an actual payment received.
  if (body.payment_status === 'paid') {
    if (
      !provider ||
      booking.status !== 'completed' ||
      booking.payment_status === 'paid'
    ) {
      throw new Error(
        'Only the provider can confirm receipt after completion.'
      );
    }

    if (!(Number(booking.total_amount) > 0)) {
      throw new Error(
        'Correct the booking amount before confirming payment.'
      );
    }

    return {
      payment_status: 'paid',
      paid_at: new Date(),
    };
  }

  // Farmer submits feedback after completion and payment.
  if ('feedback_rating' in body) {
    if (
      !farmer ||
      booking.status !== 'completed' ||
      booking.payment_status !== 'paid' ||
      booking.feedback_rating
    ) {
      throw new Error(
        'Feedback is available once, after completion and payment.'
      );
    }

    if (
      !Number.isInteger(body.feedback_rating) ||
      body.feedback_rating < 1 ||
      body.feedback_rating > 5
    ) {
      throw new Error(
        'Choose a rating from 1 to 5.'
      );
    }

    if (
      body.feedback_text !== undefined &&
      typeof body.feedback_text !== 'string'
    ) {
      throw new Error('Invalid feedback.');
    }

    if ((body.feedback_text || '').length > 2000) {
      throw new Error(
        'Feedback must be at most 2000 characters.'
      );
    }

    return {
      feedback_rating: body.feedback_rating,
      feedback_text:
        (body.feedback_text || '').trim(),
      feedback_at: new Date(),
    };
  }

  throw new Error('Unknown action.');
}

module.exports = {
  mutation,
  transitions,
};