// responseUtils.js

function createSuccess(message) {
    return {
      success: true,
      message,
     };
  }
  
  module.exports = {
    createSuccess,
  };
  