/* eslint-disable no-unused-vars */

var statsByState = [
	{
		state: 'Alabama',
		code: 'AL',
		region: 'South',
		division: 'East South Central',
		income: 48123,
		population: 4887871
	},
	{
		state: 'Alaska',
		code: 'AK',
		region: 'West',
		division: 'Pacific',
		income: 73181,
		population: 737438
	},
	{
		state: 'Arizona',
		code: 'AZ',
		region: 'West',
		division: 'Mountain',
		income: 56581,
		population: 7171646
	},
	{
		state: 'Arkansas',
		code: 'AR',
		region: 'South',
		division: 'West South Central',
		income: 45869,
		population: 3013825
	},
	{
		state: 'California',
		code: 'CA',
		region: 'West',
		division: 'Pacific',
		income: 71805,
		population: 39557045
	},
	{
		state: 'Colorado',
		code: 'CO',
		region: 'West',
		division: 'Mountain',
		income: 69117,
		population: 5695564
	},
	{
		state: 'Connecticut',
		code: 'CT',
		region: 'Northeast',
		division: 'New England',
		income: 74168,
		population: 3572665
	},
	{
		state: 'Delaware',
		code: 'DE',
		region: 'South',
		division: 'South Atlantic',
		income: 62852,
		population: 967171
	},
	{
		state: 'District of Columbia',
		code: 'DC',
		region: 'South',
		division: 'South Atlantic',
		income: 82372,
		population: 702455
	},
	{
		state: 'Florida',
		code: 'FL',
		region: 'South',
		division: 'South Atlantic',
		income: 52594,
		population: 21299325
	},
	{
		state: 'Georgia',
		code: 'GA',
		region: 'South',
		division: 'South Atlantic',
		income: 56183,
		population: 10519475
	},
	{
		state: 'Hawaii',
		code: 'HI',
		region: 'West',
		division: 'Pacific',
		income: 77765,
		population: 1420491
	},
	{
		state: 'Idaho',
		code: 'ID',
		region: 'West',
		division: 'Mountain',
		income: 52225,
		population: 1754208
	},
	{
		state: 'Illinois',
		code: 'IL',
		region: 'Midwest',
		division: 'East North Central',
		income: 62992,
		population: 12741080
	},
	{
		state: 'Indiana',
		code: 'IN',
		region: 'Midwest',
		division: 'East North Central',
		income: 54181,
		population: 6691878
	},
	{
		state: 'Iowa',
		code: 'IA',
		region: 'Midwest',
		division: 'West North Central',
		income: 5857,
		population: 3156145
	},
	{
		state: 'Kansas',
		code: 'KS',
		region: 'Midwest',
		division: 'West North Central',
		income: 56422,
		population: 2911505
	},
	{
		state: 'Kentucky',
		code: 'KY',
		region: 'South',
		division: 'East South Central',
		income: 45215,
		population: 4468402
	},
	{
		state: 'Louisiana',
		code: 'LA',
		region: 'South',
		division: 'West South Central',
		income: 46145,
		population: 4659978
	},
	{
		state: 'Maine',
		code: 'ME',
		region: 'Northeast',
		division: 'New England',
		income: 55277,
		population: 1338404
	},
	{
		state: 'Maryland',
		code: 'MD',
		region: 'South',
		division: 'South Atlantic',
		income: 80776,
		population: 6042718
	},
	{
		state: 'Massachusetts',
		code: 'MA',
		region: 'Northeast',
		division: 'New England',
		income: 77385,
		population: 6902149
	},
	{
		state: 'Michigan',
		code: 'MI',
		region: 'Midwest',
		division: 'East North Central',
		income: 54909,
		population: 9995915
	},
	{
		state: 'Minnesota',
		code: 'MN',
		region: 'Midwest',
		division: 'West North Central',
		income: 68388,
		population: 5611179
	},
	{
		state: 'Mississippi',
		code: 'MS',
		region: 'South',
		division: 'East South Central',
		income: 43529,
		population: 2986530
	},
	{
		state: 'Missouri',
		code: 'MO',
		region: 'Midwest',
		division: 'West North Central',
		income: 53578,
		population: 6126452
	},
	{
		state: 'Montana',
		code: 'MT',
		region: 'West',
		division: 'Mountain',
		income: 53386,
		population: 1062305
	},
	{
		state: 'Nebraska',
		code: 'NE',
		region: 'Midwest',
		division: 'West North Central',
		income: 59970,
		population: 1929268
	},
	{
		state: 'New Hampshire',
		code: 'NH',
		region: 'Northeast',
		division: 'New England',
		income: 73381,
		population: 1356458
	},
	{
		state: 'New Jersey',
		code: 'NJ',
		region: 'Northeast',
		division: 'Middle Atlantic',
		income: 80088,
		population: 8908520
	},
	{
		state: 'New Mexico',
		code: 'NM',
		region: 'West',
		division: 'Mountain',
		income: 46744,
		population: 2095428
	},
	{
		state: 'New York',
		code: 'NY',
		region: 'Northeast',
		division: 'Middle Atlantic',
		income: 64894,
		population: 19542209
	},
	{
		state: 'Nevada',
		code: 'NV',
		region: 'West',
		division: 'Mountain',
		income: 58003,
		population: 3034392
	},
	{
		state: 'North Carolina',
		code: 'NC',
		region: 'South',
		division: 'South Atlantic',
		income: 52752,
		population: 10383620
	},
	{
		state: 'North Dakota',
		code: 'ND',
		region: 'Midwest',
		division: 'West North Central',
		income: 61843,
		population: 760077
	},
	{
		state: 'Ohio',
		code: 'OH',
		region: 'Midwest',
		division: 'East North Central',
		income: 54021,
		population: 11689442
	},
	{
		state: 'Oklahoma',
		code: 'OK',
		region: 'South',
		division: 'West South Central',
		income: 50051,
		population: 3943079
	},
	{
		state: 'Oregon',
		code: 'OR',
		region: 'West',
		division: 'Pacific',
		income: 60212,
		population: 4190713
	},
	{
		state: 'Pennsylvania',
		code: 'PA',
		region: 'Northeast',
		division: 'Middle Atlantic',
		income: 59105,
		population: 12807060
	},
	{
		state: 'Rhode Island',
		code: 'RI',
		region: 'Northeast',
		division: 'New England',
		income: 63870,
		population: 1057315
	},
	{
		state: 'South Carolina',
		code: 'SC',
		region: 'South',
		division: 'South Atlantic',
		income: 50570,
		population: 5084127
	},
	{
		state: 'South Dakota',
		code: 'SD',
		region: 'Midwest',
		division: 'West North Central',
		income: 56521,
		population: 882235
	},
	{
		state: 'Tennessee',
		code: 'TN',
		region: 'South',
		division: 'East South Central',
		income: 51340,
		population: 6770010
	},
	{
		state: 'Texas',
		code: 'TX',
		region: 'South',
		division: 'West South Central',
		income: 59206,
		population: 28701845
	},
	{
		state: 'Utah',
		code: 'UT',
		region: 'West',
		division: 'Mountain',
		income: 65358,
		population: 3161105
	},
	{
		state: 'Washington',
		code: 'WA',
		region: 'West',
		division: 'Pacific',
		income: 70979,
		population: 7535591
	},
	{
		state: 'Vermont',
		code: 'VT',
		region: 'Northeast',
		division: 'New England',
		income: 57513,
		population: 626299
	},
	{
		state: 'West Virginia',
		code: 'WV',
		region: 'South',
		division: 'South Atlantic',
		income: 43469,
		population: 1805832
	},
	{
		state: 'Virginia',
		code: 'VA',
		region: 'South',
		division: 'South Atlantic',
		income: 71535,
		population: 8517685
	},
	{
		state: 'Wisconsin',
		code: 'WI',
		region: 'Midwest',
		division: 'East North Central',
		income: 59305,
		population: 5813568
	},
	{
		state: 'Wyoming',
		code: 'WY',
		region: 'West',
		division: 'Mountain',
		income: 60434,
		population: 577737
	}
];
