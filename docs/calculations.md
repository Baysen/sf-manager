# Calculation Formulas Reference

## Production Rate Calculation
For each production line:
```
For each overclocking configuration:
  machinesAtSpeed = count
  speedMultiplier = percentage / 100
  production = baseRecipeOutput * machinesAtSpeed * speedMultiplier

Total production = sum of all overclocking configurations
```

## Power Consumption Calculation
```
For resource extractors:
  For each overclocking configuration:
    speedMultiplier = percentage / 100
    powerMultiplier = speedMultiplier ^ 1.6
    power = miner.power * count * powerMultiplier

For production machines:
  For each overclocking configuration:
    speedMultiplier = percentage / 100
    powerMultiplier = speedMultiplier ^ 1.6
    somersloopPowerMultiplier = 2 ^ somersloopCount
    power = recipe.powerConsumption * count * powerMultiplier * somersloopPowerMultiplier

For generators (if they consume power):
  For each overclocking configuration:
    speedMultiplier = percentage / 100
    powerMultiplier = speedMultiplier ^ 1.6
    power = generator.power_consumption * count * powerMultiplier

Total consumption = sum of all extraction + production + generator consumption
```

**Key Formula**: `powerMultiplier = speedMultiplier ^ 1.6`
- This is Satisfactory's official overclocking power curve
- Overclocking to 250% uses ~3.97x power, not 2.5x

## Somersloop Power Multiplier
```
somersloopPowerMultiplier = 2 ^ somersloopCount
```
- Each somersloop doubles power consumption
- 1 somersloop = 2x power, 2 somersloops = 4x power, etc.
- Combined multiplicatively with overclocking power multiplier

## Resource Balance Calculation
For each resource at a location:
```
Production = sum of all outputs of that resource from all production lines + resource extractions
Imports = sum of all exports from other locations where toLocationId matches this location
Consumption = sum of all inputs of that resource from all production lines
Exports = sum of all exports from this location for that resource
Net = Production + Imports - Consumption - Exports

Status:
  if Net > 0.1: "Surplus" (green)
  if Net < -0.1: "Deficit" (red)
  if -0.1 <= Net <= 0.1: "Balanced" (yellow)
```

## Export Calculation
```
availableSurplus = (Production + Imports) - Consumption

For percentage mode:
  exportAmount = (availableSurplus * percentage) / 100

For absolute mode:
  exportAmount = specifiedAmount
```

## Export Validation
```
totalExports = sum of all export amounts for a resource
availableSurplus = Production + Imports - Consumption

if mode == "percentage":
  totalPercentage = sum of all percentage values for a resource
  if totalPercentage > 100:
    INVALID: "Total export percentage exceeds 100%"

if mode == "absolute":
  if totalExports > availableSurplus:
    WARNING: "Exporting more than available surplus"
```

## Power Generation Calculation
```
For fuel-based generators (Biomass, Coal, Fuel, Nuclear):
  For each overclocking configuration:
    speedMultiplier = percentage / 100
    power = generator.base_power * count * speedMultiplier
  Total generation = sum of all overclocking configurations

For geothermal generators with variable power:
  If actualPower is provided (variable geothermal):
    For each overclocking configuration:
      speedMultiplier = percentage / 100
      power = actualPower * count * speedMultiplier
  Otherwise (fixed geothermal):
    Use base_power like fuel-based generators
```
