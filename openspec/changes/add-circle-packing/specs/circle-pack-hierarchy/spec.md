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

A group circle SHALL leave a ring of `spacing` plus its border width between its edge and its members.

#### Scenario: Spacing and border

- **WHEN** `spacing` is 3 and `borderWidth` is 2
- **THEN** no member comes closer than about 3 px to the inside of the group's border

### Requirement: Leaf sizes comparable across groups

Leaf circles SHALL use one area scale across all groups; a group's size SHALL follow from its members.

#### Scenario: Equal values in different groups

- **WHEN** two leaves in different groups have the same value
- **THEN** their circles have the same radius

### Requirement: Shared data handling

Grouping, summing, value scaling and the "other" bucket SHALL behave as in the treemap chart.

#### Scenario: Other bucket

- **WHEN** `others.threshold` buckets small leaves
- **THEN** one circle stands for them and its tooltip names the count

#### Scenario: Sum keys

- **WHEN** `sumKeys` is set
- **THEN** each node carries those sums
