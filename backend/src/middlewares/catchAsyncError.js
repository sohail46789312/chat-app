export const catchAsyncError = func => (req, res, next) =>
    Promise.resolve(func(req, res, next))
        .catch(next)



export const catchError = func => (req, res, next) =>
    Promise.resolve(func(req, res, next))
        .catch(next)