## Purpose

What the package provides as the `circlepack` chart type, and how it relates to the `treemap` chart type, live updates and the zoom plugin.

## ADDED Requirements

### Requirement: A circlepack chart type beside treemap

The package SHALL provide a `circlepack` chart type alongside `treemap`, and the treemap chart MUST NOT change.

#### Scenario: Script bundle

- **WHEN** the script bundle is loaded
- **THEN** both chart types are available without further registration

#### Scenario: Module build

- **WHEN** the module build is used
- **THEN** `circlepack` is available after registering its controller and element

#### Scenario: Existing treemap

- **WHEN** an existing treemap chart is rendered
- **THEN** its output is pixel-identical to the previous release

#### Scenario: Unregistering

- **WHEN** the circlepack controller is unregistered
- **THEN** treemap charts keep their tooltip position

### Requirement: Rectangle-only options have no effect

Options that only make sense for rectangles SHALL have no effect on a `circlepack` dataset and MUST NOT raise errors.

#### Scenario: Ignored options

- **WHEN** `rtl`, `unsorted`, `displayMode`, `borderRadius` or `captions` is set on a circlepack dataset
- **THEN** the chart is identical to one without it

#### Scenario: Per-side border width

- **WHEN** `borderWidth` is an object
- **THEN** no border is drawn

#### Scenario: Types

- **WHEN** such an option is written on a circlepack dataset in TypeScript
- **THEN** it is a type error

### Requirement: Live updates

Live updates SHALL behave as in the treemap chart.

#### Scenario: In-place edit

- **WHEN** data is edited in place and the chart is updated
- **THEN** the layout reflects the edit

#### Scenario: Nothing changed

- **WHEN** the chart is updated with nothing changed
- **THEN** the circles keep their positions and the nodes given to scriptable options are the same objects

### Requirement: Zoom plugin

The chart SHALL work with the zoom plugin.

#### Scenario: Equal zoom

- **WHEN** the chart is zoomed equally on both axes
- **THEN** circles stay round, grow, and stay tangent
- **THEN** spacing and border widths stay in pixels

#### Scenario: One-axis zoom

- **WHEN** the chart is zoomed on one axis only
- **THEN** circles are drawn as ellipses stretched on that axis and hit testing follows the ellipses
