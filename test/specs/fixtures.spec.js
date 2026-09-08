import { specsFromFixtures } from '../utils'

describe('fixtures', () => {
  describe('advanced', specsFromFixtures('advanced'))
  describe('basic', specsFromFixtures('basic'))
  describe('events', specsFromFixtures('events'))
  describe('grouped', specsFromFixtures('grouped'))
  describe('headersbox', specsFromFixtures('headersbox'))
  describe('issues', specsFromFixtures('issues'))
})
