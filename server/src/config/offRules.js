const offRules = {
  tremorThreshold: Number(process.env.TREMOR_THRESHOLD || 4),
  missedDoseMinutes: Number(process.env.MISSED_DOSE_MINUTES || 30),
  sensorRmsMultiplier: Number(process.env.SENSOR_RMS_MULTIPLIER || 2),
};

module.exports = { offRules };
