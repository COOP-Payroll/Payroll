const createError = require('../utils/error')
const { default: axios } = require('axios')
exports.checkAccountNumber = async (req, res, next) => {
  try {
    const { accountNumber } = req.body

    const url = 'http://10.1.245.150:7081/v1/cbo/'
    const response = await axios.post(url, {
      CustomerInfoRequest: {
        ESBHeader: {
          serviceCode: '040000',
          channel: 'USSD',
          Service_name: 'customerInfo',
          Message_Id: 'Mmr2qyutr82729'
        },
        CusomerInfo: {
          AccountId: accountNumber
        }
      }
    })

    if (response.data.CustomerInfoResponse.CustomerInfo.length === 0) {
      return next(createError.createError(404, 'Account number not found'))
    }
    return res.status(200).json({
      success: true,
      message: 'Valid account number',
      data:response.data.CustomerInfoResponse.CustomerInfo
    })
  } catch (error) {
    console.log(error)
    return next(createError.createError(500, 'Internal Server Error'))
  }
}
