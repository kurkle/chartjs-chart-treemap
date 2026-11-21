## Purpose

How grouped data is shown in a `circlepack` chart: groups as circles that enclose their members.

## ADDED Requirements

### Requirement: Groups enclose their members

With `groups`, each group SHALL be drawn as a circle enclosing its members, at every level.

#### Scenario: One group level

- **WHEN** data is grouped by one key
- **THEN** each group is a circle, its leaves are inside it, and group circles do not overlap

#### Scenario: Single member

- **WHEN** a group has one member
- **THEN** the group circle is concentric with the member and larger by the ring

#### Scenario: Three levels

- **WHEN** `groups` has three keys
- **THEN** circles nest three deep

### Requirement: Ring between a group and its members

A group circle SHALL leave a ring of `spacing` plus its border width, and never less than nothing, between its edge and its members, within 1 % of that width.

#### Scenario: Spacing and border

- **WHEN** `spacing` is 3 and `borderWidth` is 2
- **THEN** no member comes closer than 3 px, within 1 % of the 5 px ring, to the inside of the group's border

#### Scenario: Border from the chart options

- **WHEN** `borderWidth` is set for all circlepack datasets in the chart options instead of on the dataset
- **THEN** the ring is the same as when it is set on the dataset

#### Scenario: Negative spacing

- **WHEN** `spacing` is negative and larger in size than the border width
- **THEN** a group circle is no smaller than the circle enclosing its members

### Requirement: Leaf sizes comparable across groups

Leaf circles SHALL use one area scale across all groups; a group's size SHALL follow from its members and is not proportional to the group's value.

#### Scenario: Equal values in different groups

- **WHEN** two leaves in different groups have the same value
- **THEN** their circles have the same radius

#### Scenario: Groups of equal value

- **WHEN** one group has ten leaves of 1 and another has one leaf of 10
- **THEN** the first group's circle is the larger one

#### Scenario: Share of the group

- **WHEN** a scriptable option reads `ctx.raw.v / ctx.raw.gs` for a node inside a group
- **THEN** it gets the node's share of the total value of its group

### Requirement: Shared data handling

Grouping, summing, value scaling and the "other" bucket SHALL behave as in the treemap chart.

#### Scenario: Other bucket

- **WHEN** `others.threshold` buckets small leaves
- **THEN** one circle stands for them and its tooltip names the count

#### Scenario: Sum keys

- **WHEN** `sumKeys` is set
- **THEN** each node carries those sums
