exports.handleError = (res, error, message = 'Something went wrong')=> {
    res.status(error.statusCode || 500).json({
      success: false,
      message: message,
      error: error.message || error,
    });
  };
  