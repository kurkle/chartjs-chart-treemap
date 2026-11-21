## Purpose

How one circle of a `circlepack` chart is drawn, labelled, hit by the pointer and animated.

## ADDED Requirements

### Requirement: Filled circle with an inner border

Each node SHALL be drawn as a filled circle with an optional border drawn inside its edge.

#### Scenario: Border

- **WHEN** `borderWidth` is 4
- **THEN** a 4 px ring in `borderColor` is drawn inside the circle and the fill covers the rest

#### Scenario: Scriptable colour

- **WHEN** `backgroundColor` is a function
- **THEN** it is called per circle with the node as `ctx.raw`

### Requirement: Labels inside the circle

A leaf's label SHALL be placed inside the square inscribed in its circle and obey the label options.

#### Scenario: Default placement

- **WHEN** `labels.display` is true
- **THEN** the label is centred in the circle

#### Scenario: Overflow

- **WHEN** the label does not fit and `labels.overflow` is `hidden`
- **THEN** no label is drawn
- **WHEN** `labels.overflow` is `fit`
- **THEN** the label is shrunk to fit
- **WHEN** `labels.overflow` is `ellipsis`
- **THEN** the label is truncated with an ellipsis

#### Scenario: Group

- **WHEN** a node is a group
- **THEN** no text is drawn for it

### Requirement: Round pointer interaction

Pointer interaction SHALL follow the round shape.

#### Scenario: Corner of the bounding box

- **WHEN** the pointer is in a corner of a circle's bounding box but outside the circle
- **THEN** the circle is not hovered and no tooltip is shown for it

#### Scenario: Leaf inside a group

- **WHEN** the pointer is over a leaf inside a group
- **THEN** both are active and the tooltip is anchored at the leaf's centre

#### Scenario: Hover styling

- **WHEN** a circle is hovered
- **THEN** its `hover*` options apply

### Requirement: Animation from the centre

Circles SHALL animate from and to their own centre.

#### Scenario: First render

- **WHEN** the chart first renders with animation
- **THEN** each circle grows from its centre

#### Scenario: Value change

- **WHEN** a value changes and the chart is updated
- **THEN** the circles move and resize smoothly to the new layout

#### Scenario: Added items

- **WHEN** items are added and the chart is updated
- **THEN** the new circles grow from their centres
