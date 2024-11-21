const createError = require('../utils/error')
const { default: axios } = require('axios')


//CHECK ACCOUNT  NUMBER
exports.checkAccountNumber = async (req, res, next) => {
  try {
    const { accountNumber } = req.body

    // const url = 'http://10.1.245.150:7081/v1/cbo/'
    const url= 'http://10.1.245.150:7081/v1/cbo/'
    const response = await axios.post(url, {
    
      AccountDetailsRequest: {
        ESBHeader: {
            serviceCode: "180000",
            channel: "USSD",
            Service_name: "accountEnquiryMC",
            Message_Id: "6255726662"
        },
        ACCTCOMPANYVIEWType: [
            {
                criteriaValue: accountNumber
            }
        ]
    }
    })
    console.log(response) 

    if (response?.data?.AccountDetailsResponse?.ESBStatus?.Status === 'Failure') {
      return next(createError.createError(404, 'Account number not found'))
    }
    return res.status(200).json({
      success: true,
      message: 'Valid account number',
      data:response?.data?.AccountDetailsResponse?.CustomerInfo
    })
  } catch (error) {
    console.log(error)
    return next(createError.createError(500, 'Internal Server Error'))
  }
}
