## Purpose

How a `circlepack` dataset turns values into circles: their sizes, their arrangement, and how the arrangement is fitted to the area the dataset draws in.

## ADDED Requirements

### Requirement: Area proportional to value

Circles SHALL have areas proportional to their layout weight, with one scale for the whole dataset.

#### Scenario: Plain values

- **WHEN** a dataset has the values 4 and 1
- **THEN** the first circle's radius is twice the second's

#### Scenario: Value scale

- **WHEN** `valueScale` is `sqrt`
- **THEN** radii are proportional to the fourth root of the values
- **THEN** tooltips still show the raw values

### Requirement: Non-overlapping connected cluster

Sibling circles MUST NOT overlap and SHALL form one connected cluster.

#### Scenario: Touching circles

- **WHEN** `spacing` is 0
- **THEN** every circle touches at least one other circle and no two overlap

#### Scenario: Positive spacing

- **WHEN** `spacing` is 2
- **THEN** the gap between two neighbouring circles is 4 px

#### Scenario: Negative spacing

- **WHEN** `spacing` is negative
- **THEN** neighbouring circles overlap by twice that amount and may reach outside the dataset's area

### Requirement: Centred and fitted to the dataset area

The cluster SHALL be centred in the dataset's area and, in whichever of its two orientations fits better, scaled as large as that area allows without changing the arrangement. With a `spacing` of 0 or more no circle reaches outside the area.

#### Scenario: Single value

- **WHEN** the chart area is 512×256 and the dataset is `[1]`
- **THEN** one circle of diameter 256 is drawn at the centre of the chart area

#### Scenario: Orientation follows the area

- **WHEN** the dataset is `[1, 1]` in a wide area
- **THEN** the two circles sit side by side
- **WHEN** the same dataset is drawn in a tall area
- **THEN** one circle sits above the other

#### Scenario: Wide area

- **WHEN** many values are drawn in an area twice as wide as it is tall
- **THEN** the cluster is wider than it is tall and its circles are larger than they would be in a round cluster

#### Scenario: Region

- **WHEN** a dataset has a `region`
- **THEN** its cluster is centred in, and confined to, that region

#### Scenario: Resize

- **WHEN** the chart is resized
- **THEN** the cluster is fitted to the new area

### Requirement: Deterministic layout

The layout SHALL be deterministic.

#### Scenario: Same input twice

- **WHEN** the same data and options are charted twice
- **THEN** every circle has the same position and size in both charts

#### Scenario: Input order

- **WHEN** the same values are given in a different order
- **THEN** the arrangement of circle sizes is the same

### Requirement: Undrawable values

Values that cannot be drawn MUST NOT break the layout.

#### Scenario: Zero, negative or non-finite value

- **WHEN** a value is 0, negative, NaN or infinite
- **THEN** no circle is drawn for it and it cannot be hovered
- **THEN** the other circles are laid out as if it were absent

#### Scenario: Nothing to draw

- **WHEN** every value is such a value, or the data is empty
- **THEN** nothing is drawn and no error is raised
