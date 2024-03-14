const aggregateWithPagination = (schema) => {
    // Define the static method for aggregation with pagination
    schema.statics.aggregateWithPagination = async function (pipeline, options, search) {
        try {
            // Extract pagination options
            let sort = '';
            if (options.sortBy) {
                const sortingCriteria = [];
                options.sortBy.split(',').forEach((sortOption) => {
                    const [key, order] = sortOption.split(':');
                    sortingCriteria.push((order === 'desc' ? '-' : '') + key);
                });
                sort = sortingCriteria.join(' ');
            } else {
                sort = 'createdAt';
            }

            const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
            const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
            const skip = (page - 1) * limit;

            const searchFilter = [...this.searchableFields()].map((field) => {
                return {
                  [field]: { $regex: search, $options: 'i' },
                };
              });
              // const searchFilter = {
              //   [field]: { $regex: search, $options: 'i' }
              // }
              const searchQuery = search ? { $or: searchFilter } : {};

            // Apply pagination to the aggregation pipeline
            const aggregationPipeline = [
                ...pipeline,
                { $match: searchQuery }, // Apply search filter
                {
                    $facet: {
                        totalCount: [{ $count: 'count' }],
                        data: [{ $skip: skip }, { $limit: limit }]
                    }
                }
            ];

            // Perform the aggregation
            const result = await this.aggregate(aggregationPipeline);

            // Extract total count and data from the result
            const [{ totalCount, data }] = result;

            // Extract the total count or set it to 0 if not present
            const totalResults = totalCount.length > 0 ? totalCount[0].count : 0;

            // Calculate the total number of pages
            const totalPages = Math.ceil(totalResults / limit);

            // Construct the response object
            const response = {
                data,
                page,
                limit,
                totalPages,
                totalResults
            };
            return response;
        } catch (error) {
            throw error;
        }
    };
};

// Export the plugin function
module.exports = aggregateWithPagination;
