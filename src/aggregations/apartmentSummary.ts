export const apartmentSummaryPipeline = [
  {
    $lookup: {
      from: 'users',
      localField: 'residents',
      foreignField: '_id',
      as: 'residentDetails'
    }
  },
  {
    $project: {
      name: 1,
      address: 1,
      issuesCount: 1,
      residents: '$residentDetails.firstName' // Include resident names
    }
  }
];
