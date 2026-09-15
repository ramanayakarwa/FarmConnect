export const getEquipmentLocalImage = (equipment) => {
  const category = String(equipment?.category || '').trim().toLowerCase();
  const name = String(equipment?.name || '').trim().toLowerCase();

  if (category.includes('tractor') || name.includes('tractor')) {
    return require('../../assets/tractor.jpeg');
  }

  if (category.includes('rotavator') || name.includes('rotavator')) {
    return require('../../assets/rotavator.jpeg');
  }

  if (
    category.includes('seed') ||
    name.includes('seed drill') ||
    name.includes('seed')
  ) {
    return require('../../assets/seed_drill.jpeg');
  }

  if (
    category.includes('sprayer') ||
    name.includes('sprayer')
  ) {
    return require('../../assets/boom_sprayer.jpeg');
  }

  return require('../../assets/tractor.jpeg');
};