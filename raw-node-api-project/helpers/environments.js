// module scaffolding
const environments = {};

//declare the types of environment variables
// staging environment
environments.staging = {
    port: 3000,
    envName: 'staging',
    secretKey: 'dummy345'
};

// production environment
environments.production = {
    port: 5000,
    envName: 'production',
    secretKey: 'dummy456'
};

// determine which environment was passed. if a string is passed to NODE_ENV take that value else take staging.
const currentEnvironment =
    typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : 'staging';


// export corresponding environment object. If an object exists in that name, take that else take staging.
const environmentToExport =
    typeof environments[currentEnvironment] === 'object'
        ? environments[currentEnvironment]
        : environments.staging;

// export module
module.exports = environmentToExport;